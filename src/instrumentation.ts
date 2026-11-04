export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { connectDB, isConnected } = await import('@/lib/db');
    try {
      await connectDB();
    } catch (err: any) {
      console.error('Initial MongoDB connection check failed:', err.message);
    }
  }
}

