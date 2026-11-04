import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './data/store.js';
import { connectDB, isConnected, getDbStatus } from './config/db.js';
import { ProductModel } from './models/Product.js';
import { OrderModel } from './models/Order.js';
import { CustomOrderModel } from './models/CustomOrder.js';
import { ContactModel } from './models/Contact.js';
import { ReviewModel } from './models/Review.js';
import { UserModel } from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '7218700468';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@artvibe.in').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Artvibe@2026';

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Prevent caching across tab closes and browsers
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB on startup and ensure collections are populated
connectDB()
  .then(async (connected) => {
    if (connected && isConnected()) {
      try {
        const pCount = await ProductModel.countDocuments();
        if (pCount === 0) {
          const storeData = db.read();
          if (storeData.products && storeData.products.length > 0) {
            console.log(`📦 Seeded ${storeData.products.length} products to newly connected MongoDB.`);
            await ProductModel.insertMany(storeData.products);
          }
        }
      } catch (seedErr) {
        console.warn('Initial sync notice:', seedErr.message);
      }
    }
  })
  .catch((err) => console.log('MongoDB initialization notice:', err.message));

// ========================
// HEALTH & DB STATUS
// ========================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Resin Art Studio API',
    version: '2.1.0',
    whatsapp: WHATSAPP_NUMBER,
    database: getDbStatus(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/db-status', (req, res) => {
  res.json({
    success: true,
    status: getDbStatus(),
    whatsappNumber: WHATSAPP_NUMBER,
  });
});

