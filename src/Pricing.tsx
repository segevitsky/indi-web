import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
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
        'Early adopter benefits'
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

  const handleSelectPlan = (planId) => {
    console.log('Selected plan:', planId);
    return;
    if (planId === 'free') {
      setSelectedPlan(planId);
      setShowBetaForm(true);
    }
  };

  const handleSubmit = async (e) => {
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
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-4">
            Join Our Beta Program
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Be among the first to try our tool and help shape its future. 
            Get exclusive early access benefits and priority support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-lg p-8 relative transition-all ${
                !plan.isAvailable ? 'opacity-50' : ''
              } ${
                selectedPlan === plan.id ? 'ring-2 ring-rose-500' : ''
              }`}
            >
              {plan.id === 'free' && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-1 rounded-full text-sm">
                    Available Now
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-2">{plan.price}</div>
                <div className="text-gray-500">{plan.period}</div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/register')}
                disabled={!plan.isAvailable}
                className={`w-full py-3 rounded-lg transition-colors ${
                  plan.isAvailable
                    ? selectedPlan === plan.id
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                      : 'border-2 border-rose-500 text-rose-500 hover:bg-rose-50'
                    : 'cursor-not-allowed'
                }`}
              >
                {plan.isAvailable ? 'Get Started' : 'Coming Soon'}
              </button>
            </div>
          ))}
        </div>

        {/* Beta Registration Form */}
        {showBetaForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-6">Complete Beta Registration</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Your Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">How will you use our tool?</label>
                  <textarea
                    value={formData.useCase}
                    onChange={(e) => setFormData({...formData, useCase: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Expected Usage</label>
                  <select
                    value={formData.expectedUsage}
                    onChange={(e) => setFormData({...formData, expectedUsage: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                    required
                  >
                    <option value="low">1-5 APIs</option>
                    <option value="medium">6-15 APIs</option>
                    <option value="high">15+ APIs</option>
                  </select>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowBetaForm(false)}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
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