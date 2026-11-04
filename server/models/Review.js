import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    productId: { type: String, required: true },
    userName: { type: String, required: true },
    avatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    date: { type: String },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export const ReviewModel = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