// ========================
// AUTHENTICATION ROUTES
// ========================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Studio Admin check (admin@artvibe.in or charu@artvibe.in or configured ADMIN_EMAIL)
  if (
    (cleanEmail === ADMIN_EMAIL || cleanEmail === 'admin@artvibe.in' || cleanEmail === 'charu@artvibe.in') &&
    password === ADMIN_PASSWORD
  ) {
    const adminUser = {
      id: 'admin-artvibe',
      name: 'Charu (Admin)',
      email: cleanEmail,
      role: 'admin',
      avatar: '/charu.jpg',
    };
    const token = `jwt_admin_${Date.now()}`;
    return res.json({
      success: true,
      message: 'Welcome back to Artvibe Studio, Charu! ⚡',
      user: adminUser,
      token,
    });
  }

  // 2. Check MongoDB for registered user
  if (isConnected()) {
    try {
      const mongoUser = await UserModel.findOne({ email: cleanEmail }).lean();
      if (mongoUser && mongoUser.password === password) {
        const { password: _, ...userWithoutPassword } = mongoUser;
        const token = `jwt_token_${mongoUser.id || mongoUser._id}_${Date.now()}`;
        return res.json({
          success: true,
          message: `Welcome back, ${mongoUser.name}!`,
          user: userWithoutPassword,
          token,
        });
      }
    } catch (e) {
      console.warn('MongoDB user login check error:', e.message);
    }
  }

  // 3. Fallback check in local JSON database
  const data = db.read();
  const user = (data.users || []).find((u) => u.email?.toLowerCase() === cleanEmail);

  if (user && user.password === password) {
    const { password: _, ...userWithoutPassword } = user;
    const token = `jwt_token_${user.id}_${Date.now()}`;
    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: userWithoutPassword,
      token,
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid email or password' });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === ADMIN_EMAIL || cleanEmail === 'admin@artvibe.in' || cleanEmail === 'charu@artvibe.in') {
    return res.status(400).json({ success: false, message: 'This email is reserved for Studio Administration' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    phone: phone ? String(phone).trim() : '',
    password,
    role: 'user',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=6B46C1&color=fff`,
    createdAt: new Date().toISOString().split('T')[0],
  };

  // Save to MongoDB if connected
  if (isConnected()) {
    try {
      const existing = await UserModel.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists' });
      }
      await UserModel.create(newUser);
    } catch (e) {
      console.warn('MongoDB user register error:', e.message);
    }
  }

  const data = db.read();
  if (!data.users) data.users = [];
  const existingJson = data.users.find((u) => u.email?.toLowerCase() === cleanEmail);
  if (existingJson) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists' });
  }

  data.users.push(newUser);
  db.write(data);

  const { password: _, ...userWithoutPassword } = newUser;
  const token = `jwt_token_${newUser.id}_${Date.now()}`;

  res.status(201).json({
    success: true,
    message: 'Account created successfully! Welcome to Artvibe by Charu.',
    user: userWithoutPassword,
    token,
  });
});

// ============================================
// FORGOT & RESET PASSWORD / ACCOUNT RECOVERY
// ============================================
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email, phone, newPassword } = req.body;
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';

  if (!cleanEmail && !cleanPhone) {
    return res.status(400).json({ success: false, message: 'Please provide either your registered email or phone number' });
  }

  let foundUser = null;

  // 1. Search MongoDB
  if (isConnected()) {
    try {
      if (cleanEmail) {
        foundUser = await UserModel.findOne({ email: cleanEmail }).lean();
      } else if (cleanPhone) {
        foundUser = await UserModel.findOne({ phone: { $regex: cleanPhone } }).lean();
      }
    } catch (e) {
      console.warn('MongoDB forgot-password lookup error:', e.message);
    }
  }

  // 2. Fallback search local JSON DB
  if (!foundUser) {
    const data = db.read();
    foundUser = (data.users || []).find((u) => {
      if (cleanEmail && u.email?.toLowerCase() === cleanEmail) return true;
      if (cleanPhone && (u.phone || '').replace(/\D/g, '').slice(-10) === cleanPhone) return true;
      return false;
    });
  }

  // Handle Admin account lookup
  if (cleanEmail === ADMIN_EMAIL || cleanEmail === 'admin@artvibe.in' || cleanEmail === 'charu@artvibe.in') {
    return res.json({
      success: true,
      isAdmin: true,
      name: 'Charu (Admin)',
      email: cleanEmail,
      message: 'Official Studio Admin Account. For security, admin passwords cannot be reset publicly. Please contact studio hotline.',
    });
  }

  if (!foundUser) {
    return res.status(404).json({
      success: false,
      message: 'No account found with this email or phone number. Check details or contact WhatsApp support.',
    });
  }

  // If newPassword is provided, reset it!
  if (newPassword) {
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    if (isConnected()) {
      try {
        await UserModel.findOneAndUpdate(
          { email: foundUser.email },
          { $set: { password: newPassword } }
        );
      } catch (e) {
        console.warn('MongoDB password reset error:', e.message);
      }
    }

    const data = db.read();
    const userInDb = (data.users || []).find((u) => u.email?.toLowerCase() === foundUser.email.toLowerCase());
    if (userInDb) {
      userInDb.password = newPassword;
      db.write(data);
    }

    return res.json({
      success: true,
      message: `Password reset successfully for ${foundUser.name}! You can now sign in with your new password. ✨`,
      email: foundUser.email,
    });
  }

  // Mask email for privacy if recovered by phone: rohit.verma@gmail.com -> r***a@gmail.com
  const maskEmail = (str) => {
    const [name, domain] = str.split('@');
    if (!domain) return str;
    const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
    return `${maskedName}@${domain}`;
  };

  return res.json({
    success: true,
    exists: true,
    name: foundUser.name,
    email: foundUser.email,
    maskedEmail: maskEmail(foundUser.email),
    phone: foundUser.phone,
    message: `Account found for ${foundUser.name}! You can now choose a new password.`,
  });
});

app.get('/api/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No authorization token provided' });
  }

  const data = db.read();
  const user = data.users[0];
  const { password: _, ...userWithoutPassword } = user;

  res.json({ success: true, user: userWithoutPassword });
});

app.put('/api/auth/profile', (req, res) => {
  const { id, name, phone, address } = req.body;
  const data = db.read();
  const userIndex = data.users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  data.users[userIndex] = {
    ...data.users[userIndex],
    ...(name && { name }),
    ...(phone && { phone }),
    ...(address && { address }),
  };

  db.write(data);
  const { password: _, ...userWithoutPassword } = data.users[userIndex];
  res.json({ success: true, user: userWithoutPassword, message: 'Profile updated successfully' });
});

// ========================
// PRODUCTS ROUTES
// ========================
app.get('/api/products', async (req, res) => {
  const { category, search, sort, minPrice, maxPrice } = req.query;

  // Try MongoDB if connected
  if (isConnected()) {
    try {
      const query = {};
      if (category && category !== 'All') {
        query.category = new RegExp(`^${category}$`, 'i');
      }
      if (search) {
        query.$or = [
          { title: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { category: new RegExp(search, 'i') },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      let sortOption = { createdAt: -1 };
      if (sort === 'price-asc') sortOption = { price: 1 };
      else if (sort === 'price-desc') sortOption = { price: -1 };
      else if (sort === 'rating') sortOption = { rating: -1 };
      else if (sort === 'best-selling') sortOption = { sold: -1 };
      else if (sort === 'featured') sortOption = { featured: -1, createdAt: -1 };

      const mongoProducts = await ProductModel.find(query).sort(sortOption).lean();
      return res.json({
        success: true,
        source: 'MongoDB',
        count: mongoProducts.length,
        products: mongoProducts,
      });
    } catch (e) {
      console.warn('MongoDB query fallback to JSON store:', e.message);
    }
  }

  // Fallback / File DB
  const data = db.read();
  let result = [...(data.products || [])];

  if (category && category !== 'All') {
    result = result.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  if (minPrice) {
    result = result.filter((p) => {
      const discounted = p.price - (p.price * (p.discount || 0)) / 100;
      return discounted >= Number(minPrice);
    });
  }
  if (maxPrice) {
    result = result.filter((p) => {
      const discounted = p.price - (p.price * (p.discount || 0)) / 100;
      return discounted <= Number(maxPrice);
    });
  }

  if (sort) {
    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price * (1 - (a.discount || 0) / 100) - b.price * (1 - (b.discount || 0) / 100));
        break;
      case 'price-desc':
        result.sort((a, b) => b.price * (1 - (b.discount || 0) / 100) - a.price * (1 - (a.discount || 0) / 100));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'best-selling':
        result.sort((a, b) => (b.sold || 0) - (a.sold || 0));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }
  }

  res.json({
    success: true,
    source: 'Local JSON Storage',
    count: result.length,
    products: result,
  });
});

app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  if (isConnected()) {
    try {
      const product = await ProductModel.findOne({ id }).lean();
      if (product) {
        const reviews = await ReviewModel.find({ productId: id }).lean();
        return res.json({ success: true, product, reviews });
      }
    } catch (e) {
      console.warn('MongoDB single fetch error:', e.message);
    }
  }

  const data = db.read();
  const product = (data.products || []).find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const reviews = data.reviews ? data.reviews.filter((r) => r.productId === id) : [];
  res.json({
    success: true,
    product,
    reviews,
  });
});

// Directly Add Product Card
app.post('/api/products', async (req, res) => {
  const {
    title,
    price,
    category,
    description,
    images,
    stock,
    discount,
    tags,
    featured,
    dimensions,
    weight,
    material,
    finish,
    care,
  } = req.body;

  if (!title || !price || !category) {
    return res.status(400).json({ success: false, message: 'Title, price, and category are required' });
  }

  const data = db.read();
  const uniqueId = `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  const imageList = Array.isArray(images) && images.length > 0 && images[0]?.trim()
    ? images
    : ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600'];

  const newProduct = {
    id: uniqueId,
    title: title.trim(),
    price: Number(price),
    discount: Number(discount) || 0,
    stock: stock !== undefined && !isNaN(Number(stock)) ? Number(stock) : 10,
    category: category.trim(),
    description: description?.trim() || 'Handcrafted bespoke resin art piece made with premium UV-resistant epoxy.',
    images: imageList,
    rating: 5.0,
    reviews: 0,
    sold: 0,
    featured: Boolean(featured),
    tags: Array.isArray(tags) ? tags : [category.toLowerCase()],
    dimensions: dimensions || '12" x 12" inches',
    weight: weight || '1.2 kg',
    material: material || 'UV-Resistant Epoxy Resin & Teak Wood',
    finish: finish || 'High Gloss Diamond Clear Finish',
    care: Array.isArray(care)
      ? care
      : [
          'Keep away from prolonged direct harsh sunlight',
          'Clean with soft dry microfiber cloth',
          'Avoid abrasive chemical cleaners',
        ],
    createdAt: new Date().toISOString(),
  };

  // Save to MongoDB if connected
  if (isConnected()) {
    try {
      await ProductModel.create(newProduct);
    } catch (e) {
      console.warn('Could not save to MongoDB, saving to JSON storage:', e.message);
    }
  }

  // Save to persistent JSON storage
  if (!data.products) data.products = [];
  data.products.unshift(newProduct);
  db.write(data);

  res.status(201).json({
    success: true,
    message: 'Product card created & published successfully! 🎨',
    product: newProduct,
  });
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  if (isConnected()) {
    try {
      await ProductModel.findOneAndUpdate({ id }, req.body, { new: true });
    } catch (e) {
      console.warn('MongoDB update product error:', e.message);
    }
  }

  const data = db.read();
  const index = (data.products || []).findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  data.products[index] = { ...data.products[index], ...req.body };
  db.write(data);

  res.json({
    success: true,
    message: 'Product card updated successfully',
    product: data.products[index],
  });
});

// Delete specific product
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  if (isConnected()) {
    try {
      await ProductModel.deleteOne({ id });
    } catch (e) {
      console.warn('MongoDB delete product error:', e.message);
    }
  }

  const data = db.read();
  const initialLength = (data.products || []).length;
  data.products = (data.products || []).filter((p) => p.id !== id);

  if (data.products.length === initialLength && !isConnected()) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  db.write(data);
  res.json({ success: true, message: 'Product deleted successfully' });
});

