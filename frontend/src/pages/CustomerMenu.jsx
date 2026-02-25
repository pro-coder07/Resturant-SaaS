import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { customerAPI, menuAPI } from '../services/apiEndpoints';
import { ShoppingCart, Plus, Minus, Loader, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const qrCodeData = searchParams.get('table');

  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const { data: menuItems = [], loading } = useApi(
    () => menuAPI.getItems({ limit: 100 })
  );

  if (!qrCodeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid QR Code</h1>
          <p className="text-gray-600">Please scan a valid table QR code</p>
        </div>
      </div>
    );
  }

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c =>
        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(c =>
        c.id === itemId ? { ...c, quantity } : c
      ));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {cart.length > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {showCart ? (
          // Cart View
          <div>
            <button
              onClick={() => setShowCart(false)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Menu
            </button>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-gray-600">{formatCurrency(item.price)} each</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-semibold text-gray-900 w-20 text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="bg-white rounded-lg p-4 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center mb-4 text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Menu View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems?.items?.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-soft hover:shadow-md-soft transition overflow-hidden">
                {item.cloudinaryImageUrl && (
                  <img
                    src={item.cloudinaryImageUrl}
                    alt={item.name}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(item.price)}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      disabled={!item.isAvailable}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
