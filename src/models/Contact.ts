import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '+91 7218700468' },
    subject: { type: String, default: 'General Inquiry' },
    message: { type: String, required: true },
    createdAt: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ContactModel: mongoose.Model<any> =
  mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
