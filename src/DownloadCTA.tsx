import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import Blobi from './Blobi';


export default function DownloadCTA() {
  const [darkMode, setDarkMode] = useState(false);
  const CHROME_EXTENSION_URL = 'https://chrome.google.com/webstore'; // TODO: Update with actual extension URL

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setDarkMode(isDark);
    };
    checkDarkMode();
    const interval = setInterval(checkDarkMode, 100);
    return () => clearInterval(interval);
  }, []);

  

  return (
    <section id="download" className="min-h-screen bg-gray-50 dark:bg-black py-16 sm:py-20 md:py-24 px-4 relative overflow-hidden">
      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h2 className="font-headline font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 text-black dark:text-white px-2">
            Get Started for Free
          </h2>
          <div className="flex justify-center items-center gap-2 mb-4 sm:mb-6">
            <div className={`w-16 sm:w-20 h-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full`}></div>
            <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-90"></div>
            <div className={`w-16 sm:w-20 h-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full`}></div>
          </div>
          <p className="font-sans text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
            Changing the way dev teams work. Start debugging smarter in under 60 seconds. Install once, get instant visibility into every API call.
            Zero setup. Zero cost. Maximum impact.
          </p>
        </div>

        {/* Main CTA Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border-2 sm:border-4 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 mb-8 sm:mb-12">
          {/* Chrome Icon */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl opacity-90">
              <Blobi size={40} className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4" />
            </div>
          </div>

          <h3 className="font-headline font-bold text-2xl sm:text-3xl mb-3 sm:mb-4 text-black dark:text-white">
            Available for Chrome
          </h3>
          <p className="font-sans text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Install the extension from the Chrome Web Store and start debugging smarter
          </p>

          {/* Download Button */}
          <a
            href={CHROME_EXTENSION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 font-sans font-bold text-base sm:text-xl rounded-full shadow-2xl hover:scale-105 transform transition-all duration-300 border-2 sm:border-4 border-white opacity-90 hover:opacity-100 w-full sm:w-auto mr-4 dark:text-white"
          >
            <Download className="w-5 h-5 sm:w-6 sm:h-6" />
            Download Extension
            <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>

          {/* Free Badge */}
          <div className="mt-6 sm:mt-8 inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-50 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 rounded-full">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full opacity-90"></div>
            <span className="font-sans font-bold text-sm sm:text-base text-green-700 dark:text-green-400">100% Free • No Credit Card Required</span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: '⚡',
              title: 'Instant Setup',
              description: 'Install and start using in under 60 seconds'
            },
            {
              icon: '🔒',
              title: 'Privacy First',
              description: 'Your data stays local, no cloud storage'
            },
            {
              icon: '🎯',
              title: 'Always Free',
              description: 'Full features, unlimited use, forever'
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="p-5 sm:p-6 bg-white dark:bg-gray-900 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-800 hover:scale-105 transform transition-all duration-300"
            >
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 opacity-80">{feature.icon}</div>
              <h4 className="font-headline font-bold text-lg sm:text-xl mb-1 sm:mb-2 text-black dark:text-white">{feature.title}</h4>
              <p className="font-sans text-sm sm:text-base text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Support Note */}
        <div className="mt-8 sm:mt-12 text-center px-4">
          <p className="font-sans text-sm sm:text-base text-gray-500 dark:text-gray-500">
            More browsers coming soon • Need help? <a href="#contact" className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 font-semibold underline">Contact us</a>
          </p>
        </div>
      </div>
    </section>
  );
}
