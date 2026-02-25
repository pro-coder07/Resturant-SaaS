import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword, validatePhone } from '../utils/validators';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error: authError } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Restaurant name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    else if (!validatePhone(formData.phone)) newErrors.phone = 'Phone must be 10 digits';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!validatePassword(formData.password))
      newErrors.password = 'Password must have uppercase, lowercase, numbers (min 8 chars)';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <Link
        to="/login"
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 max-w-2xl mx-auto"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </Link>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Restaurant Account</h2>
          <p className="text-gray-600 mb-8">Start your journey with RestroMaxx today</p>

          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Restaurant Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Taj Mahal Restaurant"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Bellary"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="owner@restaurant.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="9876543210"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
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
                    className="absolute right-3 top-2.5 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
            >
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
