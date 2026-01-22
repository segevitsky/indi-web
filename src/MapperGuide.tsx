import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle } from 'lucide-react';
import Blobi from './Blobi';

// Browser Mock Component (same as in Home.tsx)
const BrowserMock = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <div
    className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl overflow-hidden border-[3px] ${dark ? 'border-purple-500/70' : 'border-gray-900/40'} w-full max-w-2xl mx-auto`}
    style={{
      transform: 'rotate(-0.5deg)',
      boxShadow: dark
        ? '8px 8px 0px rgba(139, 92, 246, 0.3), 12px 12px 20px rgba(0, 0, 0, 0.5)'
        : '6px 6px 0px rgba(0, 0, 0, 0.1), 10px 10px 30px rgba(0, 0, 0, 0.15)',
    }}
  >
    <div className={`${dark ? 'bg-gray-900' : 'bg-gray-900'} px-4 py-3 flex items-center gap-2`}>
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-700" />
        <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-yellow-700" />
        <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-700" />
      </div>
      <div className="flex-1 bg-gray-800 rounded px-3 py-1.5 text-xs text-gray-300 font-mono border border-gray-700">
        chrome://extensions
      </div>
    </div>
    <div className={`p-4 sm:p-6 ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>{children}</div>
  </div>
);

const MapperGuide = () => {
  const navigate = useNavigate();
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

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/indi-mapper.zip';
    link.download = 'indi-mapper.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 ${darkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-600 hover:text-purple-500'} transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
          <div className="flex flex-col items-center gap-4 mb-6">
            <Blobi emotion="happy" size={80} />
            <div className={`relative p-4 sm:p-6 rounded-2xl ${darkMode ? 'bg-gray-900 text-white border-2 border-purple-500/50' : 'bg-white text-black border-2 border-gray-300'} font-bold text-base sm:text-xl max-w-md shadow-2xl`}>
              "Let me show you how to install me! It's super easy! 🚀"
            </div>
          </div>

          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-black mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
            Installation Guide
          </h1>
          <p className={`text-base sm:text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Just 4 quick steps and you'll be debugging like a pro!
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">

          {/* Step 1 */}
          <div className={`p-6 sm:p-8 rounded-3xl ${darkMode ? 'bg-gray-900 border-2 border-gray-800' : 'bg-white border-2 border-gray-200'} shadow-xl`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
                1
              </div>
              <h2 className={`text-xl sm:text-2xl font-black ${darkMode ? 'text-white' : 'text-black'}`}>
                Download the ZIP 📦
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1">
                <p className={`text-sm sm:text-base mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Click the button to download the extension file. It's tiny!
                </p>
                <button
                  onClick={handleDownload}
                  className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:scale-105 transition-all shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Download indi-mapper.zip
                  <span className="group-hover:translate-y-1 transition-transform">⬇️</span>
                </button>
              </div>
              <Blobi emotion="calm" size={60} />
            </div>
          </div>

          {/* Step 2 */}
          <div className={`p-6 sm:p-8 rounded-3xl ${darkMode ? 'bg-gray-900 border-2 border-gray-800' : 'bg-white border-2 border-gray-200'} shadow-xl`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
                2
              </div>
              <h2 className={`text-xl sm:text-2xl font-black ${darkMode ? 'text-white' : 'text-black'}`}>
                Unzip It 📂
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Blobi emotion="calm" size={60} />
              <div className="flex-1">
                <div className={`relative p-3 rounded-xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-300'} mb-4`}>
                  <p className={`font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Right-click → Extract All (Windows)<br/>
                    Double-click to unzip (Mac)
                  </p>
                </div>
                <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} font-semibold`}>
                  💡 Remember where you saved it!
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 - Browser Mock */}
          <div className={`p-6 sm:p-8 rounded-3xl ${darkMode ? 'bg-gray-900 border-2 border-gray-800' : 'bg-white border-2 border-gray-200'} shadow-xl`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
                3
              </div>
              <h2 className={`text-xl sm:text-2xl font-black ${darkMode ? 'text-white' : 'text-black'}`}>
                Open Chrome Extensions 🧩
              </h2>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-4 mb-4">
                <Blobi emotion="happy" size={50} />
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800 text-white border border-purple-500/50' : 'bg-white text-black border-2 border-gray-300'} font-bold text-sm shadow-lg`}>
                  "Type this in your address bar! 👆"
                </div>
              </div>

              <BrowserMock dark={darkMode}>
                <div className="space-y-4">
                  {/* Developer Mode Toggle */}
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Extensions</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Developer mode</span>
                      <div className="w-10 h-5 bg-purple-500 rounded-full relative">
                        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow"></div>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <button className={`px-4 py-2 ${darkMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-500 hover:bg-purple-600'} text-white rounded-lg text-sm font-bold transition-colors animate-pulse`}>
                      Load unpacked 👈 Click this!
                    </button>
                    <button className={`px-4 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${darkMode ? 'text-gray-300' : 'text-gray-600'} rounded-lg text-sm`}>
                      Pack extension
                    </button>
                  </div>

                  {/* Extension Card Preview */}
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'} flex items-center gap-3`}>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🎯</span>
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-black'}`}>Indi Mapper</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your extension will appear here!</div>
                    </div>
                    <div className="w-8 h-4 bg-green-500 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </BrowserMock>
            </div>
          </div>

          {/* Step 4 */}
          <div className={`p-6 sm:p-8 rounded-3xl ${darkMode ? 'bg-gray-900 border-2 border-gray-800' : 'bg-white border-2 border-gray-200'} shadow-xl`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
                4
              </div>
              <h2 className={`text-xl sm:text-2xl font-black ${darkMode ? 'text-white' : 'text-black'}`}>
                Select the Folder 📁
              </h2>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} mb-4`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📂</span>
                <div className={`flex-1 p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-white'} font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Downloads / indi-mapper
                </div>
                <button className="px-3 py-1 bg-purple-500 text-white rounded text-sm font-bold">
                  Select
                </button>
              </div>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Navigate to where you unzipped the folder and select it
              </p>
            </div>
          </div>

          {/* Success */}
          <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-r ${darkMode ? 'from-green-900/50 to-emerald-900/50 border-2 border-green-500/50' : 'from-green-50 to-emerald-50 border-2 border-green-300'} shadow-xl`}>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex items-center gap-4">
                <CheckCircle className={`w-12 h-12 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                <Blobi emotion="happy" size={70} />
              </div>

              <h2 className={`text-2xl sm:text-3xl font-black ${darkMode ? 'text-white' : 'text-black'}`}>
                You're All Set! 🎉
              </h2>

              <p className={`text-base sm:text-lg ${darkMode ? 'text-green-300' : 'text-green-700'} max-w-md`}>
                Now go to any website and click on me in your toolbar to start mapping APIs!
              </p>

              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {['✓ Pin me to toolbar', '✓ Visit any website', '✓ Click to start!'].map((tip, i) => (
                  <span key={i} className={`px-3 py-1 rounded-full text-sm font-bold ${darkMode ? 'bg-green-800 text-green-200' : 'bg-green-200 text-green-800'}`}>
                    {tip}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center pt-4">
            <button
              onClick={() => navigate('/')}
              className={`px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 ${darkMode ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900'}`}
            >
              ← Back to Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapperGuide;
