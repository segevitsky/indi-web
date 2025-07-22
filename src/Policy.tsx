import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Database, Users, Lock, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </div>
          <div className="mt-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-2">
              Privacy Policy
            </h1>
            <p className="text-gray-600">
              How we collect, use, and protect your data
            </p>
            <div className="text-sm text-gray-500 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Quick Summary */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-pink-500" />
              <h2 className="text-xl font-semibold text-gray-900">TL;DR - The Simple Version</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We only store data on your computer to make the extension work. We don't spy on you, 
              don't send your data anywhere, and you can delete everything anytime you want. 
              Your privacy matters to us.
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            
            {/* What We Collect */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">What We Collect</h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Local Data Only</h3>
                  <ul className="text-green-700 space-y-1 text-sm">
                    <li>• <strong>API Call Information:</strong> URLs, HTTP methods, response times, and status codes</li>
                    <li>• <strong>Element Mapping Data:</strong> DOM element paths and their associated API calls</li>
                    <li>• <strong>User-Created Indicators:</strong> Names, descriptions, and positions you assign</li>
                    <li>• <strong>Extension Settings:</strong> Your preferences for the extension's behavior</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">❌ What We DON'T Collect</h3>
                  <ul className="text-red-700 space-y-1 text-sm">
                    <li>• Personal information or login credentials</li>
                    <li>• Sensitive API response data or payloads</li>
                    <li>• Browsing history outside of mapped APIs</li>
                    <li>• Any data from third-party websites</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Data */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">How We Use Your Data</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Local Storage</h3>
                  <ul className="text-blue-700 space-y-1 text-sm">
                    <li>• Stored locally on your browser using Chrome's storage API</li>
                    <li>• Nothing sent to external servers or third parties</li>
                    <li>• Data remains on your device under your control</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">Purpose</h3>
                  <ul className="text-purple-700 space-y-1 text-sm">
                    <li>• Display API indicators on web pages</li>
                    <li>• Track and monitor API performance</li>
                    <li>• Generate reports about your API usage</li>
                    <li>• Create Jira tickets (if enabled)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">Data Sharing</h2>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  We do not share, sell, or transmit your data to anyone.
                </h3>
                <p className="text-gray-700 mb-4">The extension only:</p>
                <ul className="text-gray-700 space-y-1">
                  <li>• Stores data locally in your browser</li>
                  <li>• Sends data to Jira (only if you explicitly create tickets)</li>
                  <li>• Communicates with your configured API endpoints (only when you interact with them)</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Data Control</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>View:</strong> Access all stored data through the extension panel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span><strong>Export:</strong> Download your indicator data at any time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>Delete:</strong> Clear all data with one click in settings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span><strong>Control:</strong> Enable/disable data collection features</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Permissions</h3>
                  <p className="text-gray-700 mb-3">The extension requests these permissions:</p>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li>• <strong>activeTab:</strong> To analyze API calls on the current page</li>
                    <li>• <strong>storage:</strong> To save your indicators and settings locally</li>
                    <li>• <strong>debugger:</strong> To monitor network requests (optional)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">Security</h2>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ul className="text-yellow-800 space-y-2">
                  <li>• Data is encrypted using Chrome's built-in storage security</li>
                  <li>• No external network requests except to your specified APIs</li>
                  <li>• Extension code is open to security audits</li>
                  <li>• Regular updates to address any security concerns</li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">Contact & Changes</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">For Privacy Concerns:</h3>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li>• Email: support@indimapper.com</li>
                    <li>• GitHub Issues (if applicable)</li>
                    <li>• Extension Store Reviews</li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Policy Updates:</h3>
                  <p className="text-gray-700 text-sm">
                    We'll notify you of changes through extension updates, 
                    in-app announcements, or version notes.
                  </p>
                </div>
              </div>
            </section>

            {/* Compliance */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Compliance</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 mb-2">This extension complies with:</p>
                <ul className="text-green-700 space-y-1 text-sm">
                  <li>• Chrome Web Store Developer Program Policies</li>
                  <li>• GDPR principles (data minimization, user control)</li>
                  <li>• Standard web privacy best practices</li>
                </ul>
              </div>
            </section>
          </div>

          {/* Back to Top */}
          <div className="text-center mt-12">
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;