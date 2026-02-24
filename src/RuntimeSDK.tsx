import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Blobi from './Blobi';
import { Terminal, Shield, Mail, Zap, AlertTriangle, Clock, FileWarning, ArrowRight } from 'lucide-react';

export default function RuntimeSDK() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
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

  return (
    <div className={`min-h-screen w-full ${darkMode ? 'bg-black' : 'bg-white'}`}>
      <Navbar inScrollMode={true} setInScrollMode={() => {}} />

      {/* Hero */}
      <section className={`pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 text-center ${darkMode ? 'bg-black' : 'bg-white'}`}>
        <Blobi emotion="happy" size={80} className="mx-auto mb-6" />
        <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
          Meet the Runtime SDK
        </h1>
        <p className={`text-base sm:text-xl font-bold max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Blobi doesn't just live in your browser — now I can watch over your APIs in production too!
        </p>
      </section>

      {/* What it does */}
      <section className={`py-16 sm:py-24 px-4 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-2xl sm:text-4xl font-black mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
            Production API Monitoring
          </h2>
          <p className={`text-sm sm:text-lg font-bold max-w-2xl mx-auto mb-10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            The Indi Runtime SDK monitors your API contracts in production. It learns what "normal" looks like, then alerts you when something drifts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: <Shield className="w-6 h-6" />, title: 'Contract Validation', desc: 'Validates every response against learned schemas' },
              { icon: <Zap className="w-6 h-6" />, title: 'Auto-Learning', desc: 'Builds confidence over time — no manual config' },
              { icon: <Mail className="w-6 h-6" />, title: 'Email Alerts', desc: 'Get notified the moment something breaks' },
            ].map((item) => (
              <div key={item.title} className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg`}>
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white mb-4">
                  {item.icon}
                </div>
                <h3 className={`font-black text-base mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>{item.title}</h3>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Install + Code Example */}
      <section className={`py-16 sm:py-24 px-4 ${darkMode ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-3xl mx-auto">
          <h2 className={`text-2xl sm:text-4xl font-black mb-8 text-center ${darkMode ? 'text-white' : 'text-black'}`}>
            Get Started in 2 Minutes
          </h2>

          {/* Install */}
          <div className={`mb-8 p-4 sm:p-6 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Terminal className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`text-sm font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Install</span>
            </div>
            <pre className={`font-mono text-sm sm:text-base p-3 rounded-xl ${darkMode ? 'bg-black text-green-400' : 'bg-gray-900 text-green-400'} overflow-x-auto`}>
              <code>npm install indi-runtime</code>
            </pre>
          </div>

          {/* Code Example */}
          <div className={`p-4 sm:p-6 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Terminal className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`text-sm font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Usage</span>
            </div>
            <pre className={`font-mono text-xs sm:text-sm p-3 sm:p-4 rounded-xl ${darkMode ? 'bg-black text-gray-300' : 'bg-gray-900 text-gray-300'} overflow-x-auto leading-relaxed`}>
              <code>{`import { indi } from 'indi-runtime';

// Initialize with your API key
indi.init({
  apiKey: 'your-api-key',
  projectId: 'your-project-id',
});

// Start watching your API calls
indi.watch();`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* What it catches */}
      <section className={`py-16 sm:py-24 px-4 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Blobi emotion="happy" size={50} />
            <h2 className={`text-2xl sm:text-4xl font-black ${darkMode ? 'text-white' : 'text-black'}`}>
              What I Catch
            </h2>
          </div>
          <p className={`text-sm sm:text-base font-bold mb-10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            "I've got your back — nothing gets past me!"
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <FileWarning className="w-5 h-5" />, title: 'Schema Drift', desc: 'Response shape changed from what was learned', color: 'border-purple-500/60' },
              { icon: <AlertTriangle className="w-5 h-5" />, title: 'Missing Fields', desc: 'Expected fields disappeared from responses', color: 'border-pink-500/60' },
              { icon: <Shield className="w-5 h-5" />, title: 'Type Mismatches', desc: 'A string became a number, or vice versa', color: 'border-violet-500/60' },
              { icon: <Clock className="w-5 h-5" />, title: 'Slow Responses', desc: 'Response times exceeded learned baselines', color: 'border-blue-500/60' },
              { icon: <Zap className="w-5 h-5" />, title: 'Unexpected Status', desc: 'Status codes that deviate from the norm', color: 'border-cyan-500/60' },
              { icon: <Mail className="w-5 h-5" />, title: 'Email Notifications', desc: 'Get alerts straight to your inbox', color: 'border-green-500/60' },
            ].map((item) => (
              <div key={item.title} className={`relative p-5 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${item.color} shadow-lg text-left transition-all hover:scale-105`}>
                <div className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.icon}</div>
                <h3 className={`font-black text-sm mb-1 ${darkMode ? 'text-white' : 'text-black'}`}>{item.title}</h3>
                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auto-learning */}
      <section className={`py-16 sm:py-24 px-4 ${darkMode ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`text-2xl sm:text-4xl font-black mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
            Auto-Learning Detection
          </h2>
          <p className={`text-sm sm:text-lg font-bold mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No manual schemas needed. The SDK observes your API responses, builds confidence over time, and starts detecting anomalies automatically.
          </p>

          <div className={`p-6 sm:p-8 rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-gray-50 border border-gray-200'} shadow-lg`}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              {[
                { step: '1', label: 'Observe', desc: 'Watches API calls silently' },
                { step: '2', label: 'Learn', desc: 'Builds response schemas' },
                { step: '3', label: 'Detect', desc: 'Flags anomalies with confidence' },
              ].map((item, i) => (
                <div key={item.step} className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black flex items-center justify-center mb-2 mx-auto">
                      {item.step}
                    </div>
                    <h4 className={`font-black text-sm ${darkMode ? 'text-white' : 'text-black'}`}>{item.label}</h4>
                    <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                  </div>
                  {i < 2 && <ArrowRight className={`hidden sm:block w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`py-16 sm:py-24 px-4 text-center ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <Blobi emotion="happy" size={60} className="mx-auto mb-6" />
        <h2 className={`text-2xl sm:text-4xl font-black mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
          Ready to Monitor Your APIs?
        </h2>
        <p className={`text-sm sm:text-lg font-bold mb-8 max-w-xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Sign up free, grab your API key, and start watching in under 2 minutes.
        </p>
        <a
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-4 font-bold text-base sm:text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:scale-105 transform transition-all duration-300 shadow-lg"
        >
          Sign Up Free
          <ArrowRight className="w-5 h-5" />
        </a>
      </section>

      <Footer />
    </div>
  );
}
