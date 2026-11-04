import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ProductModel } from '@/models/Product';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    await connectDB();

    const query: any = {};
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

    let sortOption: any = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'best-selling') sortOption = { sold: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'featured') sortOption = { featured: -1, createdAt: -1 };

    const mongoProducts = await ProductModel.find(query).sort(sortOption).lean();

    return NextResponse.json({
      success: true,
      source: 'MongoDB',
      count: mongoProducts.length,
      products: mongoProducts,
    });
  } catch (error: any) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching products from MongoDB' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
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
    } = body;

    if (!title || !price || !category) {
      return NextResponse.json(
        { success: false, message: 'Title, price, and category are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const uniqueId = `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const imageList =
      Array.isArray(images) && images.length > 0 && images[0]?.trim()
        ? images
        : ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600'];

    const newProduct = {
      id: uniqueId,
      title: title.trim(),
      price: Number(price),
      discount: Number(discount) || 0,
      stock: stock !== undefined && !isNaN(Number(stock)) ? Number(stock) : 10,
      category: category.trim(),
      description:
        description?.trim() ||
        'Handcrafted bespoke resin art piece made with premium UV-resistant epoxy.',
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

    await ProductModel.create(newProduct);

    return NextResponse.json(
      {
        success: true,
        message: 'Product card created & published successfully! 🎨',
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Product create error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error creating product' },
      { status: 500 }
    );
  }
}

