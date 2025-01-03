import { useNavigate } from "react-router-dom";

export default function Navbar() {
const navigate = useNavigate();
  return (
    <nav className="fixed top-0 w-full bg-white bg-opacity-80 backdrop-blur-sm z-50 shadow-sm">
    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
      <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
        indi mapper
      </div>
      <div className="hidden md:flex space-x-8">
        <a href="#home" className="text-gray-600 hover:text-gray-900">Home</a>
        <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
        <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
        <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
      </div>
      <div className="flex space-x-4">
        <button onClick={() => navigate('/login')} className="px-4 py-2 text-gray-600 hover:text-gray-900">Login</button>
        <button onClick={() => navigate('/register', { state: { register: true } })} className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:opacity-90">
          Register
        </button>
      </div>
    </div>
  </nav>
  )
}
