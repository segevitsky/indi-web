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

  // Sync with Navbar dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setDarkMode(isDark);
    };

    checkDarkMode();
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
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent default scroll behavior on mobile
    e.preventDefault();
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (isTransitioning) return;

    const minSwipeDistance = 50;
    const distance = touchStart - touchEnd;
    const isSwipeDown = distance > minSwipeDistance;
    const isSwipeUp = distance < -minSwipeDistance;

    if (isSwipeDown && currentSlide < totalSlides - 1) {
      nextSlide();
    } else if (isSwipeDown && currentSlide === totalSlides - 1) {
      enterScrollMode();
    } else if (isSwipeUp && currentSlide > 0) {
      prevSlide();
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


  return (
    <div className={`min-h-screen w-full relative overflow-x-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'} ${inScrollMode ? 'overflow-y-auto' : 'overflow-y-hidden'}`}>
      {inScrollMode && <Navbar inScrollMode={inScrollMode} setInScrollMode={setInScrollMode} />}
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
            className={`hidden md:flex fixed left-2 sm:left-6 top-1/3 -translate-y-1/2 z-40 p-2 sm:p-4 rounded-full ${darkMode ? 'bg-gray-800 text-white border-purple-500' : 'bg-white text-gray-900 border-purple-600'} shadow-2xl hover:scale-110 transition-all disabled:opacity-50 border-2 text-lg sm:text-2xl font-bold items-center justify-center`}
          >
            ←
          </button>
        )}
        {currentSlide < totalSlides - 1 && (
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className={`hidden md:flex fixed right-2 sm:right-6 top-1/3 -translate-y-1/2 z-40 p-2 sm:p-4 rounded-full ${darkMode ? 'bg-gray-800 text-white border-purple-500' : 'bg-white text-gray-900 border-purple-600'} shadow-2xl hover:scale-110 transition-all disabled:opacity-50 border-2 text-lg sm:text-2xl font-bold items-center justify-center`}
          >
            →
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
                The Best Chrome Extension Ever!
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

              <div className={slideEntered && currentSlide === 0 ? 'animate-fade-in mb-4 sm:mb-6' : 'opacity-0 mb-4 sm:mb-6'}>
              </div>
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
                      <div className={`relative p-3 sm:p-6 rounded-2xl ${darkMode ? 'bg-gray-900 text-white border-2 sm:border-4 border-purple-500/50' : 'bg-white text-black border-2 sm:border-4 border-gray-300'} font-black text-sm sm:text-xl max-w-xs sm:max-w-md shadow-2xl`}>
                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                          {/* <span className="text-xl sm:text-2xl">👀</span> */}
                          {/* <span className={`text-xs sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide`}>Yo Looki Here!</span> */}
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
                      <div key={i} className={`flex items-center gap-3 p-2 sm:p-3 rounded-xl ${darkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white/50 border border-gray-200'} backdrop-blur-sm`}>
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
                  <div key={item.title} className={`relative p-3 sm:p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border-2 ${item.borderColor} shadow-xl transition-all hover:scale-105 ${slideEntered && currentSlide === 2 ? 'animate-fade-in' : 'opacity-0'}`}>
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




              <div className={`max-w-2xl mx-auto p-3 sm:p-8 rounded-3xl ${darkMode ? 'bg-gray-900 border-2 sm:border-4 border-gray-800' : 'bg-white border-2 sm:border-4 border-gray-200'} mb-3 sm:mb-6 shadow-xl ${slideEntered && currentSlide === 3 ? 'animate-fade-in' : 'opacity-0'}`}>
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
                So... Ready to Start? 🚀
              </h2>

              <p className={`text-base sm:text-base lg:text-lg font-bold mb-4 sm:mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-xl mx-auto ${slideEntered && currentSlide === 4 ? 'animate-fade-in' : 'opacity-0'}`}>
                Join thousands of developers making API debugging fun!
              </p>

              <div className={slideEntered && currentSlide === 4 ? 'animate-fade-in mb-6 sm:mb-8' : 'opacity-0 mb-6 sm:mb-8'}>
              </div>

              <div className={`space-y-2 sm:space-y-3 mb-4 sm:mb-6 ${slideEntered && currentSlide === 4 ? 'animate-fade-in' : 'opacity-0'}`}>
                <p className={`text-xs sm:text-sm font-bold ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  🔒 Free Forever • ⚡ 30-Second Install • 🎯 Works on Any Site
                </p>
              </div>
              
              <div className='flex justify-center items-center'>
              
              <button
                onClick={enterScrollMode}
                className={`mr-4 px-6 py-3 rounded-full shadow-2xl transition-all hover:scale-105 font-bold text-sm flex items-center gap-2 ${darkMode ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900'} border-2 ${darkMode ? 'border-white' : 'border-black'}`}
                
                >
                Download Now!
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
          <FloatingIndicators />

          <div className="container mx-auto px-4 sm:px-6 text-center relative z-10 pt-16 sm:pt-20">
            {/* Existing home section content */}
            <div className="mb-6 sm:mb-8 animate-fade-in">
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
              <a
                href="#download"
                              className={`px-6 sm:px-8 py-3 sm:py-4 font-sans font-semibold text-base sm:text-lg border-3 ${darkMode ? 'border-gray-700 text-white hover:bg-gray-900' : 'border-gray-300 text-black hover:bg-gray-50'} rounded-full hover:scale-105 transform transition-all duration-300 shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto`}
  
              
              >
                <span className="flex items-center justify-center gap-2 dark:text-white">
                  Download Free
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </a>

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

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-4xl mx-auto px-4">
              {[
                '🎯 Visual API Mapping',
                '⚡ Real-time Monitoring',
                '🔗 Jira Integration',
                '🎨 Beautiful UI'
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`px-4 sm:px-6 py-2 sm:py-3 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} backdrop-blur-sm rounded-full shadow-lg border-2 font-sans font-medium text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'} hover:scale-105 transform transition-all duration-300 hover:shadow-xl`}
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </section>
        <About />
        <DownloadCTA />
        <ContactUs />
        <Footer />
      </div>
    </div>
  );
}
