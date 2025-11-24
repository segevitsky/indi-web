import { useEffect, useState } from 'react';
import { Eye, Activity, Users } from 'lucide-react';

export default function About() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setDarkMode(isDark);
    };
    checkDarkMode();
    const interval = setInterval(checkDarkMode, 100);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: 'Effortless API Visualization',
      description: 'Transform your debugging experience with instant visual indicators that link UI elements to their API calls. No more digging through network logs - see exactly where and how your APIs interact with your interface',
      icon: Eye,
      gradient: 'from-pink to-pink'
    },
    {
      title: 'Smart Real-time Monitoring',
      description: 'Watch your APIs perform in real-time with intelligent indicators that change color and status based on response times and success rates. Instantly spot issues before they impact your users',
      icon: Activity,
      gradient: 'from-black to-white'
    },
    {
      title: 'Seamless Integration & Collaboration',
      description: 'One click to create detailed Jira tickets, complete with API context and performance data. Share insights with your team and track improvements - all without leaving your development workflow',
      icon: Users,
      gradient: 'from-white to-black'
    },
  ];

  return (
    <section id="about" className="min-h-screen bg-white dark:bg-black py-16 sm:py-20 md:py-24">
    <div className="container mx-auto px-4 sm:px-6">
      {/* Section Header */}
      <div className="text-center mb-12 sm:mb-16 md:mb-20">
        <h2 className="font-headline font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 text-black dark:text-white px-2">
          How It Works
        </h2>
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className={`w-16 sm:w-20 h-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full`}></div>
          <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-90"></div>
          <div className={`w-16 sm:w-20 h-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full`}></div>
        </div>
        <p className="font-sans text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
          Three powerful features that revolutionize how you debug and monitor your applications
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="group p-6 sm:p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform border-2 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
            >
              {/* Icon */}
              <div className={`w-14 h-14 sm:w-16 sm:h-16 mb-4 sm:mb-6 rounded-2xl bg-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 opacity-90`}>
                <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>

              {/* Title */}
              <h3 className="font-headline font-bold text-xl sm:text-2xl mb-3 sm:mb-4 text-black dark:text-white">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="font-sans text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
  )
}
