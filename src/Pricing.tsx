import { useState } from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const [selectedPlan] = useState(null);
  const [showBetaForm, setShowBetaForm] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    useCase: '',
    expectedUsage: 'low' // low, medium, high
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free Beta',
      price: '$0',
      period: 'Limited time offer',
      features: [
        'Up to 25 indicators',
        'All integrations included',
        'Priority beta access',
        'Shape the product roadmap',
        'Early adopter benefits',
        '3 Allowed Domains'
      ],
      isAvailable: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      period: 'Coming soon',
      features: [
        'Unlimited indicators',
        'Advanced API monitoring',
        'Priority support',
        'All integrations',
        'Custom notifications'
      ],
      isAvailable: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: 'Coming soon',
      features: [
        'Everything in Pro',
        'Dedicated support',
        'Custom features',
        'SLA guarantee',
        'Advanced analytics'
      ],
      isAvailable: false
    }
  ];

//   const handleSelectPlan = (planId: any) => {
//     console.log('Selected plan:', planId);
//     return;
//     if (planId === 'free') {
//       setSelectedPlan(planId);
//       setShowBetaForm(true);
//     }
//   };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
    //   await saveBetaUserData(formData);
      
      // הצג הודעת הצלחה
      alert('Welcome to the Beta program! Redirecting to your dashboard...');
      
      // מעבר לדשבורד
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error saving beta user data:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indi-purple-50 via-white to-indi-pink-50 py-24 px-4" id="pricing">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-headline font-bold text-5xl md:text-6xl mb-6 bg-gradient-to-r from-indi-pink-500 via-indi-purple-500 to-indi-purple-600 bg-clip-text text-transparent">
            Join Our Beta Program
          </h1>
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-indi-purple-400 to-transparent rounded-full"></div>
            <div className="w-2 h-2 bg-indi-pink-500 rounded-full animate-pulse"></div>
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-indi-pink-400 to-transparent rounded-full"></div>
          </div>
          <p className="font-sans text-xl text-gray-600 max-w-2xl mx-auto">
            Be among the first to try our tool and help shape its future.
            Get exclusive early access benefits and priority support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`group bg-white rounded-3xl shadow-xl p-8 relative transition-all duration-300 border-2 ${
                plan.id === 'free'
                  ? 'border-indi-purple-300 hover:border-indi-purple-400 hover:shadow-2xl hover:scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              } ${
                !plan.isAvailable ? 'opacity-60' : ''
              } ${
                selectedPlan === plan.id ? 'ring-4 ring-indi-purple-400' : ''
              }`}
            >
              {/* Badge for Free Plan */}
              {plan.id === 'free' && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="font-sans font-bold bg-gradient-to-r from-indi-pink-500 via-indi-purple-500 to-indi-purple-600 text-white px-6 py-2 rounded-full text-sm shadow-lg border-2 border-white">
                    ✨ Available Now
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8 mt-4">
                <h3 className="font-headline font-bold text-3xl mb-3 text-gray-900">{plan.name}</h3>
                <div className="font-headline font-bold text-5xl mb-2 bg-gradient-to-r from-indi-pink-500 to-indi-purple-600 bg-clip-text text-transparent">
                  {plan.price}
                </div>
                <div className="font-sans text-gray-500 font-medium">{plan.period}</div>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start font-sans">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-indi-pink-400 to-indi-purple-500 flex items-center justify-center mr-3 mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => navigate('/register')}
                disabled={!plan.isAvailable}
                className={`w-full py-4 rounded-full font-sans font-bold transition-all duration-300 ${
                  plan.isAvailable
                    ? plan.id === 'free'
                      ? 'bg-gradient-to-r from-indi-pink-500 via-indi-purple-500 to-indi-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 border-2 border-white'
                      : 'border-2 border-indi-purple-400 text-indi-purple-600 hover:bg-indi-purple-50 hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {plan.isAvailable ? 'Get Started' : 'Coming Soon'}
              </button>
            </div>
          ))}
        </div>

        {/* Beta Registration Form */}
        {showBetaForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-indi-purple-200">
              <h3 className="font-headline font-bold text-3xl mb-6 bg-gradient-to-r from-indi-pink-500 to-indi-purple-600 bg-clip-text text-transparent">
                Complete Beta Registration
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block font-sans font-semibold text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indi-purple-400 focus:ring-4 focus:ring-indi-purple-100 outline-none transition-all font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block font-sans font-semibold text-gray-700 mb-2">Your Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indi-purple-400 focus:ring-4 focus:ring-indi-purple-100 outline-none transition-all font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block font-sans font-semibold text-gray-700 mb-2">How will you use our tool?</label>
                  <textarea
                    value={formData.useCase}
                    onChange={(e) => setFormData({...formData, useCase: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indi-purple-400 focus:ring-4 focus:ring-indi-purple-100 outline-none transition-all font-sans resize-none"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block font-sans font-semibold text-gray-700 mb-2">Expected Usage</label>
                  <select
                    value={formData.expectedUsage}
                    onChange={(e) => setFormData({...formData, expectedUsage: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indi-purple-400 focus:ring-4 focus:ring-indi-purple-100 outline-none transition-all font-sans"
                    required
                  >
                    <option value="low">1-5 APIs</option>
                    <option value="medium">6-15 APIs</option>
                    <option value="high">15+ APIs</option>
                  </select>
                </div>

                <div className="flex space-x-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBetaForm(false)}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 hover:scale-105 transition-all font-sans font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-gradient-to-r from-indi-pink-500 via-indi-purple-500 to-indi-purple-600 text-white rounded-full hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sans font-bold border-2 border-white shadow-lg"
                  >
                    {isSubmitting ? 'Processing...' : 'Complete Registration'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;