import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
      <div className="text-center">
        <div className="text-8xl font-bold text-gradient font-playfair mb-4">404</div>
        <h2 className="font-playfair text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/" className="btn-primary">
          Go Home ✨
        </Link>
      </div>
    </div>
  );
}

