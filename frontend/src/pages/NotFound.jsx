import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-900">404</h1>
        <p className="text-2xl font-semibold text-gray-700 mt-4">Page Not Found</p>
        <p className="text-gray-600 mt-2 mb-8">The page you're looking for doesn't exist</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