// Clear all demo products
app.delete('/api/products/actions/clear-demo', async (req, res) => {
  if (isConnected()) {
    try {
      await ProductModel.deleteMany({});
    } catch (e) {
      console.warn('MongoDB clear-demo error:', e.message);
    }
  }

  const data = db.read();
  const count = (data.products || []).length;
  data.products = [];
  db.write(data);

  res.json({
    success: true,
    message: `All demo products cleared successfully (${count} products removed). Ready for your own products! ✨`,
  });
});

// ========================
// REVIEWS ROUTES
// ========================
app.get('/api/reviews', async (req, res) => {
  const { productId } = req.query;

  if (isConnected()) {
    try {
      const query = productId ? { productId } : {};
      const reviews = await ReviewModel.find(query).sort({ createdAt: -1 }).lean();
      return res.json({ success: true, reviews });
    } catch (e) {
      console.warn('MongoDB reviews fetch error:', e.message);
    }
  }

  const data = db.read();
  const reviews = productId
    ? (data.reviews || []).filter((r) => r.productId === productId)
    : data.reviews || [];

  res.json({ success: true, reviews });
});

app.post('/api/reviews', async (req, res) => {
  const { productId, userName, rating, comment } = req.body;
  if (!productId || !userName || !comment) {
    return res.status(400).json({ success: false, message: 'Product ID, name, and comment are required' });
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    productId,
    userName,
    avatar: `https://i.pravatar.cc/60?u=${encodeURIComponent(userName)}`,
    rating: Number(rating) || 5,
    date: new Date().toISOString().split('T')[0],
    comment,
  };

  if (isConnected()) {
    try {
      await ReviewModel.create(newReview);
      const productReviews = await ReviewModel.find({ productId });
      const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
      await ProductModel.findOneAndUpdate(
        { id: productId },
        { rating: Number(avg.toFixed(1)), reviews: productReviews.length }
      );
    } catch (e) {
      console.warn('MongoDB review creation error:', e.message);
    }
  }

  const data = db.read();
  if (!data.reviews) data.reviews = [];
  data.reviews.unshift(newReview);

  // Recalculate product rating in JSON storage
  const product = (data.products || []).find((p) => p.id === productId);
  if (product) {
    const productReviews = data.reviews.filter((r) => r.productId === productId);
    const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    product.rating = Number(avg.toFixed(1));
    product.reviews = productReviews.length;
  }

  db.write(data);
  res.status(201).json({
    success: true,
    message: 'Review posted successfully! ⭐',
    review: newReview,
    updatedRating: product?.rating || 5.0,
  });
});

