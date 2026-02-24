import { useEffect, useState, useRef } from 'react';
import About from './About';
import ContactUs from './ContactUs';
import FloatingIndicators from './Floatingindicators';
import Navbar from './Navbar';
import DownloadCTA from './DownloadCTA';
import Footer from './Footer';
import Blobi from './Blobi';

// Helper Components from indi-website
const BrowserMock = ({ children, dark = false, pulse = false }: { children: React.ReactNode; dark?: boolean; pulse?: boolean }) => (
  <div
    className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl overflow-hidden border-[3px] ${dark ? 'border-purple-500/70' : 'border-gray-900/40'} w-full max-w-3xl mx-auto ${pulse ? 'animate-pulse-slow' : ''}`}
    style={{
      transform: 'rotate(-0.5deg)',
      boxShadow: dark
        ? '8px 8px 0px rgba(139, 92, 246, 0.3), 12px 12px 20px rgba(0, 0, 0, 0.5)'
        : '6px 6px 0px rgba(0, 0, 0, 0.1), 10px 10px 30px rgba(0, 0, 0, 0.15)',
    }}
  >
    <div className={`${dark ? 'bg-gray-900' : 'bg-gray-900'} px-4 py-3 flex items-center gap-2`}>
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-700" style={{ transform: 'rotate(2deg)' }} />
        <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-yellow-700" style={{ transform: 'rotate(-1deg)' }} />
        <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-700" style={{ transform: 'rotate(1deg)' }} />
      </div>
      <div className="flex-1 bg-gray-800 rounded px-3 py-1.5 text-xs text-gray-300 font-mono border border-gray-700" style={{ transform: 'rotate(-0.3deg)' }}>
        your-app.com
      </div>
    </div>
    <div className={`p-6 sm:p-8 ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>{children}</div>
  </div>
);

const APIIndicator = ({ status, extraPulse = false }: { status: 'fast' | 'slow' | 'error'; extraPulse?: boolean }) => {
  const colors = { fast: 'bg-green-500 shadow-green-500/50', slow: 'bg-yellow-500 shadow-yellow-500/50', error: 'bg-red-500 shadow-red-500/50' };
  return <div className={`absolute top-2 right-2 w-3 h-3 sm:w-4 sm:h-4 rounded-full ${colors[status]} ${extraPulse ? 'animate-ping' : 'animate-pulse'} shadow-lg`} />;
};


