import { useState, useEffect } from 'react';
import { X, Zap, Shield, BarChart3, Users, ArrowRight, Sparkles } from 'lucide-react';

const IndieMapperMarketingPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [email, setEmail] = useState('');
  const [currentFeature, setCurrentFeature] = useState(0);
  const [submitStatus, setSubmitStatus] = useState(''); // 'success', 'error', 'loading'

  const features = [
    { icon: <Zap className="w-6 h-6" />, text: "Real-time API mapping" },
    { icon: <Shield className="w-6 h-6" />, text: "Security monitoring" },
    { icon: <BarChart3 className="w-6 h-6" />, text: "Performance analytics" },
    { icon: <Users className="w-6 h-6" />, text: "Team collaboration" }
  ];

  useEffect(() => {
    // Show popup after 3 seconds
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Cycle through features every 2 seconds
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      setSubmitStatus('error');
      return;
    }

    setSubmitStatus('loading');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_key: 'acc914d7-9d0a-43b0-9bc5-e9ea0bf8e1ba',
          email: email,
          message: `🚀 New IndieMapper Pioneer Registration!
          
          Email: ${email}
          Time: ${new Date().toLocaleString()}
          Source: Marketing Popup
          Status: Lifetime Free Access Granted`,
                    from_name: 'IndieMapper Website',
                    subject: '🚀 New Pioneer Registration'
                  })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => handleClose(), 3000); // Close after 3 seconds
      } else {
        throw new Error('Failed to send');
      }
      
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-50'
        }`}
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className={`
        relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300
        ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
      `}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Gradient header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 rounded-t-2xl text-white relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full transform translate-x-6 -translate-y-6" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full transform -translate-x-4 translate-y-4" />
          
          <div className="relative z-10">
            <div className="flex items-center mb-3">
              <Sparkles className="w-8 h-8 mr-2 animate-pulse" />
              <h2 className="text-2xl font-bold">indi mapper</h2>
            </div>
            <p className="text-pink-100 text-lg leading-relaxed">
              🚀 <strong>Launch Special!</strong> We're seeking early pioneers to get <strong>lifetime free access</strong>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Dynamic feature showcase */}
          <div className="mb-6 h-16 flex items-center">
            <div className="flex items-center text-gray-700 transition-all duration-500">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center text-white mr-3 transform transition-transform duration-300 hover:scale-110">
                {features[currentFeature].icon}
              </div>
              <span className="text-lg font-medium">
                {features[currentFeature].text}
              </span>
            </div>
          </div>

          {/* Benefits list */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-gray-600">
              <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mr-3" />
              <span><strong>Lifetime free access</strong> for early adopters</span>
            </div>
            <div className="flex items-center text-gray-600">
              <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mr-3" />
              <span>Real-time API mapping & monitoring</span>
            </div>
            <div className="flex items-center text-gray-600">
              <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mr-3" />
              <span>Be part of shaping the product</span>
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-4">
            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="font-medium">🎉 Welcome Pioneer!</span>
                </div>
                <p className="text-sm mt-1">You're now guaranteed lifetime free access. Check your email!</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <span className="font-medium">Please enter a valid email address</span>
                </div>
              </div>
            )}

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (submitStatus === 'error') setSubmitStatus(''); // Clear error when typing
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                disabled={submitStatus === 'loading' || submitStatus === 'success'}
              />
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={submitStatus === 'loading' || submitStatus === 'success'}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center group ${
                submitStatus === 'loading' 
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : submitStatus === 'success'
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90 transform hover:scale-105'
              }`}
            >
              {submitStatus === 'loading' && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              )}
              <span>
                {submitStatus === 'loading' ? 'Joining...' : 
                 submitStatus === 'success' ? 'Welcome Aboard!' : 
                 'Join Early Pioneers - FREE Forever!'}
              </span>
              {submitStatus === '' && (
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              <strong>Limited time:</strong> First 100 users get lifetime access • No payment ever required
            </p>
          </div>

          {/* Social proof */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full border-2 border-white" />
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full border-2 border-white" />
                <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full border-2 border-white" />
              </div>
              <span>Join 47 early pioneers already inside!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndieMapperMarketingPopup;