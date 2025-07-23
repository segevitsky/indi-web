import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Users, Shield, AlertTriangle, Gavel, RefreshCw, Mail } from 'lucide-react';

const TermsOfService = () => {
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
              Terms of Service
            </h1>
            <p className="text-gray-600">
              The rules and guidelines for using INDI Mapper
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
              <FileText className="w-6 h-6 text-pink-500" />
              <h2 className="text-xl font-semibold text-gray-900">TL;DR - The Simple Version</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Use INDI Mapper responsibly. Don't break things, don't abuse the service, and respect others. 
              We provide the tool "as is" and we're not responsible if something goes wrong with your APIs. 
              Be nice, and we'll be nice back! 🤝
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            
            {/* Acceptance of Terms */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <Gavel className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">1. Acceptance of Terms</h2>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-blue-800 leading-relaxed">
                  By installing, accessing, or using INDI Mapper ("the Extension"), you agree to be bound by these Terms of Service ("Terms"). 
                  If you disagree with any part of these terms, please do not use our extension.
                </p>
                <div className="mt-4 p-3 bg-blue-100 rounded">
                  <p className="text-blue-900 text-sm font-medium">
                    ✅ Installing the extension = You accept these terms
                  </p>
                </div>
              </div>
            </section>

            {/* Description of Service */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">2. Description of Service</h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  INDI Mapper is a Chrome extension that helps developers visualize, monitor, and optimize API integrations by:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">✅ What We Provide</h3>
                    <ul className="text-green-700 space-y-1 text-sm">
                      <li>• API call visualization and mapping</li>
                      <li>• Performance monitoring tools</li>
                      <li>• Element-to-API association features</li>
                      <li>• Data export capabilities</li>
                      <li>• Integration with project management tools</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Service Limitations</h3>
                    <ul className="text-yellow-700 space-y-1 text-sm">
                      <li>• Works only on supported websites</li>
                      <li>• Requires specific browser permissions</li>
                      <li>• Limited by Chrome extension policies</li>
                      <li>• Depends on third-party API availability</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* User Responsibilities */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">3. User Responsibilities</h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-3">✅ You SHOULD:</h3>
                  <ul className="text-green-700 space-y-2">
                    <li>• Use the extension for legitimate development and debugging purposes</li>
                    <li>• Respect the privacy and security of websites you visit</li>
                    <li>• Keep your extension updated to the latest version</li>
                    <li>• Report bugs and security issues responsibly</li>
                    <li>• Comply with the website's own terms of service</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-3">❌ You MUST NOT:</h3>
                  <ul className="text-red-700 space-y-2">
                    <li>• Use the extension for malicious purposes or attacks</li>
                    <li>• Attempt to reverse engineer or modify the extension</li>
                    <li>• Share or distribute sensitive data collected by the extension</li>
                    <li>• Violate any applicable laws or regulations</li>
                    <li>• Interfere with the extension's normal operation</li>
                    <li>• Use the extension to access unauthorized systems</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Privacy and Data */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">4. Privacy and Data</h2>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <p className="text-purple-800 leading-relaxed mb-4">
                  Your privacy is important to us. Our data collection and usage practices are detailed in our 
                  <button 
                    onClick={() => navigate('/privacy-policy')}
                    className="text-purple-600 hover:text-purple-800 underline font-medium mx-1"
                  >
                    Privacy Policy
                  </button>
                  which is incorporated into these Terms by reference.
                </p>
                <div className="bg-purple-100 rounded p-3">
                  <p className="text-purple-900 text-sm">
                    <strong>Key Point:</strong> All data is stored locally on your device. We don't send your data to external servers.
                  </p>
                </div>
              </div>
            </section>

            {/* Disclaimer of Warranties */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">5. Disclaimer of Warranties</h2>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="space-y-4">
                  <p className="text-yellow-800 font-semibold">
                    INDI Mapper is provided "AS IS" and "AS AVAILABLE" without warranties of any kind.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-2">We Don't Guarantee:</h4>
                      <ul className="text-yellow-700 space-y-1 text-sm">
                        <li>• Uninterrupted service</li>
                        <li>• Error-free operation</li>
                        <li>• Compatibility with all websites</li>
                        <li>• Accuracy of monitoring data</li>
                        <li>• Protection against data loss</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-2">Use at Your Own Risk:</h4>
                      <ul className="text-yellow-700 space-y-1 text-sm">
                        <li>• Monitor your own systems responsibly</li>
                        <li>• Back up important data</li>
                        <li>• Test in safe environments first</li>
                        <li>• Don't rely solely on our extension</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">6. Limitation of Liability</h2>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-800 leading-relaxed mb-4">
                  <strong>Important:</strong> To the maximum extent permitted by law, INDI Mapper and its developers 
                  shall not be liable for any indirect, incidental, special, or consequential damages resulting from 
                  your use of the extension.
                </p>
                
                <div className="bg-red-100 rounded p-4">
                  <h4 className="font-semibold text-red-900 mb-2">This Includes But Is Not Limited To:</h4>
                  <ul className="text-red-800 space-y-1 text-sm">
                    <li>• Loss of data or profits</li>
                    <li>• Business interruption</li>
                    <li>• System downtime or failures</li>
                    <li>• Security breaches on monitored systems</li>
                    <li>• Damage to reputation or relationships</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Updates and Changes */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <RefreshCw className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">7. Updates and Changes</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Extension Updates</h3>
                  <p className="text-blue-700 text-sm">
                    We may update the extension to add features, fix bugs, or improve security. 
                    Updates may be installed automatically through the Chrome Web Store.
                  </p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Terms Updates</h3>
                  <p className="text-gray-700 text-sm">
                    We reserve the right to modify these Terms at any time. Changes will be effective 
                    immediately upon posting. Continued use of the extension constitutes acceptance of updated Terms.
                  </p>
                </div>
              </div>
            </section>

            {/* Termination */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">8. Termination</h2>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">You Can:</h4>
                    <p className="text-gray-700 text-sm">
                      Stop using the extension at any time by uninstalling it from your browser. 
                      Your local data will be removed with the extension.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">We Can:</h4>
                    <p className="text-gray-700 text-sm">
                      Discontinue the extension or restrict access if you violate these Terms or 
                      for any other reason at our sole discretion.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Governing Law */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <Gavel className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">9. Governing Law</h2>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction]. 
                  Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in [Your Location].
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-900">10. Contact Information</h2>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <p className="text-green-800 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                
                <div className="space-y-2 text-green-700">
                  <p>📧 <strong>Email:</strong> support@indimapper.com</p>
                  <p>🌐 <strong>Website:</strong> [Your Website URL]</p>
                  <p>📋 <strong>GitHub:</strong> [Your GitHub Repository] (if applicable)</p>
                </div>
                
                <div className="mt-4 p-3 bg-green-100 rounded">
                  <p className="text-green-900 text-sm">
                    <strong>Response Time:</strong> We aim to respond to all inquiries within 48 hours.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Back to Top */}
          <div className="text-center mt-12">
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:opacity-90 transition-opacity mr-4"
            >
              Back to Home
            </button>
            <button 
              onClick={() => navigate('/privacy-policy')}
              className="px-6 py-3 border-2 border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50 transition-colors"
            >
              View Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;