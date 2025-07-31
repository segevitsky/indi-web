import { useState } from "react";


export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');


  
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
    <section id="contact" className="min-h-screen bg-white py-24">
    <div className="container mx-auto px-6 max-w-2xl">
      <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
        Get in Touch
      </h2>
      <form className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Message</label>
          <textarea
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all h-32"
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
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:opacity-90"
        >
          Send Message
        </button>
      </form>
      {submitStatus === 'loading' && <p className="text-center text-gray-500 mt-4">Sending...</p>}
      {submitStatus === 'success' && <p className="text-center text-green-500 mt-4">Message sent successfully!</p>}
      {submitStatus === 'error' && <p className="text-center text-red-500 mt-4">Failed to send message. Please try again.</p>}
    </div>
  </section>
  )
}
