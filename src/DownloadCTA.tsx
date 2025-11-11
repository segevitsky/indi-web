import { Download, Chrome } from 'lucide-react';

export default function DownloadCTA() {
  const CHROME_EXTENSION_URL = 'https://chrome.google.com/webstore'; // TODO: Update with actual extension URL

  return (
    <section id="download" className="min-h-screen bg-gradient-to-br from-indi-purple-50 via-indi-pink-50 to-white py-16 sm:py-20 md:py-24 px-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-indi-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indi-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h2 className="font-headline font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 bg-gradient-to-r from-indi-pink-500 via-indi-purple-500 to-indi-purple-600 bg-clip-text text-transparent px-2">
            Get Started for Free
          </h2>
          <div className="flex justify-center items-center gap-2 mb-4 sm:mb-6">
            <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-transparent via-indi-purple-400 to-transparent rounded-full"></div>
            <div className="w-2 h-2 bg-indi-pink-500 rounded-full animate-pulse"></div>
            <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-transparent via-indi-pink-400 to-transparent rounded-full"></div>
          </div>
          <p className="font-sans text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed px-4">
            <span className="font-bold text-indi-purple-600">Changing the way dev teams work.</span> Start debugging smarter in under 60 seconds. Install once, get instant visibility into every API call.
            <span className="font-bold text-indi-purple-600"> Zero setup. Zero cost. Maximum impact.</span>
          </p>
        </div>

        {/* Main CTA Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border-2 sm:border-4 border-indi-purple-200 hover:border-indi-purple-300 transition-all duration-300 mb-8 sm:mb-12">
          {/* Chrome Icon */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indi-pink-500 via-indi-purple-500 to-indi-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
              <Chrome className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>

          <h3 className="font-headline font-bold text-2xl sm:text-3xl mb-3 sm:mb-4 text-gray-900">
            Available for Chrome
          </h3>
          <p className="font-sans text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Install the extension from the Chrome Web Store and start debugging smarter
          </p>

          {/* Download Button */}
          <a
            href={CHROME_EXTENSION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 font-sans font-bold text-base sm:text-xl bg-gradient-to-r from-indi-pink-500 via-indi-purple-500 to-indi-purple-600 text-white rounded-full shadow-2xl hover:shadow-indi-purple-400/50 hover:scale-105 transform transition-all duration-300 border-2 sm:border-4 border-white w-full sm:w-auto"
          >
            <Download className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-bounce" />
            Download Extension
            <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>

          {/* Free Badge */}
          <div className="mt-6 sm:mt-8 inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-full">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-sans font-bold text-sm sm:text-base text-green-700">100% Free • No Credit Card Required</span>
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
              className="p-5 sm:p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-indi-purple-100 hover:scale-105 transform transition-all duration-300"
            >
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{feature.icon}</div>
              <h4 className="font-headline font-bold text-lg sm:text-xl mb-1 sm:mb-2 text-gray-900">{feature.title}</h4>
              <p className="font-sans text-sm sm:text-base text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Support Note */}
        <div className="mt-8 sm:mt-12 text-center px-4">
          <p className="font-sans text-sm sm:text-base text-gray-500">
            More browsers coming soon • Need help? <a href="#contact" className="text-indi-purple-600 hover:text-indi-purple-700 font-semibold underline">Contact us</a>
          </p>
        </div>
      </div>
    </section>
  );
}
