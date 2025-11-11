import IndiBlobLogo from "./IndiBlobLogo";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-indi-purple-100">
    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
        <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center hover:scale-110 transition-transform duration-300">
          <IndiBlobLogo size={40} />
        </div>
        <span className="font-headline font-bold text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-indi-pink-500 via-indi-purple-500 to-indi-purple-600 bg-clip-text text-transparent">
          Indi Mapper
        </span>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex space-x-4 lg:space-x-8">
        <a href="#home" className="font-sans font-medium text-sm lg:text-base text-gray-700 hover:text-indi-purple-600 transition-colors duration-200 hover:scale-105 transform">
          Home
        </a>
        <a href="#about" className="font-sans font-medium text-sm lg:text-base text-gray-700 hover:text-indi-purple-600 transition-colors duration-200 hover:scale-105 transform">
          About
        </a>
        <a href="#download" className="font-sans font-medium text-sm lg:text-base text-gray-700 hover:text-indi-purple-600 transition-colors duration-200 hover:scale-105 transform">
          Download
        </a>
        <a href="#contact" className="font-sans font-medium text-sm lg:text-base text-gray-700 hover:text-indi-purple-600 transition-colors duration-200 hover:scale-105 transform">
          Contact
        </a>
      </div>

      {/* Action Button */}
      <div className="flex items-center gap-3">
        <a
          href="#download"
          className="px-4 sm:px-6 py-2 sm:py-2.5 font-sans font-semibold text-sm sm:text-base bg-gradient-to-r from-indi-pink-500 via-indi-purple-500 to-indi-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 border-2 border-white"
        >
          Download Free
        </a>
      </div>
    </div>
  </nav>
  )
}