// ========================
// ORDERS & TRACKING ROUTES
// ========================
app.get('/api/orders', async (req, res) => {
  const { email, _customerId } = req.query;

  if (isConnected()) {
    try {
      const query = email ? { email: new RegExp(`^${email}$`, 'i') } : {};
      const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
      return res.json({ success: true, count: orders.length, orders });
    } catch (e) {
      console.warn('MongoDB orders fetch error:', e.message);
    }
  }

  const data = db.read();
  let orders = data.orders || [];

  if (email) {
    orders = orders.filter((o) => o.email?.toLowerCase() === email.toLowerCase());
  }

  res.json({ success: true, count: orders.length, orders });
});

app.get('/api/orders/:id', async (req, res) => {
  const { id } = req.params;

  if (isConnected()) {
    try {
      const order = await OrderModel.findOne({ id: new RegExp(`^${id}$`, 'i') }).lean();
      if (order) return res.json({ success: true, order });
    } catch (e) {
      console.warn('MongoDB single order fetch error:', e.message);
    }
  }

  const data = db.read();
  const order = (data.orders || []).find((o) => o.id.toUpperCase() === id.toUpperCase());

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found. Check order ID and try again.' });
  }

  res.json({ success: true, order });
});

app.post('/api/orders', async (req, res) => {
  const { customer, email, phone, address, items, paymentMethod, amount } = req.body;
  if (!items || !items.length || !address) {
    return res.status(400).json({ success: false, message: 'Items and delivery address are required' });
  }

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newOrderId = `ORD${randomSuffix}`;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().slice(0, 5);

  const firstCustomPhotoItem = (items || []).find((i) => i.customImage);
  const customImage = firstCustomPhotoItem?.customImage || req.body.customImage || '';
  const customNote = firstCustomPhotoItem?.customNote || req.body.customNote || '';

  const newOrder = {
    id: newOrderId,
    customer: customer || 'Customer',
    email: email || 'customer@resinart.studio',
    phone: phone || `+91 ${WHATSAPP_NUMBER}`,
    address,
    product: items[0]?.title + (items.length > 1 ? ` (+${items.length - 1} more items)` : ''),
    items,
    customImage,
    customNote,
    amount: Number(amount) || items.reduce((s, i) => s + i.price * i.quantity, 0),
    status: 'Confirmed',
    payment: 'Cash on Delivery (Pending)',
    date: dateStr,
    estimatedDelivery: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    trackingNumber: `BD${Math.floor(100000 + Math.random() * 900000)}IN`,
    timeline: [
      { status: 'Pending', date: `${dateStr} ${timeStr}`, note: 'Order placed by customer (Cash on Delivery)' },
      { status: 'Confirmed', date: `${dateStr} ${timeStr}`, note: 'Order confirmed and queued for handcrafting' },
    ],
  };

  if (isConnected()) {
    try {
      await OrderModel.create(newOrder);
    } catch (e) {
      console.warn('MongoDB order create error:', e.message);
    }
  }

  const data = db.read();
  if (!data.orders) data.orders = [];

  // Decrement stock in products
  items.forEach((item) => {
    const prod = (data.products || []).find((p) => p.id === item.id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
      prod.sold = (prod.sold || 0) + item.quantity;
    }
  });

  data.orders.unshift(newOrder);
  db.write(data);

  res.status(201).json({
    success: true,
    message: 'Order created successfully! 🎉',
    order: newOrder,
  });
});

