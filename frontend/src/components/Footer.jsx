import { Link } from 'react-router-dom';
import { Sparkles, Phone, Mail, MapPin, Clock } from 'lucide-react';

const Facebook = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Twitter = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Instagram = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-white font-extrabold text-2xl tracking-tight">
              <Sparkles className="h-6 w-6 text-sky-400" />
              <span>SparkleClean</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Premium professional cleaning services that make your home and workspace clean, comfortable, and completely stress-free.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-full bg-slate-800 hover:bg-sky-500 hover:text-white transition-all duration-200">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-slate-800 hover:bg-sky-500 hover:text-white transition-all duration-200">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-slate-800 hover:bg-sky-500 hover:text-white transition-all duration-200">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-sky-400 transition-colors">Home</Link></li>
              <li><Link to="/services" className="hover:text-sky-400 transition-colors">Our Services</Link></li>
              <li><Link to="/about" className="hover:text-sky-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-sky-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/booking" className="hover:text-sky-400 transition-colors font-medium text-sky-400">Book Online</Link></li>
              <li><Link to="/admin/login" className="hover:text-sky-400 transition-colors">Admin Login</Link></li>
            </ul>
          </div>

          {/* Services Offered */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Our Services</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/services" className="hover:text-sky-400 transition-colors">Regular House Cleaning</Link></li>
              <li><Link to="/services" className="hover:text-sky-400 transition-colors">Deep Cleaning</Link></li>
              <li><Link to="/services" className="hover:text-sky-400 transition-colors">Office Cleaning</Link></li>
              <li><Link to="/services" className="hover:text-sky-400 transition-colors">Move-In / Move-Out</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-base mb-4">Contact Us</h3>
            <div className="flex items-start space-x-2 text-sm text-slate-400">
              <Phone className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
              <span>+61 2 9876 5432</span>
            </div>
            <div className="flex items-start space-x-2 text-sm text-slate-400">
              <Mail className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
              <a href="mailto:info@sparkleclean.com" className="hover:text-sky-400 transition-colors">info@sparkleclean.com</a>
            </div>
            <div className="flex items-start space-x-2 text-sm text-slate-400">
              <MapPin className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
              <span>123 Sparkle Way, Sydney NSW 2000</span>
            </div>
            <div className="flex items-start space-x-2 text-sm text-slate-400">
              <Clock className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
              <div>
                <p>Mon - Fri: 8:00 AM - 6:00 PM</p>
                <p>Sat - Sun: 9:00 AM - 4:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 text-center text-xs text-slate-500">
          <p>© {currentYear} SparkleClean. All rights reserved. Professional cleaning services.</p>
        </div>
      </div>
    </footer>
  );
}
