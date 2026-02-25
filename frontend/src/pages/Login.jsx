import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { validateEmail } from '../utils/validators';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await login(formData.email, formData.password, isStaff);
    if (success) {
      navigate(isStaff ? '/kitchen' : '/');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left side - Branding */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center px-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">RestroMaxx</h1>
        <p className="text-xl text-gray-600 mb-8">
          QR-based table ordering system for modern restaurants
        </p>
        <ul className="space-y-4 text-gray-700">
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            Real-time order management
          </li>
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            Kitchen dashboard integration
          </li>
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            Sales analytics & reports
          </li>
        </ul>
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Login</h2>

            {authError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role selector */}
              <div className="flex gap-4 mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={!isStaff}
                    onChange={() => setIsStaff(false)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Owner</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={isStaff}
                    onChange={() => setIsStaff(true)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Staff</span>
                </label>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-sm">New to RestroMaxx?</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Register link */}
            <Link
              to="/register"
              className="block w-full py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-center"
            >
              Create Restaurant Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