app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const now = new Date();
  const newTimelineEvent = {
    status,
    date: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
    note: note || `Order updated to "${status}"`,
  };

  if (isConnected()) {
    try {
      const updatedMongoOrder = await OrderModel.findOneAndUpdate(
        { id: new RegExp(`^${id}$`, 'i') },
        { status, $push: { timeline: newTimelineEvent } },
        { new: true }
      ).lean();

      if (updatedMongoOrder) {
        return res.json({
          success: true,
          message: `Order status updated to "${status}"`,
          order: updatedMongoOrder,
        });
      }
    } catch (e) {
      console.warn('MongoDB order status update error:', e.message);
    }
  }

  const data = db.read();
  const order = (data.orders || []).find((o) => o.id?.toUpperCase() === id.toUpperCase());

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;
  if (!order.timeline) order.timeline = [];
  order.timeline.push(newTimelineEvent);

  db.write(data);
  res.json({
    success: true,
    message: `Order status updated to "${status}"`,
    order,
  });
});

// ========================
// CUSTOM ORDERS ROUTES
// ========================
app.get('/api/custom-orders', async (req, res) => {
  if (isConnected()) {
    try {
      const list = await CustomOrderModel.find({}).sort({ createdAt: -1 }).lean();
      return res.json({ success: true, customOrders: list });
    } catch (e) {
      console.warn('MongoDB custom orders fetch error:', e.message);
    }
  }

  const data = db.read();
  res.json({ success: true, customOrders: data.customOrders || [] });
});

