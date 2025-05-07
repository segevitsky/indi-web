import  { useEffect, useState } from 'react';
import { PlusCircle, X, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saveDomainsToDatabase, getDomainsFromDatabase } from './services/userService';

// Mock data for demonstration purposes
const mockUserData: any = {
  plan: 'free',
  subscriptionLimits: {
    free: 3,
    pro: 5,
    enterprise: 999
  }
};

const DynamicDomainsForm = () => {
  const [domains, setDomains] = useState([{ id: '1', value: '', isValid: false }]);
  const [isLoading, setIsLoading] = useState(false);
  const [userPlan, setUserPlan] = useState(mockUserData.plan);
  const [toastMessage, setToastMessage] = useState({ show: false, type: '', text: '' });
  const navigate = useNavigate(); // Assuming you're using react-router-dom for navigation

  // Get domain limit based on user's plan
  const domainLimit = mockUserData.subscriptionLimits[userPlan] || 3;

  // Show toast notification
  const showToast = (type: string, text: string) => {
    setToastMessage({ show: true, type, text });
    setTimeout(() => setToastMessage({ show: false, type: '', text: '' }), 3000);
  };

  useEffect(() => {
    // Fetch existing domains from the database when the component mounts
    const fetchDomains = async () => {
      try {
        const existingDomains = await getDomainsFromDatabase(); // Replace with actual fetch function
        if (existingDomains) {
          setDomains(existingDomains.map((domain: any) => ({ ...domain, isValid: validateDomain(domain.value) })));
        }
      } catch (error) {
        showToast('error', 'Error fetching domains from database');
      }
    };
    
    fetchDomains();
  }, []);

  // Validate domain
  const validateDomain = (domain: string) => {
    try {
      if (!domain) return false;
      
      const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
      return urlPattern.test(domain);
    } catch (e) {
      return false;
    }
  };

  // Add new domain field
  const addDomain = () => {
    if (domains.length >= domainLimit) {
      showToast('warning', `Your ${userPlan} plan allows a maximum of ${domainLimit} domains.`);
      return;
    }
    
    setDomains([
      ...domains, 
      { id: Math.random().toString(36).substring(7), value: '', isValid: false }
    ]);
  };

  // Remove domain field
  const removeDomain = (id: any) => {
    setDomains(domains.filter(domain => domain.id !== id));
  };

  // Update domain value and validate
  const updateDomain = (id: any, value: any) => {
    setDomains(domains.map(domain => {
      if (domain.id === id) {
        const isValid = validateDomain(value);
        return { ...domain, value, isValid };
      }
      return domain;
    }));
  };

  // Submit form
  const handleSubmit = async () => {
    // Validate all domains
    const hasInvalidDomains = domains.some(domain => domain.value && !domain.isValid);
    
    if (hasInvalidDomains) {
      showToast('error', 'Please correct the invalid domains before saving');
      return;
    }
    
    // Submit only if we have at least one valid domain
    const validDomains = domains.filter(domain => domain.value && domain.isValid);
    if (validDomains.length === 0) {
      showToast('warning', 'Please add at least one valid domain');
      return;
    }
    
    // Save domains
    setIsLoading(true);
    try {
      // lets save it to the database
      console.log({ validDomains });
    await saveDomainsToDatabase(validDomains); // Replace with actual save function
      showToast('success', 'Domains saved successfully');
    } catch (error) {
      showToast('error', 'Error saving domains');
    } finally {
      setIsLoading(false);
    }
  };

 

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mx-auto my-8">
      {/* Toast notification */}
      {toastMessage.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-sm z-50 ${
          toastMessage.type === 'error' ? 'bg-red-100 text-red-700' :
          toastMessage.type === 'success' ? 'bg-green-100 text-green-700' :
          toastMessage.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>{toastMessage.text}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Allowed Domains</h3>
        <button 
          onClick={addDomain}
          disabled={domains.length >= domainLimit}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            domains.length >= domainLimit 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90'
          }`}
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Domain
        </button>  
      </div>
      
      <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm flex items-center justify-between text-blue-700">
        <div className="flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span>
            Your <span className="px-2 py-0.5 rounded bg-pink-100 text-pink-800 mx-1">{userPlan}</span> 
            plan allows {domainLimit} domain{domainLimit !== 1 ? 's' : ''}. 
            You're using {domains.length} of {domainLimit}.
          </span>
        </div>
        <button 
          onClick={
            () => {
                navigate('/#pricing')
            }
          }
          className="px-2 py-1 text-xs border border-blue-300 rounded hover:bg-blue-100"
        >
          Change Plan (Demo)
        </button>
      </div>
      
      {domains.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <p>No domains added yet. Click "Add Domain" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.map((domain, index) => (
            <div key={domain.id}>
              <div className="flex items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Domain {index + 1}</label>
                {domain.value && domain.isValid && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">Valid</span>
                )}
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={domain.value}
                  onChange={(e) => updateDomain(domain.id, e.target.value)}
                  placeholder="https://example.com"
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                    domain.value && !domain.isValid
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-rose-500 focus:ring-rose-200'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                  {domain.value && domain.isValid && (
                    <a
                      href={domain.value.startsWith('http') ? domain.value : `https://${domain.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                      title="Visit domain"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                  <button
                    onClick={() => removeDomain(domain.id)}
                    className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                    title="Remove domain"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {domain.value && !domain.isValid && (
                <p className="mt-1 text-sm text-red-600">
                  Please enter a valid domain (e.g., example.com or https://example.com)
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      
      {domains.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Saving...' : 'Save Domains'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DynamicDomainsForm;