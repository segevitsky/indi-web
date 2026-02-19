import { useEffect, useState } from "react";
import IndiBlobLogo from "./IndiBlobLogo";
import { Download, LayoutDashboard } from "lucide-react";

export default function Navbar({ inScrollMode, setInScrollMode }: { inScrollMode: boolean; setInScrollMode: (value: boolean) => void }) {
  const [darkMode, setDarkMode] = useState(false);

  console.log({ inScrollMode, setInScrollMode });

  useEffect(() => {
    // Check if dark mode is already set in localStorage
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
    if (savedMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleDownload = () => {
    window.open('https://chromewebstore.google.com/detail/indi-mapper-developer-too/fhjekmbfchnehkoplcpmdgeabgimgcna', '_blank');
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 dark:bg-black/95 backdrop-blur-md z-[100] border-b border-gray-200 dark:border-gray-800">
    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
        <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center hover:scale-110 transition-transform duration-300">
          <IndiBlobLogo size={40} />
        </div>
        <span className="font-headline font-bold text-lg sm:text-xl md:text-2xl text-black dark:text-white">
          Indi Mapper
        </span>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex space-x-4 lg:space-x-8">
        <a href="#home" onClick={() => setInScrollMode(true)} className="font-sans font-medium text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200 hover:scale-105 transform">
          Home
        </a>
        <a href="#about" onClick={() => setInScrollMode(true)} className="font-sans font-medium text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200 hover:scale-105 transform">
          About
        </a>
        <a href="#download" onClick={() => setInScrollMode(true)} className="font-sans font-medium text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200 hover:scale-105 transform">
          Download
        </a>
        <a href="#contact" onClick={() => setInScrollMode(true)} className="font-sans font-medium text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200 hover:scale-105 transform">
          Contact
        </a>
        <a href="/login" className="font-sans font-medium text-sm lg:text-base text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200 hover:scale-105 transform">
          Dashboard
        </a>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 sm:p-3 rounded-full shadow-lg transition-all hover:scale-110 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700"
          aria-label="Toggle dark mode"
        >
          <span className="text-lg sm:text-2xl">{darkMode ? '☀️' : '🌙'}</span>
        </button>

        <a
          href="/login"
          className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 font-sans font-semibold text-sm sm:text-base rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 border-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400 bg-transparent"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </a>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 font-sans font-semibold text-sm sm:text-base rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  </nav>
  )
}
