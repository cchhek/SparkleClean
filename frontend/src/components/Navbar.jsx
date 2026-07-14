import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import { Sparkles, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const user = api.getUserFromStorage();
  const isAdmin = api.isAdmin();

  const handleLogout = () => {
    api.logout();
    setIsOpen(false);
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-sky-600 font-extrabold text-2xl tracking-tight">
              <Sparkles className="h-7 w-7 text-sky-500 animate-pulse" />
              <span>SparkleClean</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-sky-600 font-semibold'
                    : 'text-slate-600 hover:text-sky-600'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                  isActive('/admin/dashboard')
                    ? 'text-sky-600 font-semibold'
                    : 'text-slate-600 hover:text-sky-600'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {/* Auth CTA */}
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-slate-500" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/booking"
                className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-sky-100 hover:shadow-sky-200 hover:-translate-y-0.5 transition-all duration-200"
              >
                Book Now
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-500 hover:text-sky-600 p-2 rounded-md focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.path)
                  ? 'bg-sky-50 text-sky-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-sky-600'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                isActive('/admin/dashboard')
                  ? 'bg-sky-50 text-sky-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-sky-600'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Admin Dashboard</span>
            </Link>
          )}

          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-slate-500" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/booking"
                onClick={() => setIsOpen(false)}
                className="block text-center bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg text-base font-medium shadow-md shadow-sky-100 transition-all"
              >
                Book Now
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
