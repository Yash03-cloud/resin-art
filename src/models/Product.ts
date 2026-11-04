import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, default: 10 },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    images: { type: [String], default: [] },
    rating: { type: Number, default: 5.0 },
    reviews: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    dimensions: { type: String, default: '' },
    weight: { type: String, default: '' },
    material: { type: String, default: 'UV-Resistant Epoxy Resin & Teak Wood' },
    finish: { type: String, default: 'High Gloss Crystal Glass Finish' },
    care: { type: [String], default: [] },
    createdAt: { type: String },
  },
  { timestamps: true }
);

export const ProductModel: mongoose.Model<any> =
  mongoose.models.Product || mongoose.model('Product', ProductSchema);
