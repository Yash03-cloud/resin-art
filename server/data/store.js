import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.json');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@artvibe.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Artvibe@2026';

// Clean dataset without any demo users or demo data
export const initialData = {
  users: [
    {
      id: 'admin-artvibe',
      name: 'Charu (Admin)',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      avatar: '/charu.jpg',
      createdAt: new Date().toISOString().split('T')[0],
    },
  ],
  products: [],
  categories: [
    { id: '1', name: 'Wall Art', icon: '🎨', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600', count: 0 },
    { id: '2', name: 'Coasters', icon: '☕', image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600', count: 0 },
    { id: '3', name: 'Keychains', icon: '🔑', image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600', count: 0 },
    { id: '4', name: 'Jewellery', icon: '💍', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600', count: 0 },
    { id: '5', name: 'Photo Frames', icon: '🖼️', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=600', count: 0 },
    { id: '6', name: 'Personalized Gifts', icon: '🎁', image: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=600', count: 0 },
  ],
  orders: [],
  customOrders: [],
  reviews: [],
  contactMessages: [],
  coupons: [
    { code: 'RESIN10', discount: 10, type: 'percentage' },
  ],
};

class Store {
  constructor() {
    this.ensureDbExists();
  }

  ensureDbExists() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    }
  }

  read() {
    try {
      this.ensureDbExists();
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Error reading database file:', err);
      return initialData;
    }
  }

  write(data) {
    try {
      this.ensureDbExists();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error writing database file:', err);
      return false;
    }
  }
}

export const db = new Store();
