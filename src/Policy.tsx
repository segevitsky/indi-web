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
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>
                <strong>Local storage only:</strong> We store network data, flows, console logs, and indicators on your computer to make the extension work.
              </p>
              <p>
                <strong>No tracking:</strong> We don't spy on you, don't send your debugging data anywhere, and you can delete everything anytime you want.
              </p>
              <p>
                <strong>Optional email collection:</strong> If you express interest in Pro features, we'll collect your email via Web3Forms to notify you when it's ready. Completely optional.
              </p>
              <p>
                <strong>Your privacy matters to us.</strong> This is a developer tool built for professionals who value transparency.
              </p>
            </div>
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
                  <h3 className="font-semibold text-green-800 mb-3">✅ Local Data Only</h3>

                  <div className="mb-4">
                    <h4 className="font-semibold text-green-800 text-sm mb-2">1. Network Traffic Data</h4>
                    <ul className="text-green-700 space-y-1 text-sm ml-4">
                      <li>• <strong>What:</strong> API endpoints, request/response data, timing information, HTTP methods, status codes</li>
                      <li>• <strong>Why:</strong> To map UI interactions to API calls for debugging</li>
                      <li>• <strong>Storage:</strong> Stored locally in your browser using Chrome's storage API</li>
                      <li>• <strong>Retention:</strong> Until you manually delete flows or clear extension data</li>
                      <li>• <strong>Sharing:</strong> Never shared with anyone</li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-green-800 text-sm mb-2">2. User Flows</h4>
                    <ul className="text-green-700 space-y-1 text-sm ml-4">
                      <li>• <strong>What:</strong> Recorded sequences of user interactions and associated API calls</li>
                      <li>• <strong>Why:</strong> To replay and test user workflows</li>
                      <li>• <strong>Storage:</strong> Stored locally in your browser</li>
                      <li>• <strong>Retention:</strong> Until you manually delete flows (max 5 flows per domain on free plan)</li>
                      <li>• <strong>Sharing:</strong> Never shared with anyone</li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-green-800 text-sm mb-2">3. Console Logs</h4>
                    <ul className="text-green-700 space-y-1 text-sm ml-4">
                      <li>• <strong>What:</strong> Console errors, warnings, and logs that occur during API calls</li>
                      <li>• <strong>Why:</strong> To help debug issues by associating console output with network calls</li>
                      <li>• <strong>Storage:</strong> Stored locally in your browser</li>
                      <li>• <strong>Sharing:</strong> Never shared with anyone</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-green-800 text-sm mb-2">4. User-Created Indicators</h4>
                    <ul className="text-green-700 space-y-1 text-sm ml-4">
                      <li>• <strong>What:</strong> Names, descriptions, DOM element paths and positions you assign</li>
                      <li>• <strong>Storage:</strong> Stored locally in your browser</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">📧 Email Address (Optional - Only for Upgrade Interest)</h3>
                  <ul className="text-blue-700 space-y-1 text-sm">
                    <li>• <strong>What:</strong> Your email address if you express interest in Indi Mapper Pro</li>
                    <li>• <strong>Why:</strong> To notify you when premium features become available</li>
                    <li>• <strong>Storage:</strong> Sent to our notification service (Web3Forms)</li>
                    <li>• <strong>Retention:</strong> Until you request deletion or product launch</li>
                    <li>• <strong>Sharing:</strong> Not shared with third parties</li>
                    <li>• <strong>Opt-out:</strong> You can request deletion by emailing segevitsky@gmail.com</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">❌ What We DON'T Collect</h3>
                  <ul className="text-red-700 space-y-1 text-sm">
                    <li>• Browsing history</li>
                    <li>• Personal information from websites you visit</li>
                    <li>• Passwords or sensitive form data</li>
                    <li>• Credit card information</li>
                    <li>• Analytics or tracking data</li>
                    <li>• User accounts or authentication data</li>
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

              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-3">Data Processing</h3>
                  <ul className="text-blue-700 space-y-2 text-sm">
                    <li>• <strong>Network Interception:</strong> We use Chrome's debugger API to intercept network requests <strong>only</strong> to display them to you for debugging purposes</li>
                    <li>• <strong>Local Processing:</strong> All data processing happens locally in your browser</li>
                    <li>• <strong>No Server Upload:</strong> Your captured network data and flows are <strong>never</strong> sent to our servers</li>
                    <li>• <strong>Console Monitoring:</strong> We capture console logs (errors, warnings, etc.) for debugging - all stored locally</li>
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">Purpose</h3>
                  <ul className="text-purple-700 space-y-1 text-sm">
                    <li>• Display API indicators on web pages</li>
                    <li>• Track and monitor API performance</li>
                    <li>• Associate console errors with API calls</li>
                    <li>• Record and replay user flows for testing</li>
                    <li>• Generate reports about your API usage</li>
                    <li>• Create Jira tickets (if enabled)</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Your Control</h3>
                  <ul className="text-green-700 space-y-1 text-sm">
                    <li>• Debugger only activates when you explicitly click "Record" or "Create Indicator"</li>
                    <li>• Tab-specific monitoring - only debugs the tab you're working on</li>
                    <li>• Visual indicator shows when active</li>
                    <li>• Automatically detaches when not in use</li>
                    <li>• Never runs in background without your action</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">Data Sharing & Third-Party Services</h2>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  We do not share, sell, or transmit your debugging data to anyone.
                </h3>
                <p className="text-gray-700 mb-4">The extension only:</p>
                <ul className="text-gray-700 space-y-1">
                  <li>• Stores data locally in your browser</li>
                  <li>• Sends data to Jira (only if you explicitly create tickets)</li>
                  <li>• Communicates with your configured API endpoints (only when you interact with them)</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-3">Third-Party Service: Web3Forms</h3>
                <ul className="text-blue-800 space-y-2 text-sm">
                  <li>• <strong>Purpose:</strong> Email collection for product updates (only if you opt-in for upgrade notifications)</li>
                  <li>• <strong>Data Sent:</strong> Email address, domain name, timestamp</li>
                  <li>• <strong>Privacy Policy:</strong> <a href="https://web3forms.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">https://web3forms.com/privacy</a></li>
                  <li>• <strong>Important:</strong> This is completely optional and only happens when you explicitly express interest in Pro features</li>
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
                      <span><strong>Access:</strong> View all stored data in Chrome DevTools → Application → Storage → Extension</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span><strong>Export:</strong> Download your indicator data and flows at any time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>Delete:</strong> Remove all data by uninstalling the extension or using Chrome's "Clear extension data" option</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span><strong>Opt-out:</strong> Don't provide email for upgrade notifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span><strong>Request Deletion:</strong> Email segevitsky@gmail.com to delete any upgrade interest data we have</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Required Permissions Explained</h3>
                  <p className="text-gray-700 mb-3">The extension requests these permissions:</p>
                  <div className="space-y-3 text-sm">
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="font-semibold text-yellow-900 mb-1">⚠️ debugger Permission</p>
                      <p className="text-yellow-800 text-xs mb-1"><strong>Why:</strong> Core functionality - intercepts network traffic to map API calls to UI elements</p>
                      <p className="text-yellow-800 text-xs"><strong>Usage:</strong> Only active when you explicitly start recording. Same permission used by Chrome DevTools, React DevTools, Redux DevTools</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-300 rounded p-2">
                      <p className="text-gray-800 text-xs"><strong>&lt;all_urls&gt;:</strong> Developer tool must work on any website (localhost, staging, production)</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-300 rounded p-2">
                      <p className="text-gray-800 text-xs"><strong>storage & unlimitedStorage:</strong> Store flows, indicators, and network data locally. Unlimited storage ensures large payloads can be saved</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-300 rounded p-2">
                      <p className="text-gray-800 text-xs"><strong>desktopCapture:</strong> Optional screen recording for bug reports. Only activates when you start recording</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-300 rounded p-2">
                      <p className="text-gray-800 text-xs"><strong>webRequest:</strong> Monitor network activity for API mapping</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ul className="text-yellow-800 space-y-2 text-sm">
                  <li>• All local data is protected by Chrome's built-in storage encryption</li>
                  <li>• No sensitive data (passwords, credit cards, authentication tokens) is ever stored</li>
                  <li>• Debugger permission is only used for intended network monitoring</li>
                  <li>• We never transmit your debugging data to our servers</li>
                  <li>• No external network requests except to your specified APIs and optional Web3Forms for upgrade interest</li>
                  <li>• Extension code is open to security audits</li>
                  <li>• Regular updates to address any security concerns</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-red-900 mb-2">⚠️ Important Security Notes:</h3>
                <ul className="text-red-800 space-y-1 text-sm">
                  <li>• Be cautious when debugging production applications - Indi Mapper will capture API responses including any sensitive data returned by your APIs</li>
                  <li>• This tool is for development/testing environments only</li>
                  <li>• Do not use on production sites you don't own or have permission to debug</li>
                </ul>
              </div>
            </section>

            {/* Developer Transparency */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">Developer Transparency</h2>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <p className="text-purple-900 font-semibold mb-4">This is a developer tool for professionals.</p>
                <div className="space-y-3 text-sm text-purple-800">
                  <p>The <code className="bg-purple-100 px-2 py-1 rounded">debugger</code> permission is <strong>required</strong> for our core functionality - intercepting network calls to map them to UI elements.</p>
                  <p>This is the <strong>same permission</strong> used by Chrome DevTools, React DevTools, and Redux DevTools.</p>
                  <p>We do <strong>not</strong> use it for tracking, analytics, data collection, or any purpose other than displaying network data to you for debugging.</p>

                  <div className="mt-4 bg-white border border-purple-300 rounded p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">Recommendations for Users:</h4>
                    <ul className="space-y-1 text-purple-800">
                      <li>• Only install on developer/testing browsers (not your personal browsing browser)</li>
                      <li>• Disable or remove when not actively debugging</li>
                      <li>• Review stored data using Chrome DevTools (Application → Storage → Extension)</li>
                      <li>• Only use on applications you own or have permission to debug</li>
                    </ul>
                  </div>
                </div>
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
                    <li>• Email: <a href="mailto:segevitsky@gmail.com" className="text-pink-600 hover:underline">segevitsky@gmail.com</a></li>
                    <li>• GitHub Issues (if applicable)</li>
                    <li>• Extension Store Reviews</li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Policy Updates:</h3>
                  <p className="text-gray-700 text-sm">
                    We'll notify you of changes through extension updates,
                    in-app announcements, or version notes. Continued use after changes constitutes acceptance.
                  </p>
                </div>
              </div>
            </section>

            {/* Children's Privacy */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800">
                  Indi Mapper is a developer tool not intended for use by children under 13.
                </p>
              </div>
            </section>

            {/* Compliance */}
            <section className="mb-10">
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

            {/* Agreement */}
            <section>
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-300 rounded-lg p-6 text-center">
                <p className="text-gray-900 font-semibold">
                  By installing and using Indi Mapper, you agree to this Privacy Policy.
                </p>
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