app.post('/api/custom-orders', async (req, res) => {
  const {
    name,
    email,
    phone,
    productType,
    colorTheme,
    colorPreferences,
    dimensions,
    elements,
    designInstructions,
    budget,
    deadline,
  } = req.body;

  if (!name || !email || !designInstructions) {
    return res.status(400).json({ success: false, message: 'Name, email, and design instructions are required' });
  }

  const newCustomOrder = {
    id: `CUST-${Date.now().toString(36).toUpperCase()}`,
    name,
    email,
    phone: phone || `+91 ${WHATSAPP_NUMBER}`,
    productType: productType || 'Custom Resin Piece',
    colorTheme: colorPreferences || colorTheme || 'Custom Palette',
    dimensions: dimensions || 'Custom Size',
    elements: elements || 'Epoxy Resin',
    designInstructions,
    budget: budget || 'To be quoted',
    deadline: deadline || 'Flexible',
    status: 'In Review',
    createdAt: new Date().toISOString().split('T')[0],
  };

  if (isConnected()) {
    try {
      await CustomOrderModel.create(newCustomOrder);
    } catch (e) {
      console.warn('MongoDB custom order save error:', e.message);
    }
  }

  const data = db.read();
  if (!data.customOrders) data.customOrders = [];
  data.customOrders.unshift(newCustomOrder);
  db.write(data);

  res.status(201).json({
    success: true,
    message: 'Custom order request received! We will contact you within 12 hours. ✨',
    customOrder: newCustomOrder,
  });
});

