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
    title: 'Effortless API Visualization',
    description: 'Transform your debugging experience with instant visual indicators that link UI elements to their API calls. No more digging through network logs - see exactly where and how your APIs interact with your interface',
    icon: <Sun className="w-12 h-12 text-rose-500" />,
  },
  {
    title: 'Smart Real-time Monitoring',
    description: 'Watch your APIs perform in real-time with intelligent indicators that change color and status based on response times and success rates. Instantly spot issues before they impact your users',
    icon: <Moon className="w-12 h-12 text-rose-500" />,
  },
  {
    title: 'Seamless Integration & Collaboration',
    description: 'One click to create detailed Jira tickets, complete with API context and performance data. Share insights with your team and track improvements - all without leaving your development workflow',
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
