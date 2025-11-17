import { useState, useEffect } from "react";


export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');
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
      } else {
        throw new Error('Failed to send');
      }
      
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
    }
  };
  
  return (
    <section id="contact" className="min-h-screen bg-gray-50 dark:bg-black py-24">
    <div className="container mx-auto px-6 max-w-2xl">
      <h2 className="text-4xl font-bold text-center mb-4 text-black dark:text-white">
        Get in Touch
      </h2>
      <div className="flex justify-center items-center gap-2 mb-16">
        <div className={`w-16 h-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full`}></div>
        <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-90"></div>
        <div className={`w-16 h-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full`}></div>
      </div>
      <form className="space-y-6">
        <div>
          <label className="block text-black dark:text-white mb-2 font-semibold">Name</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:border-gray-400 dark:focus:border-gray-600 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-800 outline-none transition-all"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-black dark:text-white mb-2 font-semibold">Email</label>
          <input
            type="email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:border-gray-400 dark:focus:border-gray-600 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-800 outline-none transition-all"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-black dark:text-white mb-2 font-semibold">Message</label>
          <textarea
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:border-gray-400 dark:focus:border-gray-600 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-800 outline-none transition-all h-32"
            placeholder="Your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>
        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="w-full py-3 rounded-lg hover:opacity-100 font-bold shadow-lg transition-all opacity-90"
        >
          Send Message
        </button>
      </form>
      {submitStatus === 'loading' && <p className="text-center text-gray-500 dark:text-gray-500 mt-4">Sending...</p>}
      {submitStatus === 'success' && <p className="text-center text-green-600 dark:text-green-400 mt-4">Message sent successfully!</p>}
      {submitStatus === 'error' && <p className="text-center text-red-600 dark:text-red-400 mt-4">Failed to send message. Please try again.</p>}
    </div>
  </section>
  )
}
