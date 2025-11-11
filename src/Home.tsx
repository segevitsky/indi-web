import About from './About'
import ContactUs from './ContactUs'
import FloatingIndicators from './Floatingindicators'
import Navbar from './Navbar'
import DownloadCTA from './DownloadCTA'
import { useEffect } from 'react'
import Footer from './Footer'
import IndiBlobLogo from './IndiBlobLogo'
// import IndieMapperMarketingPopup from './Banner'

export default function Home() {


useEffect(() => {
  const hash = window.location.hash;
  if (hash) {
    const el = document.querySelector(hash);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}, []);

  return (
    <>
    {/* <IndieMapperMarketingPopup /> */}
    <Navbar />
    <section id="home" className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-indi-purple-50 via-indi-pink-50 to-indi-purple-100 overflow-hidden">
    <FloatingIndicators />

    {/* Animated background blobs */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indi-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indi-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indi-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-bounce-slow"></div>
    </div>

    <div className="container mx-auto px-4 sm:px-6 text-center relative z-10 pt-16 sm:pt-20">
      {/* Main Headline */}
      <div className="mb-6 sm:mb-8 animate-fade-in">
        <h1 className="font-headline font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-4 bg-gradient-to-r from-indi-pink-500 via-indi-purple-500 to-indi-purple-600 bg-clip-text text-transparent drop-shadow-lg px-2">
          <span className="inline-flex items-center justify-center">
            <span>Ind</span>
            <span className="relative inline-block mx-0.5 sm:mx-1 text-indi-pink-300">
              {/* Blob positioned above the i */}
              <IndiBlobLogo
                style={{
                  position: 'absolute',
                  top: '-0.1em',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0.4em',
                  height: '0.4em'
                }}
              />
              {/* Dotless i */}
              ı
            </span>
            <span className="ml-2 sm:ml-3 md:ml-4">Mapper</span>
          </span>
        </h1>
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-transparent via-indi-purple-400 to-transparent rounded-full"></div>
          <div className="w-2 h-2 bg-indi-pink-500 rounded-full animate-pulse"></div>
          <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-transparent via-indi-pink-400 to-transparent rounded-full"></div>
        </div>
      </div>

      {/* Subtitle */}
      <p className="font-sans text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
        The only platform that <span className="font-semibold text-indi-purple-600">connects your UI to your APIs</span> with live monitoring, regression detection, and automated workflows
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4">
        <a
          href="#download"
          className="group px-6 sm:px-8 py-3 sm:py-4 font-sans font-bold text-base sm:text-lg bg-gradient-to-r from-indi-pink-500 via-indi-purple-500 to-indi-purple-600 text-white rounded-full shadow-2xl hover:shadow-indi-purple-400/50 hover:scale-105 transform transition-all duration-300 border-3 border-white w-full sm:w-auto"
        >
          <span className="flex items-center justify-center gap-2">
            Download Free
            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </a>

        <a
          href="#about"
          className="px-6 sm:px-8 py-3 sm:py-4 font-sans font-semibold text-base sm:text-lg border-3 border-indi-purple-500 text-indi-purple-600 rounded-full hover:bg-indi-purple-50 hover:scale-105 transform transition-all duration-300 shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          Learn More
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>

      {/* Features badges */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-4xl mx-auto px-4">
        {[
          '🎯 Visual API Mapping',
          '⚡ Real-time Monitoring',
          '🔗 Jira Integration',
          '🎨 Beautiful UI'
        ].map((feature, i) => (
          <div
            key={i}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border-2 border-indi-purple-100 font-sans font-medium text-sm sm:text-base text-gray-700 hover:scale-105 transform transition-all duration-300 hover:shadow-xl"
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
    </>
  )
}
