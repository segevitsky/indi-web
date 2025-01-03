import { Sun, Moon, ChevronDown } from 'lucide-react';
export default function About() {
  return (
    <section id="about" className="min-h-screen bg-white py-24">
    <div className="container mx-auto px-6">
      <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
        How It Works
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            title: 'Install Extension',
            description: 'Add our Chrome extension to start mapping your APIs instantly',
            icon: <Sun className="w-12 h-12 text-rose-500" />,
          },
          {
            title: 'Map APIs',
            description: 'Easily map and track API calls on your web applications',
            icon: <Moon className="w-12 h-12 text-rose-500" />,
          },
          {
            title: 'Monitor & Improve',
            description: 'Get insights and optimize your API performance',
            icon: <ChevronDown className="w-12 h-12 text-rose-500" />,
          },
        ].map((step, index) => (
          <div key={index} className="p-8 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-6">{step.icon}</div>
            <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  )
}
