import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String },
  price: { type: Number },
  quantity: { type: Number, default: 1 },
  image: { type: String },
  customImage: { type: String, default: '' },
  customNote: { type: String, default: '' },
  isPhotoFrame: { type: Boolean, default: false },
});

const TimelineEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: String, required: true },
  note: { type: String, required: true },
});

const OrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    customer: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '+91 7218700468' },
    address: { type: String, required: true },
    product: { type: String, default: '' },
    items: [OrderItemSchema],
    customImage: { type: String, default: '' },
    customNote: { type: String, default: '' },
    amount: { type: Number, required: true },
    status: { type: String, default: 'Confirmed' },
    payment: { type: String, default: 'Paid' },
    date: { type: String },
    estimatedDelivery: { type: String },
    trackingNumber: { type: String },
    timeline: [TimelineEventSchema],
  },
  { timestamps: true }
);

export const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);

