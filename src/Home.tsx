import { useNavigate } from 'react-router-dom'
import About from './About'
import ContactUs from './ContactUs'
import FloatingIndicators from './Floatingindicators'
import Navbar from './Navbar'
import Pricing from './Pricing'
import { useEffect } from 'react'

export default function Home() {
const navigate = useNavigate();


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
    <Navbar />
    <section id="home" className="min-h-screen flex items-center justify-center relative bg-gradient-to-r from-pink-50 to-rose-50">
    <FloatingIndicators />
    <div className="absolute inset-0 bg-gradient-to-r from-[#ff8177] to-[#b12a5b] opacity-5"></div>
    <div className="container mx-auto px-6 text-center relative z-10">
      <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
        Map Your APIs
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Visualize, monitor, and optimize your API integrations with our powerful mapping tool.
      </p>
      <div className="flex justify-center space-x-4">
        <button onClick={() => navigate('/login', { state: { register: true } })} className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:opacity-90">
          Get Started
        </button>
        <button className="px-8 py-3 border-2 border-rose-500 text-rose-500 rounded-lg hover:bg-rose-50">
          <a href="#about">
            Learn More
          </a>
        </button>
      </div>
    </div>
  </section>
        <About />
      <Pricing />
      <ContactUs />
    </>
  )
}