export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideEntered, setSlideEntered] = useState(false);
  const [inScrollMode, setInScrollMode] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const totalSlides = 5;
  const scrollSectionRef = useRef<HTMLDivElement>(null);

  // Sync with Navbar dark mode and localStorage
  useEffect(() => {
    // Check localStorage first
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
    if (savedMode) {
      document.documentElement.classList.add('dark');
    }

    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setDarkMode(isDark);
    };

    const interval = setInterval(checkDarkMode, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSlideEntered(false);
    const timer = setTimeout(() => setSlideEntered(true), 100);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // If there's a hash, skip to scroll mode
      setInScrollMode(true);
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (inScrollMode) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      if (isTransitioning) return;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (e.deltaY > 0 && currentSlide < totalSlides - 1) {
          nextSlide();
        } else if (e.deltaY > 0 && currentSlide === totalSlides - 1) {
          enterScrollMode();
        } else if (e.deltaY < 0 && currentSlide > 0) {
          prevSlide();
        }
      }, 50);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;

      if ((e.key === 'ArrowDown' || e.key === 'ArrowRight') && currentSlide < totalSlides - 1) {
        nextSlide();
      } else if ((e.key === 'ArrowDown' || e.key === 'ArrowRight') && currentSlide === totalSlides - 1) {
        enterScrollMode();
      } else if ((e.key === 'ArrowUp' || e.key === 'ArrowLeft') && currentSlide > 0) {
        prevSlide();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(scrollTimeout);
    };
  }, [currentSlide, isTransitioning, inScrollMode]);

  // Handle touch events for mobile
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
    setTouchEnd(e.targetTouches[0].clientY);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent default scroll behavior on mobile
    e.preventDefault();
    setTouchEnd(e.targetTouches[0].clientY);
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (isTransitioning) return;

    const minSwipeDistance = 50;
    const verticalDistance = touchStart - touchEnd;
    const horizontalDistance = touchStartX - touchEndX;

    // Check if swipe is more vertical or horizontal
    const isVerticalSwipe = Math.abs(verticalDistance) > Math.abs(horizontalDistance);

    if (isVerticalSwipe) {
      // Vertical swipe logic
      const isSwipeDown = verticalDistance > minSwipeDistance;
      const isSwipeUp = verticalDistance < -minSwipeDistance;

      if (isSwipeDown && currentSlide < totalSlides - 1) {
        nextSlide();
      } else if (isSwipeDown && currentSlide === totalSlides - 1) {
        enterScrollMode();
      } else if (isSwipeUp && currentSlide > 0) {
        prevSlide();
      }
    } else {
      // Horizontal swipe logic
      const isSwipeLeft = horizontalDistance > minSwipeDistance;
      const isSwipeRight = horizontalDistance < -minSwipeDistance;

      if (isSwipeLeft && currentSlide < totalSlides - 1) {
        nextSlide();
      } else if (isSwipeLeft && currentSlide === totalSlides - 1) {
        enterScrollMode();
      } else if (isSwipeRight && currentSlide > 0) {
        prevSlide();
      }
    }
  };

  const nextSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide(prev => Math.max(prev - 1, 0));
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const enterScrollMode = () => {
    setInScrollMode(true);
    setTimeout(() => {
      scrollSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const getSlideTransform = (slideIndex: number) => {
    if (inScrollMode) return { opacity: 0, transform: 'translateY(-100px)', transition: 'all 0.8s' };

    const diff = slideIndex - currentSlide;
    return {
      opacity: diff === 0 ? 1 : 0,
      transform: diff === 0 ? 'translateY(0)' : `translateY(${diff * 30}px)`,
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  const backToSlides = () => {
    setInScrollMode(false);
    setCurrentSlide(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


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
    <div className={`min-h-screen w-full relative overflow-x-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'} ${inScrollMode ? 'overflow-y-auto' : 'overflow-y-hidden'}`}>
      {inScrollMode && <Navbar inScrollMode={inScrollMode} setInScrollMode={setInScrollMode} />}

      {/* Dark Mode Toggle (shown during slides) */}
      {!inScrollMode && (
        <button
          onClick={toggleDarkMode}
          className={`fixed top-2 left-2 z-50 p-1 rounded-full shadow-2xl transition-all hover:scale-110 ${darkMode ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white text-gray-900 hover:bg-gray-100'} border-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}
          aria-label="Toggle dark mode"
        >
          <span className="text-xl sm:text-2xl">{darkMode ? '☀️' : '🌙'}</span>
        </button>
      )}

      {/* Download Button (shown during slides) */}
      {!inScrollMode && (
        <button
          onClick={handleDownload}
          className={`fixed top-2 right-2 z-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-2xl transition-all hover:scale-105 font-bold text-xs sm:text-sm flex items-center gap-1 sm:gap-2 ${darkMode ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900'} border-2 ${darkMode ? 'border-white' : 'border-black'}`}
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="hidden sm:inline">Download Now</span>
        </button>
      )}

      {/* Skip to Website Button (shown during slides) */}
      {!inScrollMode && (
        <button
          onClick={() => setInScrollMode(true)}
          className={`opacity-40 fixed bottom-6 right-6 z-50 px-6 xs:py-0 sm:py-3 rounded-full shadow-2xl transition-all hover:scale-105 font-bold text-sm flex items-center gap-2 ${darkMode ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900'} border-2 ${darkMode ? 'border-white' : 'border-black'}`}
        >
          Skip →
        </button>
      )}

      {/* Back to Slides Button (shown in scroll mode) */}
      {inScrollMode && (
        <button
          onClick={backToSlides}
          className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-full shadow-2xl transition-all hover:scale-105 font-bold text-sm flex items-center gap-2 ${darkMode ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900'} border-2 ${darkMode ? 'border-white' : 'border-black'}`}
        >
          ↑ Slides
        </button>
      )}

      {/* Slide Presentation Container */}
      <div
        className={`${inScrollMode ? 'hidden' : 'block'} overflow-hidden touch-none`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        {/* Navigation Arrows - Hidden on mobile */}
        {currentSlide > 0 && (
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className={`xs:hidden md:flex fixed left-6 bottom-6 z-40 w-10 h-10 rounded-full ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-900 hover:bg-gray-100'} hover:scale-110 transition-all disabled:opacity-50 border-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'} text-xl items-center justify-center shadow-lg`}
            id='arrow-left'
          >
            ‹
          </button>
        )}
        {currentSlide < totalSlides - 1 && (
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className={`xs:hidden md:flex fixed left-20 bottom-6 z-40 w-10 h-10 rounded-full ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-900 hover:bg-gray-100'} hover:scale-110 transition-all disabled:opacity-50 border-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'} text-xl items-center justify-center shadow-lg`}
          >
            ›
          </button>
        )}

        {/* Slide Indicators */}
        <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-2 sm:gap-3">
          {[...Array(totalSlides)].map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true);
                  setCurrentSlide(i);
                  setTimeout(() => setIsTransitioning(false), 1000);
                }
              }}
              className={`h-2 sm:h-3 rounded-full transition-all ${currentSlide === i ? (darkMode ? 'bg-purple-500 w-8 sm:w-10' : 'bg-purple-600 w-8 sm:w-10') : (darkMode ? 'bg-gray-600 w-2 sm:w-3' : 'bg-gray-400 w-2 sm:w-3')} hover:scale-125`}
            />
          ))}
        </div>

        {/* Slides Container */}
        <div className="h-screen w-full relative overflow-hidden">
          {/* Geometric Background Shapes */}
          {!inScrollMode && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
              {/* Large Circle - Top Right */}
              <div
                className={`absolute top-10 right-10 w-96 h-96 rounded-full ${darkMode ? 'bg-purple-500/20' : 'bg-purple-500/15'} blur-xl animate-float`}
              />

              {/* Medium Square - Bottom Left */}
              <div
                className={`absolute bottom-10 left-10 w-80 h-80 ${darkMode ? 'bg-pink-500/20' : 'bg-pink-500/15'} blur-xl`}
                style={{
                  animation: 'float 15s ease-in-out infinite reverse',
                  transform: 'rotate(45deg)',
                }}
              />

              {/* Small Circle - Middle */}
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full ${darkMode ? 'bg-blue-500/15' : 'bg-blue-500/10'} blur-xl`}
                style={{
                  animation: 'float 18s ease-in-out infinite',
                  animationDelay: '2s',
                }}
              />
            </div>
          )}

          {/* Slide 0: Hero */}
          <div
            className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-white'}`}
            style={getSlideTransform(0)}
          >
            <div className="relative z-10 text-center max-w-4xl px-4 sm:px-8 mb-[4rem]">
              <h1 className={`text-4xl sm:text-2xl lg:text-4xl font-black mb-2 sm:mb-3 ${darkMode ? 'text-white' : 'text-black'} ${slideEntered && currentSlide === 0 ? 'animate-fade-in' : 'opacity-0'}`}>
                Hey👋 Welcome to Indi Mapper
              </h1>
              
              <h1 className={`text-lg sm:text-2xl lg:text-3xl font-black mb-2 sm:mb-3 ${darkMode ? 'text-white' : 'text-purple-500'} ${slideEntered && currentSlide === 0 ? 'animate-fade-in' : 'opacity-0'}`}>
                Your New Favorite Chrome Extension
              </h1>
              <div className={slideEntered && currentSlide === 0 ? 'animate-fade-in' : 'opacity-0'}>
                <Blobi emotion="happy" size={60} className="mx-auto mb-3 sm:mb-6" />
              </div>

              <h1 className={`text-lg sm:text-2xl lg:text-4xl font-black mb-2 sm:mb-3 ${darkMode ? 'text-white' : 'text-black'} ${slideEntered && currentSlide === 0 ? 'animate-fade-in' : 'opacity-0'}`}>
                I'm Blobi
              </h1>

              <p className={`text-md sm:text-lg lg:text-xl font-bold mb-4 sm:mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto ${slideEntered && currentSlide === 0 ? 'animate-fade-in' : 'opacity-0'}`}>
                Your new API debugging buddy.<br className="hidden sm:inline" /> Let me show you around!
              </p>




              {/* Featured on Softonic */}
              <a
                href="https://indi-mapper-developer-tool.en.softonic.com/chrome/extension"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex flex-col items-center gap-2 px-8 sm:px-12 py-4 sm:py-6 rounded-2xl ${darkMode ? 'bg-gray-900/60 border border-gray-700/50 hover:border-gray-600' : 'bg-gray-50/80 border border-gray-200 hover:border-gray-300'} transition-all hover:scale-[1.02] group ${slideEntered && currentSlide === 0 ? 'animate-fade-in' : 'opacity-0'}`}
              >
                <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Featured on
                </span>
                <svg viewBox="0 0 505 141" className={`h-8 sm:h-10 ${darkMode ? 'opacity-70 group-hover:opacity-100' : 'opacity-60 group-hover:opacity-80'} transition-opacity`}>
                  <path d="M170.1 62c-7-2.8-10-4.4-10-8.5 0-1.7.4-2.8 1.5-3.6 1.8-1.6 5.3-2.4 10-2.4a50.1 50.1 0 0 1 9.1.8 4.1 4.1 0 0 0 4-3.4c.3-2.3-1.3-4.4-3.4-4.6a59 59 0 0 0-9.8-.9c-6.7 0-11.8 1.4-15.2 4.2a12.2 12.2 0 0 0-4.4 10c0 9.8 8.7 13.4 15 16h.2c7.5 3.2 11.8 5.3 11.8 11.5 0 2.7-.9 4.7-2.7 6a16 16 0 0 1-9.2 2.2c-3.5 0-7.3-.5-10.8-1.6l-1.2-.2a4 4 0 0 0-4 4.5c0 .5.2 1 .4 1.5a4.1 4.1 0 0 0 2.5 2c2.4.7 7.4 2 13 2 5.8 0 10.6-1.3 14.2-3.9a15 15 0 0 0 5.9-12.5c0-12-9.8-16-16.9-19Zm62.7-20c-4.8-2.7-10.2-2.7-12.8-2.7-2.6 0-8 0-12.8 2.7-6 3.3-9 9.7-9 18.7V76c0 9.1 3 15.4 9 18.8 4.8 2.7 10.2 2.7 12.8 2.7 2.6 0 8 0 12.9-2.7 6-3.4 9-9.7 9-18.8V60.7c0-9-3-15.4-9-18.7Zm1 18.7V76c0 11.1-5.3 13.4-13.8 13.4S206.2 87 206.2 76V60.7c0-11 5.3-13.3 13.8-13.3s13.8 2.3 13.8 13.3Zm127-18.7c-4.8-2.7-10.3-2.7-12.9-2.7-2.6 0-8 0-12.8 2.7-6 3.3-9 9.7-9 18.7V76c0 9.1 3 15.4 9 18.8a26 26 0 0 0 12.8 2.7c2.6 0 8 0 12.9-2.7 6-3.4 9-9.7 9-18.8V60.7c0-9-3-15.4-9-18.7Zm1 18.7V76c0 11.1-5.4 13.4-13.9 13.4S334.1 87 334.1 76V60.7c0-11 5.3-13.3 13.8-13.3s13.8 2.3 13.8 13.3ZM405 39.3a39.7 39.7 0 0 0-21.3 5.9c-1.5 1-1.4 2.7-1.4 2.7v45.5a4 4 0 0 0 4 4.1 4 4 0 0 0 4.2-4v-43H390.8c3.8-2 8.4-3 14.2-3 5.4 0 9.2 1.1 11.1 3.4 2 2 3 5.4 3 10v32.5a4 4 0 0 0 4 4.1 4 4 0 0 0 4-4V60.8a23 23 0 0 0-4.7-15.5c-3.7-4-9.5-6.1-17.4-6.1Zm38.5-19.1a5 5 0 0 0-5 5c0 2.9 2.2 5.2 5 5.2 2.9 0 5.3-2.3 5.3-5.2 0-2.7-2.4-5-5.3-5Zm0 19a4 4 0 0 0-4 4.2v50a4 4 0 0 0 4 4.1 4 4 0 0 0 4.2-4V43.3a4 4 0 0 0-4.2-4.1Zm59.2 50a4 4 0 0 0-5.2-2.2l-.2.1a35.1 35.1 0 0 1-11.5 1.8c-8.2 0-18-3.6-18-20.9 0-17.3 9.8-20.9 18-20.9a32.5 32.5 0 0 1 11.6 1.8 4 4 0 0 0 3.8-.3 4 4 0 0 0 1.5-1.8 4 4 0 0 0-.7-4.4 4 4 0 0 0-1.3-1c-.7-.3-6-2.4-15-2.4-4.2 0-10.5.8-16 4.7-6.7 4.9-10.1 13-10.1 24.3 0 11.2 3.4 19.4 10.2 24.3 5.4 4 11.7 4.7 16 4.7a43.5 43.5 0 0 0 15-2.5c1-.5 1.6-1.3 2-2.2.4-1 .4-2.2-.1-3.1Zm-189 .3-.6-.1c-3-.7-6.9-2.7-9.9-5.7-3.5-3.3-5.3-8.2-5.3-14.5V47.3h14.7a4 4 0 0 0 3.9-5.4 4.1 4.1 0 0 0-4-2.7h-14.6V20c0-2.9-3-5.2-6-3.6a4.4 4.4 0 0 0-2 3.9v19h-27c.6-4.1 2.2-7.5 4.8-10.1 3.5-3.4 8-4.7 11.1-5.2a4 4 0 0 0 3.8-4 4 4 0 0 0-4.1-4l-.3-.1c-4.3.6-10.9 2.4-16.1 7.5a27 27 0 0 0-7.7 19.8v50.1c0 2 1.3 3.7 3.2 4.1 2.6.5 5-1.4 5-4v-46h27.2v21.8a27 27 0 0 0 7.7 20.3c4.5 4.4 10 7 14.2 7.9 2.9.5 5.4-2 4.9-4.8a4.1 4.1 0 0 0-3-3.1Z" fill={darkMode ? '#ffffff' : '#53565A'}></path>
                  <path d="m39.8 106-35-34.6a16.5 16.5 0 0 1 0-23.4L48.5 4.8c6.5-6.4 17-6.4 23.6 0l34.8 34.6-67 66.6Z" fill="#26D07C"></path>
                  <path d="m14.2 106 30.4 30.2c6.6 6.4 17.1 6.4 23.7 0L111.7 93a16.5 16.5 0 0 0 0-23.4L81.3 39.4 14.2 106Z" fill="#00A3E0"></path>
                  <path d="M106.8 39.4 94.1 52.1 81.3 39.4h25.5Z" fill="#005587"></path>
                </svg>
                <span className={`text-xs sm:text-sm font-medium italic max-w-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  "A Must-Have DevTool for Developers — 100/100 Security Score"
                </span>
              </a>
            </div>
          </div>

          {/* Slide 1: What are Indi's */}
          <div
            className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-gray-50'}`}
            style={getSlideTransform(1)}
          >
            <div className="relative z-10 w-full max-w-7xl px-4 sm:px-8">
              <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 mb-[4rem]">
                <div className="flex-1 max-w-xl text-center lg:text-left">
                  <div className={`flex sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 mb-4 sm:mb-8 ${slideEntered && currentSlide === 1 ? 'animate-fade-in' : 'opacity-0'}`}>
                    <Blobi emotion="calm" size={60} />
                    <div className="relative">
                      <div className={`relative p-3 sm:p-6 rounded-2xl ${darkMode ? 'bg-gray-900 text-white border-2 sm:border-4 border-pink-500/50' : 'bg-white text-black border-2 sm:border-4 border-gray-300'} font-black text-sm sm:text-xl max-w-xs sm:max-w-md shadow-2xl`}>
                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        </div>
                        👀 "See those dots?"
                        <div className="hidden lg:block absolute -right-8 top-1/2 -translate-y-1/2 text-4xl">
                          👉
                        </div>
                      </div>
                    </div>
                  </div>

                  <h2 className={`text-xl sm:text-2xl lg:text-4xl font-black mb-3 sm:mb-4 ${darkMode ? 'text-white' : 'text-black'} ${slideEntered && currentSlide === 1 ? 'animate-fade-in' : 'opacity-0'}`}>
                    Those Are My Indi's ✨
                  </h2>

                  {/* <p className={`text-base sm:text-base lg:text-lg font-bold mb-4 sm:mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'} ${slideEntered && currentSlide === 1 ? 'animate-fade-in' : 'opacity-0'}`}>
                    Each glowing dot = one API call firing in real-time! 🎯
                  </p> */}

                  <div className={`space-y-2 sm:space-y-3 ${slideEntered && currentSlide === 1 ? 'animate-fade-in' : 'opacity-0'}`}>
                    {[
                      { text: 'Map every click to its API in real-time', color: 'bg-green-500 shadow-green-500/50' },
                      { text: 'Auto-generate & validate schemas', color: 'bg-blue-500 shadow-blue-500/50' },
                      { text: 'Catch regressions before production', color: 'bg-purple-500 shadow-purple-500/50' },
                      { text: 'Debug with built-in modals & security insights', color: 'bg-pink-500 shadow-pink-500/50' },
                      { text: 'Zero setup - works on any site', color: 'bg-yellow-500 shadow-yellow-500/50' }
                    ].map((item, i) => (
                      <div key={i} className={`flex items-center gap-3 p-2 sm:p-3 rounded-xl ${darkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white/70 border border-white/20'} backdrop-blur-xl`}>
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${item.color} animate-pulse shadow-lg flex-shrink-0`} />
                        <p className={`text-xs sm:text-sm lg:text-base font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className={slideEntered && currentSlide === 1 ? 'animate-fade-in' : 'opacity-0'}>
                  </div>
                </div>

                <div className={`w-full lg:flex-1 ${slideEntered && currentSlide === 1 ? 'animate-fade-in' : 'opacity-0'}`}>
                  <BrowserMock dark={darkMode}>
                    <div className="space-y-3 sm:space-y-4">
                      <div className={`relative p-3 sm:p-4 ${darkMode ? 'bg-gray-700 border-2 border-purple-500/30' : 'bg-white border-2 border-purple-300/50'} rounded-lg flex items-center gap-2 sm:gap-3 shadow-xl hover:scale-105 transition-transform`}>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-black text-base sm:text-xl shadow-lg opacity-90">D</div>
                        <div className="flex-1">
                          <div className={`text-sm sm:text-base font-black ${darkMode ? 'text-white' : 'text-black'}`}>Dashboard</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading data...</div>
                        </div>
                        <APIIndicator status="fast" extraPulse />
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {[
                          { label: 'Users', value: '1.2K', status: 'fast' as const },
                          { label: 'Revenue', value: '$45K', status: 'slow' as const },
                          { label: 'Orders', value: '856', status: 'slow' as const }
                        ].map((item, i) => (
                          <div key={i} className={`relative p-2 sm:p-3 ${darkMode ? 'bg-gray-700 border-2 border-gray-600' : 'bg-white border-2 border-gray-200'} rounded-lg shadow-lg hover:scale-105 transition-transform`}>
                            <div className={`text-[10px] sm:text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</div>
                            <div className={`text-sm sm:text-lg font-black ${darkMode ? 'text-white' : 'text-black'}`}>{item.value}</div>
                            <APIIndicator status={item.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </BrowserMock>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2: Protection */}
          <div
            className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-white'} overflow-y-auto`}
            style={getSlideTransform(2)}
          >
            <div className="relative z-10 w-full max-w-6xl px-4 sm:px-8 py-4 sm:py-8 mb-[4rem]">
              <div className="text-center mb-2 sm:mb-4">
                <h2 className={`text-base sm:text-xl lg:text-3xl font-black mb-2 ${darkMode ? 'text-white' : 'text-black'} ${slideEntered && currentSlide === 2 ? 'animate-fade-in' : 'opacity-0'}`}>
                  But... I Don't Just Watch I'll give u a heads up!
                </h2>
                <div className={`flex flex-col items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-3 ${slideEntered && currentSlide === 2 ? 'animate-fade-in' : 'opacity-0'}`}>
                  <Blobi emotion="worried" size={50} />
                  <div className={`p-2 sm:p-4 rounded-2xl max-w-[180px] sm:max-w-md ${darkMode ? 'bg-gray-900 text-white border-2 border-purple-500/50' : 'bg-white text-black border-2 border-gray-300'} font-bold text-xs sm:text-base shadow-xl`}>
                    "Hey,Check this out! ⚠️"
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-5 mb-3 sm:mb-6">
                {[
                  { emoji: '🌐', title: 'Slow APIs', desc: 'Taking too long', borderColor: 'border-yellow-500/60', indicatorColor: 'bg-yellow-500 shadow-yellow-500/50' },
                  { emoji: '💥', title: 'Failed', desc: 'Errors detected', borderColor: 'border-red-500/60', indicatorColor: 'bg-red-500 shadow-red-500/50' },
                  { emoji: '🔄', title: 'Polling', desc: 'Non-stop calls', borderColor: 'border-blue-500/60', indicatorColor: 'bg-blue-500 shadow-blue-500/50' },
                  { emoji: '📊', title: 'Schemas', desc: 'Validating now', borderColor: 'border-purple-500/60', indicatorColor: 'bg-purple-500 shadow-purple-500/50' },
                ].map((item) => (
                  <div key={item.title} className={`relative p-3 sm:p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white/70 backdrop-blur-xl'} border ${darkMode ? '' : 'border-white/20'} ${item.borderColor} shadow-xl transition-all hover:scale-105 ${slideEntered && currentSlide === 2 ? 'animate-fade-in' : 'opacity-0'}`}>
                    <div className={`absolute top-2 right-2 w-2 h-2 sm:w-3 sm:h-3 rounded-full ${item.indicatorColor} animate-pulse shadow-lg`} />
                    <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{item.emoji}</div>
                    <div className={`font-black text-xs sm:text-sm mb-0.5 ${darkMode ? 'text-white' : 'text-black'}`}>{item.title}</div>
                    <div className={`text-[10px] sm:text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</div>
                  </div>
                ))}
              </div>

              <div className={`text-center ${slideEntered && currentSlide === 2 ? 'animate-fade-in' : 'opacity-0'}`}>
                <p className={`text-sm sm:text-sm lg:text-base font-bold italic mb-3 sm:mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Integrations coming soon! 🔥
                </p>

                {/* Teaser for Indi Flows */}
                <div className="mt-4 sm:mt-8 mb-2">
                  <div className={`inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-full ${darkMode ? 'bg-purple-600' : 'bg-pink-500'} opacity-90 mb-2 sm:mb-4`}>
                    <p className="text-white text-xs sm:text-sm font-black tracking-wide">✨ BUT WAIT...</p>
                  </div>
                  <h1 className={`text-lg sm:text-2xl lg:text-4xl font-black ${darkMode ? 'text-white' : 'text-black'} mb-2`}>
                    Leaving the Best For Last 🎁
                  </h1>
                  <p className={`text-sm sm:text-lg font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-md mx-auto`}>
                    Swipe to see our secret weapon →
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 3: Indi Flows */}
          <div
            className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-gray-50'} overflow-y-auto`}
            style={getSlideTransform(3)}
          >
            <div className="relative z-10 max-w-4xl px-4 sm:px-8 text-center py-4 sm:py-8 mb-[4rem]">
              <div className={`flex flex-col items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-3 ${slideEntered && currentSlide === 3 ? 'animate-fade-in' : 'opacity-0'}`}>
              <h2 className={`text-4xl sm:text-2xl lg:text-4xl font-black mb-2 sm:mb-4 ${darkMode ? 'text-white' : 'text-black'} ${slideEntered && currentSlide === 3 ? 'animate-fade-in' : 'opacity-0'}`}>
                Introducting Indi Flows 🎬
              </h2>
                <div className={`p-2 sm:p-4 rounded-2xl max-w-[180px] sm:max-w-xs ${darkMode ? 'bg-gray-900 text-white border-2 border-purple-500/50' : 'bg-white text-black border-2 border-gray-300'} font-bold text-xs sm:text-base shadow-xl`}>
                  "Check this! 🤯"
                </div>
                <Blobi emotion="happy" size={80} />
              </div>




              <div className={`max-w-2xl mx-auto p-3 sm:p-8 rounded-3xl ${darkMode ? 'bg-gray-900 border-2 sm:border-4 border-gray-800' : 'bg-white/70 backdrop-blur-xl border border-white/20'} mb-3 sm:mb-6 shadow-xl ${slideEntered && currentSlide === 3 ? 'animate-fade-in' : 'opacity-0'}`}>
                <p className={`text-base sm:text-xl lg:text-2xl font-black mb-2 sm:mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>
                  Record Clicks. Auto-Replay. 🔄
                </p>
                <p className={`text-xs sm:text-sm lg:text-base font-bold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Click → <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-mono text-xs sm:text-sm opacity-90">REC</span> → Boom!
                </p>
                <p className={`text-xs sm:text-sm font-semibold italic ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Catch bugs early. ☕ Get Free Automation and Run Sanity Checks on your machine.
                </p>
              </div>

                            <div className={`inline-block px-2 sm:px-4 py-1 sm:py-2 rounded-full ${darkMode ? 'text-white' : 'text-black'} text-[10px] sm:text-sm font-black mb-2 sm:mb-3 opacity-90 ${slideEntered && currentSlide === 3 ? 'animate-fade-in' : 'opacity-0'}`}>
                ⚡ EXPERIMENTAL
              </div>

              <div className={slideEntered && currentSlide === 3 ? 'animate-fade-in' : 'opacity-0'}>
              </div>
            </div>
          </div>

          {/* Slide 4: Final CTA */}
          <div
            className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-white'}`}
            style={getSlideTransform(4)}
          >
            <div className="relative z-10 text-center max-w-3xl px-4 sm:px-8 mb-[4rem]">
              <div className={slideEntered && currentSlide === 4 ? 'animate-fade-in' : 'opacity-0'}>
                <Blobi emotion="happy" size={60} className="mx-auto mb-3 sm:mb-6" />
              </div>

              <h2 className={`text-4xl sm:text-2xl lg:text-4xl font-black mb-3 sm:mb-6 ${darkMode ? 'text-white' : 'text-black'} ${slideEntered && currentSlide === 4 ? 'animate-fade-in' : 'opacity-0'}`}>
                Get It Now - It's Free! 🎁
              </h2>

              <p className={`text-base sm:text-base lg:text-lg font-bold mb-4 sm:mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-xl mx-auto ${slideEntered && currentSlide === 4 ? 'animate-fade-in' : 'opacity-0'}`}>
                Download now and start debugging smarter in under 60 seconds!
              </p>

              <div className={slideEntered && currentSlide === 4 ? 'animate-fade-in mb-6 sm:mb-8' : 'opacity-0 mb-6 sm:mb-8'}>
              </div>

              <div className={`space-y-2 sm:space-y-3 mb-4 sm:mb-6 ${slideEntered && currentSlide === 4 ? 'animate-fade-in' : 'opacity-0'}`}>
                <p className={`text-xs sm:text-sm font-bold ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  🔒 100% Free Forever • ⚡ No Account Required • 🎯 Works Instantly
                </p>
              </div>

              <div className='flex flex-col sm:flex-row justify-center items-center gap-4'>

              <button
                onClick={handleDownload}
                className={`group px-8 py-4 rounded-full shadow-2xl transition-all hover:scale-105 font-bold text-base sm:text-lg flex items-center gap-3 ${darkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'} border-2 border-transparent`}
                >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Free Now
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={enterScrollMode}
                className={`text-xs sm:text-sm font-bold ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors underline ${slideEntered && currentSlide === 4 ? 'animate-fade-in' : 'opacity-0'}`}
                >
                or learn more ↓
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Traditional Scroll Sections */}
      <div ref={scrollSectionRef} className={`${inScrollMode ? 'block' : 'hidden'}`}>
        <section id="home" className={`min-h-screen flex items-center justify-center relative ${darkMode ? 'bg-black' : 'bg-white'} overflow-hidden`}>
          {/* Geometric Background Shapes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Large Circle - Top Right */}
            <div
              className={`absolute top-10 right-10 w-96 h-96 rounded-full ${darkMode ? 'bg-purple-500/20' : 'bg-purple-500/15'} blur-xl animate-float`}
            />

            {/* Medium Square - Bottom Left */}
            <div
              className={`absolute bottom-10 left-10 w-80 h-80 ${darkMode ? 'bg-pink-500/20' : 'bg-pink-500/15'} blur-xl`}
              style={{
                animation: 'float 15s ease-in-out infinite reverse',
                transform: 'rotate(45deg)',
              }}
            />

            {/* Small Circle - Middle */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full ${darkMode ? 'bg-blue-500/15' : 'bg-blue-500/10'} blur-xl`}
              style={{
                animation: 'float 18s ease-in-out infinite',
                animationDelay: '2s',
              }}
            />
          </div>

          <FloatingIndicators />

          <div className="container mx-auto px-4 sm:px-6 text-center relative z-10 pt-16 sm:pt-20">
            {/* Existing home section content */}
            <div className="mt-8 mb-6 sm:mb-8 animate-fade-in">
              <h1 className={`font-headline font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-4 ${darkMode ? 'text-white' : 'text-black'} drop-shadow-lg px-2`}>
                <span className="inline-flex items-center justify-center">
                  <span>Indi Mapper</span>
                </span>
              </h1>
              <div className="flex justify-center items-center gap-2 mb-2">
                <div className={`w-12 sm:w-16 h-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full`}></div>
                <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-90"></div>
                <div className={`w-12 sm:w-16 h-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full`}></div>
              </div>
            </div>

            <p className={`font-sans text-base sm:text-lg md:text-xl lg:text-2xl ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4`}>
              The only chrome extension that connects your UI to your APIs with live monitoring, regression detection, and automated workflows
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4">
              <button
                onClick={handleDownload}
                className={`group px-6 sm:px-8 py-3 sm:py-4 font-sans font-semibold text-base sm:text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:scale-105 transform transition-all duration-300 shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Free
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>

              <a
                href="#about"
                className={`px-6 sm:px-8 py-3 sm:py-4 font-sans font-semibold text-base sm:text-lg border-3 ${darkMode ? 'border-gray-700 text-white hover:bg-gray-900' : 'border-gray-300 text-black hover:bg-gray-50'} rounded-full hover:scale-105 transform transition-all duration-300 shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto`}
              >
                Learn More
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-4xl mx-auto px-4">
              {[
                '🎯 Visual API Mapping',
                '⚡ Real-time Monitoring',
                '🔗 Jira Integration',
                '🎨 Beautiful UI'
              ].map((feature, i) => (
                <div
                  key={i}
                  // add border white to dark mode
                  className={`px-4 sm:px-6 py-2 sm:py-3 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white/70 border-white/20 hover:border-purple-200/50'} backdrop-blur-xl rounded-full shadow-lg border font-sans font-medium text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'} hover:scale-105 transform transition-all duration-300 hover:shadow-xl`}
                >
                  {feature}
                </div>
              ))}
            </div>

            {/* Featured On */}
            <div className="mt-12 sm:mt-16 px-4">
              <a
                href="https://indi-mapper-developer-tool.en.softonic.com/chrome/extension"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex flex-col items-center gap-3 px-8 sm:px-12 py-5 sm:py-7 rounded-2xl ${darkMode ? 'bg-gray-900/60 border border-gray-700/50 hover:border-gray-600' : 'bg-gray-50/80 border border-gray-200 hover:border-gray-300'} transition-all hover:scale-[1.02] group`}
              >
                <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Featured on
                </span>
                <svg viewBox="0 0 505 141" className={`h-8 sm:h-10 ${darkMode ? 'opacity-70 group-hover:opacity-100' : 'opacity-60 group-hover:opacity-80'} transition-opacity`}>
                  <path d="M170.1 62c-7-2.8-10-4.4-10-8.5 0-1.7.4-2.8 1.5-3.6 1.8-1.6 5.3-2.4 10-2.4a50.1 50.1 0 0 1 9.1.8 4.1 4.1 0 0 0 4-3.4c.3-2.3-1.3-4.4-3.4-4.6a59 59 0 0 0-9.8-.9c-6.7 0-11.8 1.4-15.2 4.2a12.2 12.2 0 0 0-4.4 10c0 9.8 8.7 13.4 15 16h.2c7.5 3.2 11.8 5.3 11.8 11.5 0 2.7-.9 4.7-2.7 6a16 16 0 0 1-9.2 2.2c-3.5 0-7.3-.5-10.8-1.6l-1.2-.2a4 4 0 0 0-4 4.5c0 .5.2 1 .4 1.5a4.1 4.1 0 0 0 2.5 2c2.4.7 7.4 2 13 2 5.8 0 10.6-1.3 14.2-3.9a15 15 0 0 0 5.9-12.5c0-12-9.8-16-16.9-19Zm62.7-20c-4.8-2.7-10.2-2.7-12.8-2.7-2.6 0-8 0-12.8 2.7-6 3.3-9 9.7-9 18.7V76c0 9.1 3 15.4 9 18.8 4.8 2.7 10.2 2.7 12.8 2.7 2.6 0 8 0 12.9-2.7 6-3.4 9-9.7 9-18.8V60.7c0-9-3-15.4-9-18.7Zm1 18.7V76c0 11.1-5.3 13.4-13.8 13.4S206.2 87 206.2 76V60.7c0-11 5.3-13.3 13.8-13.3s13.8 2.3 13.8 13.3Zm127-18.7c-4.8-2.7-10.3-2.7-12.9-2.7-2.6 0-8 0-12.8 2.7-6 3.3-9 9.7-9 18.7V76c0 9.1 3 15.4 9 18.8a26 26 0 0 0 12.8 2.7c2.6 0 8 0 12.9-2.7 6-3.4 9-9.7 9-18.8V60.7c0-9-3-15.4-9-18.7Zm1 18.7V76c0 11.1-5.4 13.4-13.9 13.4S334.1 87 334.1 76V60.7c0-11 5.3-13.3 13.8-13.3s13.8 2.3 13.8 13.3ZM405 39.3a39.7 39.7 0 0 0-21.3 5.9c-1.5 1-1.4 2.7-1.4 2.7v45.5a4 4 0 0 0 4 4.1 4 4 0 0 0 4.2-4v-43H390.8c3.8-2 8.4-3 14.2-3 5.4 0 9.2 1.1 11.1 3.4 2 2 3 5.4 3 10v32.5a4 4 0 0 0 4 4.1 4 4 0 0 0 4-4V60.8a23 23 0 0 0-4.7-15.5c-3.7-4-9.5-6.1-17.4-6.1Zm38.5-19.1a5 5 0 0 0-5 5c0 2.9 2.2 5.2 5 5.2 2.9 0 5.3-2.3 5.3-5.2 0-2.7-2.4-5-5.3-5Zm0 19a4 4 0 0 0-4 4.2v50a4 4 0 0 0 4 4.1 4 4 0 0 0 4.2-4V43.3a4 4 0 0 0-4.2-4.1Zm59.2 50a4 4 0 0 0-5.2-2.2l-.2.1a35.1 35.1 0 0 1-11.5 1.8c-8.2 0-18-3.6-18-20.9 0-17.3 9.8-20.9 18-20.9a32.5 32.5 0 0 1 11.6 1.8 4 4 0 0 0 3.8-.3 4 4 0 0 0 1.5-1.8 4 4 0 0 0-.7-4.4 4 4 0 0 0-1.3-1c-.7-.3-6-2.4-15-2.4-4.2 0-10.5.8-16 4.7-6.7 4.9-10.1 13-10.1 24.3 0 11.2 3.4 19.4 10.2 24.3 5.4 4 11.7 4.7 16 4.7a43.5 43.5 0 0 0 15-2.5c1-.5 1.6-1.3 2-2.2.4-1 .4-2.2-.1-3.1Zm-189 .3-.6-.1c-3-.7-6.9-2.7-9.9-5.7-3.5-3.3-5.3-8.2-5.3-14.5V47.3h14.7a4 4 0 0 0 3.9-5.4 4.1 4.1 0 0 0-4-2.7h-14.6V20c0-2.9-3-5.2-6-3.6a4.4 4.4 0 0 0-2 3.9v19h-27c.6-4.1 2.2-7.5 4.8-10.1 3.5-3.4 8-4.7 11.1-5.2a4 4 0 0 0 3.8-4 4 4 0 0 0-4.1-4l-.3-.1c-4.3.6-10.9 2.4-16.1 7.5a27 27 0 0 0-7.7 19.8v50.1c0 2 1.3 3.7 3.2 4.1 2.6.5 5-1.4 5-4v-46h27.2v21.8a27 27 0 0 0 7.7 20.3c4.5 4.4 10 7 14.2 7.9 2.9.5 5.4-2 4.9-4.8a4.1 4.1 0 0 0-3-3.1Z" fill={darkMode ? '#ffffff' : '#53565A'}></path>
                  <path d="m39.8 106-35-34.6a16.5 16.5 0 0 1 0-23.4L48.5 4.8c6.5-6.4 17-6.4 23.6 0l34.8 34.6-67 66.6Z" fill="#26D07C"></path>
                  <path d="m14.2 106 30.4 30.2c6.6 6.4 17.1 6.4 23.7 0L111.7 93a16.5 16.5 0 0 0 0-23.4L81.3 39.4 14.2 106Z" fill="#00A3E0"></path>
                  <path d="M106.8 39.4 94.1 52.1 81.3 39.4h25.5Z" fill="#005587"></path>
                </svg>
                <span className={`text-sm sm:text-base font-medium italic max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  "A Must-Have DevTool for Developers — 100/100 Security Score"
                </span>
              </a>
            </div>
          </div>
        </section>
        <About />

        {/* Runtime SDK Teaser */}
        <section className={`py-16 sm:py-20 px-4 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Blobi emotion="calm" size={50} />
            </div>
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>
              Now in Production Too
            </h2>
            <p className={`text-sm sm:text-base font-bold mb-6 max-w-xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              The new Indi Runtime SDK monitors your API contracts in production — auto-learning schemas, catching drift, and alerting you before users notice.
            </p>
            <a
              href="/runtime"
              className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm sm:text-base bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:scale-105 transform transition-all duration-300 shadow-lg"
            >
              Explore Runtime SDK
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </section>

        <DownloadCTA />
        <ContactUs />
        <Footer />
      </div>
    </div>
  );
}
