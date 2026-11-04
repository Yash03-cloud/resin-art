import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discount: { type: Number, required: true },
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  },
  { timestamps: true }
);

export const CouponModel: mongoose.Model<any> =
  mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
