import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-white border-t border-gray-200 py-12 mt-16">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IM</span>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                INDI Mapper
              </h3>
            </div>
            <p className="text-gray-600 max-w-md">
              Visualize, monitor, and optimize your API integrations with our powerful mapping tool. 
              Make your development workflow smarter and more efficient.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-gray-600 hover:text-pink-500 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-600 hover:text-pink-500 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-600 hover:text-pink-500 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/login', { state: { register: true } })}
                  className="text-gray-600 hover:text-pink-500 transition-colors text-left"
                >
                  Get Started
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#contact" className="text-gray-600 hover:text-pink-500 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/help" className="text-gray-600 hover:text-pink-500 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/docs" className="text-gray-600 hover:text-pink-500 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="mailto:support@indimapper.com" className="text-gray-600 hover:text-pink-500 transition-colors">
                  Email Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-8">
          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="text-gray-600 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} INDI Mapper. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6 text-sm">
              <button 
                onClick={() => navigate('/privacy-policy')}
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                Privacy Policy
              </button>
              <span className="text-gray-300">•</span>
              <button 
                onClick={() => navigate('/terms')}
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                Terms of Service
              </button>
              <span className="text-gray-300">•</span>
              <a href="#contact" className="text-gray-600 hover:text-pink-500 transition-colors">
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