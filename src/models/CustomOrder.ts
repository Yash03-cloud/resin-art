import mongoose from 'mongoose';

const CustomOrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '+91 7218700468' },
    productType: { type: String, required: true },
    colorTheme: { type: String },
    dimensions: { type: String },
    elements: { type: String },
    designInstructions: { type: String, required: true },
    budget: { type: String, default: 'Flexible' },
    deadline: { type: String, default: 'Flexible' },
    status: { type: String, default: 'In Review' },
    createdAt: { type: String },
  },
  { timestamps: true }
);

export const CustomOrderModel: mongoose.Model<any> =
  mongoose.models.CustomOrder || mongoose.model('CustomOrder', CustomOrderSchema);
