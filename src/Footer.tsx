import { useNavigate } from 'react-router-dom';
import IndiBlobLogo from './IndiBlobLogo';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gradient-to-br from-indi-purple-50/50 via-white to-indi-pink-50/50 border-t border-indi-purple-100 py-12 md:py-16 mt-16">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 flex items-center justify-center hover:scale-110 transition-transform duration-300">
                <IndiBlobLogo size={48} />
              </div>
              <h3 className="font-headline font-bold text-xl sm:text-2xl bg-gradient-to-r from-indi-pink-500 via-indi-purple-500 to-indi-purple-600 bg-clip-text text-transparent">
                Indi Mapper
              </h3>
            </div>
            <p className="font-sans text-sm sm:text-base text-gray-600 max-w-md leading-relaxed">
              Visualize, monitor, and optimize your API integrations with our powerful mapping tool.
              Make your development workflow smarter and more efficient.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="font-sans text-sm sm:text-base text-gray-600 hover:text-indi-purple-600 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="font-sans text-sm sm:text-base text-gray-600 hover:text-indi-purple-600 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#download" className="font-sans text-sm sm:text-base text-gray-600 hover:text-indi-purple-600 transition-colors">
                  Download
                </a>
              </li>
              <li>
                <a
                  href="#download"
                  className="font-sans text-sm sm:text-base text-gray-600 hover:text-indi-purple-600 transition-colors"
                >
                  Get Started
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-sans font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#contact" className="font-sans text-sm sm:text-base text-gray-600 hover:text-indi-purple-600 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/help" className="font-sans text-sm sm:text-base text-gray-600 hover:text-indi-purple-600 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/docs" className="font-sans text-sm sm:text-base text-gray-600 hover:text-indi-purple-600 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="mailto:support@indimapper.com" className="font-sans text-sm sm:text-base text-gray-600 hover:text-indi-purple-600 transition-colors">
                  Email Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-indi-purple-100 pt-8">
          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="font-sans text-gray-600 text-xs sm:text-sm text-center md:text-left">
              © {new Date().getFullYear()} Indi Mapper. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <button
                onClick={() => navigate('/privacy-policy')}
                className="font-sans text-gray-600 hover:text-indi-purple-600 transition-colors"
              >
                Privacy Policy
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={() => navigate('/terms')}
                className="font-sans text-gray-600 hover:text-indi-purple-600 transition-colors"
              >
                Terms of Service
              </button>
              <span className="text-gray-300">•</span>
              <a href="#contact" className="font-sans text-gray-600 hover:text-indi-purple-600 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;