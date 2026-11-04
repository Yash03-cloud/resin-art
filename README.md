# Artvibe by Charu — Premium Handcrafted Resin Art Studio

A full-stack e-commerce web application converted to **Next.js (App Router)** and ready for instant deployment to **Vercel**, with all data stored exclusively in **MongoDB Atlas** (cloud database).

---

## 🚀 Key Updates & Features

1. **Converted to Next.js App Router**:
   - Replaced Vite + Express dual-server architecture with a unified, high-performance Next.js full-stack application.
   - All backend API endpoints are now native Next.js Route Handlers (`/api/*`), fully compatible with Vercel Serverless Functions.
   - Built-in SSR/SSG, optimized metadata, automatic code splitting, and responsive design.

2. **Database Migration & Complete JSON Removal**:
   - `database.json` and `store.js` have been completely removed.
   - All products, users (admin & customers), orders, custom commissions, reviews, contact messages, and promo coupons are stored exclusively in **MongoDB**.
   - All previous records (11 products, admin credentials, user accounts, orders, messages, coupons) have been migrated to MongoDB Atlas.

3. **Vercel-Ready**:
   - No external Node/Express server needed.
   - Ready to deploy directly from GitHub to Vercel in 1 click.

---

## 🛠️ Environment Variables for Vercel

When deploying to Vercel, configure these environment variables under **Project Settings → Environment Variables**:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://resin-art:resin-art07@cluster1.c2eapo6.mongodb.net/test?retryWrites=true&w=majority` |
| `WHATSAPP_NUMBER` | Support / WhatsApp Hotline | `7218700468` |
| `ADMIN_EMAIL` | Official Studio Admin Login Email | `admin@artvibe.in` |
| `ADMIN_PASSWORD` | Official Studio Admin Password | `Artvibe@2026` |
| `NEXT_PUBLIC_APP_URL` | Production Domain (Optional) | `https://your-domain.vercel.app` |

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
# App will run at http://localhost:3000

# 3. Test production build
npm run build
npm run start
```

---

## 🌐 Default Accounts

- **Studio Admin**:
  - Email: `admin@artvibe.in`
  - Password: `Artvibe@2026`
  - Access: Full Admin Dashboard (`/admin`), product creation, order management, status updates, live statistics.

- **Customer Login**:
  - Email: `yashshende544@gmail.com`
  - Password: `00000000`
  - Access: Order tracking, customer profile (`/dashboard`), wishlist, cart checkout.

- **New Customers**: Can register anytime via `/register` or recover password via `/forgot-password`. All updates persist directly to MongoDB.

---

## 📦 Deploying to Vercel

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Convert Vite app to Next.js with MongoDB storage and Vercel support"
   git push origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import your GitHub repository (`resin-art-github`).
4. Framework Preset will automatically be detected as **Next.js**.
5. Add the Environment Variables (`MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `WHATSAPP_NUMBER`).
6. Click **Deploy**. Your app is live! 🎉