// ========================
// CONTACT MESSAGES ROUTES
// ========================
app.get('/api/contact', async (req, res) => {
  if (isConnected()) {
    try {
      const messages = await ContactModel.find({}).sort({ createdAt: -1, _id: -1 }).lean();
      return res.json({ success: true, messages });
    } catch (e) {
      console.warn('MongoDB contact fetch error:', e.message);
    }
  }

  const data = db.read();
  res.json({ success: true, messages: data.contactMessages || [] });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
  }

  const now = new Date();
  const readableDate = now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ', ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const newMessage = {
    id: `msg-${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    phone: phone ? phone.trim() : `+91 ${WHATSAPP_NUMBER}`,
    subject: subject ? subject.trim() : 'General Inquiry',
    message: message.trim(),
    createdAt: readableDate,
    read: false,
  };

  if (isConnected()) {
    try {
      await ContactModel.create(newMessage);
    } catch (e) {
      console.warn('MongoDB contact save error:', e.message);
    }
  }

  const data = db.read();
  if (!data.contactMessages) data.contactMessages = [];
  data.contactMessages.unshift(newMessage);
  db.write(data);

  res.status(201).json({
    success: true,
    message: "Message sent! We'll respond within 24 hours. 🎨",
    contactMessage: newMessage,
  });
});

app.patch('/api/contact/:id/read', async (req, res) => {
  const { id } = req.params;
  const { read = true } = req.body;

  if (isConnected()) {
    try {
      await ContactModel.findOneAndUpdate({ id }, { $set: { read: Boolean(read) } });
    } catch (e) {
      console.warn('MongoDB contact read update error:', e.message);
    }
  }

  const data = db.read();
  const msg = (data.contactMessages || []).find((m) => m.id === id);
  if (msg) {
    msg.read = Boolean(read);
    db.write(data);
  }

  res.json({ success: true, message: `Message marked as ${read ? 'read' : 'unread'}` });
});

app.delete('/api/contact', async (req, res) => {
  if (isConnected()) {
    try {
      await ContactModel.deleteMany({});
    } catch (e) {
      console.warn('MongoDB contact clear error:', e.message);
    }
  }

  const data = db.read();
  data.contactMessages = [];
  db.write(data);

  res.json({ success: true, message: 'All contact messages deleted successfully' });
});

app.delete('/api/contact/:id', async (req, res) => {
  const { id } = req.params;

  if (isConnected()) {
    try {
      await ContactModel.findOneAndDelete({
        $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
      });
    } catch (e) {
      console.warn('MongoDB contact delete error:', e.message);
    }
  }

  const data = db.read();
  data.contactMessages = (data.contactMessages || []).filter((m) => m.id !== id && m._id !== id);
  db.write(data);

  res.json({ success: true, message: 'Message deleted successfully' });
});

// ========================
// COUPONS ROUTE
// ========================
app.post('/api/coupons/apply', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code is required' });
  }

  const data = db.read();
  const coupon = (data.coupons || []).find((c) => c.code.toUpperCase() === code.trim().toUpperCase());

  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Invalid coupon code. Try RESIN10' });
  }

  const discountAmount =
    coupon.type === 'percentage'
      ? Math.round((Number(subtotal) || 1000) * (coupon.discount / 100))
      : coupon.discount;

  res.json({
    success: true,
    code: coupon.code,
    discount: discountAmount,
    message: `Coupon ${coupon.code} applied successfully!`,
  });
});

// ========================
// ADMIN LIVE ANALYTICS
// ========================
app.get('/api/admin/stats', async (req, res) => {
  let ordersCount = 0;
  let revenue = 0;
  let productsCount = 0;
  let pendingOrders = 0;
  let customCount = 0;

  if (isConnected()) {
    try {
      const [orders, prods, custom] = await Promise.all([
        OrderModel.find({}).lean(),
        ProductModel.find({}).lean(),
        CustomOrderModel.find({}).lean(),
      ]);
      ordersCount = orders.length;
      revenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
      productsCount = prods.length;
      pendingOrders = orders.filter((o) => ['Pending', 'Confirmed', 'Processing', 'Creating Artwork'].includes(o.status)).length;
      customCount = custom.length;
    } catch (e) {
      console.warn('MongoDB stats calculate error:', e.message);
    }
  }

  const data = db.read();
  const jsonOrders = data.orders || [];
  const jsonProducts = data.products || [];
  const jsonCustom = data.customOrders || [];

  const totalOrders = Math.max(ordersCount, jsonOrders.length);
  const totalRevenue = Math.max(revenue, jsonOrders.reduce((sum, o) => sum + (o.amount || 0), 0));
  const totalProducts = Math.max(productsCount, jsonProducts.length);
  const totalCustom = Math.max(customCount, jsonCustom.length);

  res.json({
    success: true,
    database: getDbStatus(),
    stats: {
      totalRevenue: totalRevenue,
      totalOrders: totalOrders,
      pendingOrders: pendingOrders || jsonOrders.filter((o) => ['Pending', 'Confirmed', 'Processing', 'Creating Artwork'].includes(o.status)).length,
      deliveredOrders: jsonOrders.filter((o) => o.status === 'Delivered').length,
      totalProducts: totalProducts,
      totalCustomers: (data.users || []).filter((u) => u.role !== 'admin').length,
      customOrdersCount: totalCustom,
      recentOrders: (jsonOrders || []).slice(0, 6),
    },
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`\n==========================================`);
  console.log(`🚀 Resin Art Studio API Server running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🍃 DB Status: ${isConnected() ? 'MongoDB Connected' : 'Persistent File DB'}`);
  console.log(`💬 WhatsApp Support: +91 ${WHATSAPP_NUMBER}`);
  console.log(`✨ Health: http://localhost:${PORT}/api/health`);
  console.log(`==========================================\n`);
});
