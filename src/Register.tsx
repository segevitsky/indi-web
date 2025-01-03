import { useState } from 'react';
import { Mail, Lock, Building, User } from 'lucide-react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    role: '',
    useCase: '',
    expectedUsage: 'low'
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // יצירת משתמש חדש בפיירבייס
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // שמירת פרטי הבטא בפיירסטור
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: formData.email,
        company: formData.company,
        role: formData.role,
        useCase: formData.useCase,
        expectedUsage: formData.expectedUsage,
        plan: 'free',
        status: 'beta',
        createdAt: new Date().toISOString(),
        limits: {
          indicators: 25,
          integrations: true
        }
      });

      // ניווט לדשבורד
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(
        error.code === 'auth/email-already-in-use'
          ? 'This email is already registered'
          : error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  // שאר הקוד של הקומפוננטה נשאר זהה...
  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
          Join the Beta
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <label className="block text-gray-700 mb-2">Company Name</label>
            <div className="relative">
              <Building className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                placeholder="Your Company"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-gray-700 mb-2">Your Role</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                placeholder="e.g. Developer, Product Manager"
              />
            </div>
          </div>

          {/* Use Case */}
          <div>
            <label className="block text-gray-700 mb-2">How will you use our tool?</label>
            <textarea
              required
              value={formData.useCase}
              onChange={(e) => setFormData({...formData, useCase: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
              rows={3}
              placeholder="Tell us about your use case..."
            />
          </div>

          {/* Expected Usage */}
          <div>
            <label className="block text-gray-700 mb-2">Expected API Usage</label>
            <select
              required
              value={formData.expectedUsage}
              onChange={(e) => setFormData({...formData, expectedUsage: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
            >
              <option value="low">1-5 APIs</option>
              <option value="medium">6-15 APIs</option>
              <option value="high">15+ APIs</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-rose-500 hover:text-rose-600 font-medium">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;