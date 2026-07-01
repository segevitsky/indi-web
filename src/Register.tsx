import { useState } from 'react';
import { Mail, Lock, Building, User } from 'lucide-react';
import { signUpWithEmail } from './supabase/auth';
import Blobi from './Blobi';

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
  const [confirmEmail, setConfirmEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUpWithEmail(formData.email, formData.password, {
        company: formData.company,
        role: formData.role,
        useCase: formData.useCase,
        expectedUsage: formData.expectedUsage,
      });

      if (error) throw error;

      setConfirmEmail(true);
    } catch (error: unknown) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-purple-600 focus:bg-white transition';

  if (confirmEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <Blobi emotion="happy" size={64} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3 text-gray-900">Check your email</h2>
          <p className="text-gray-600 mb-2">We sent a confirmation link to</p>
          <p className="font-semibold text-gray-900 mb-6">{formData.email}</p>
          <p className="text-sm text-gray-600 mb-6">
            Click the link in the email to verify your account, then come back and sign in.
          </p>
          <a href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Blobi emotion="happy" size={32} showBadge={false} />
          <span className="text-xl font-bold text-purple-600">INDI</span>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2 text-center">
            API Intelligence System
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Join the Beta</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputClass}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Company Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className={inputClass}
                  placeholder="Your Company"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Your Role</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Developer, Product Manager"
                />
              </div>
            </div>

            {/* Use Case */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">How will you use our tool?</label>
              <textarea
                required
                value={formData.useCase}
                onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-purple-600 focus:bg-white transition"
                rows={3}
                placeholder="Tell us about your use case..."
              />
            </div>

            {/* Expected Usage */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Expected API Usage</label>
              <select
                required
                value={formData.expectedUsage}
                onChange={(e) => setFormData({ ...formData, expectedUsage: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-purple-600 focus:bg-white transition"
              >
                <option value="low">1-5 APIs</option>
                <option value="medium">6-15 APIs</option>
                <option value="high">15+ APIs</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
