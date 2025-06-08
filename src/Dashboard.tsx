import { useState, useEffect } from 'react';
import { Settings, AlertCircle, Layout, BellDot } from 'lucide-react';
import UserProfile from './UserProfile';
import { getJiraConfig, getUserProfile, saveJiraConfig } from './services/userService';
import DynamicDomainsForm from './AddDomain';


const Dashboard = () => {
  const [jiraConfig, setJiraConfig] = useState({
    domain: '',
    apiToken: '',
    email: '',
    isConnected: false,
    projectKey: ''
  });
  const [userData, setUserData] = useState();
  const [subscriptionData, setSubscriptionData] = useState({
    plan: '',
    activeUntil: '2025-02-01',
    status: 'Active',
    jiraDomain: '',
    jiraEmail: '',
    jiraApiToken: '',
    slackWebhookUrl: ''
  });
  console.log({ userData });


  const [slackConfig, setSlackConfig] = useState({
    webhookUrl: '',
    isConnected: false
  });
  
  
  const [jiraSaveMessage, setJiraMessage] = useState({ type: '', text: '' });
  // const [slackSaveMessage, setSlackMessage] = useState({ type: '', text: '' });

  

  // Mock subscription data - יוחלף בהמשך במידע מפיירבייס


  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = await getUserProfile();
        setUserData(userData as any);
        setSubscriptionData((ps) => ({...ps, plan: userData.plan}));
      } catch (error) {
        alert({ type: 'error', text: 'Failed to load profile' });
      }
    };
    
    loadProfile();
  }, []);

  useEffect(() => {
    const loadJiraConfig = async () => {
      try {
        // Load Jira configuration from the database or local storage
        const jiraConfigData = await getJiraConfig(); // Replace with actual data fetching logic
        setJiraConfig(jiraConfigData as any);
      } catch (error) {
        console.error('Error loading Jira configuration:', error);
      }
    };

    loadJiraConfig();
  }, []);
  

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Layout className="w-6 h-6 text-rose-500" />
              <span className="ml-2 text-lg font-semibold text-gray-900">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <BellDot className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white">
                U
              </div>
            </div>
          </div>
        </div>
      </nav>

            <UserProfile />
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Subscription Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              {subscriptionData.plan} Plan
            </h2>
            <button disabled={true} className="cursor-not-allowed opacity-9 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:opacity-90 transition-opacity">
              Upgrade
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-500 mb-1">Active Until</p>
              <p className="text-lg font-semibold">{subscriptionData.activeUntil}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-500 mb-1">Status</p>
              <p className="text-lg font-semibold text-green-500">{subscriptionData.status}</p>
            </div>
          </div>
        </div>

        {/* Integrations Header */}
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
          Integrations
        </h2>

        {/* Jira Integration */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Settings className="w-6 h-6 text-rose-500 mr-2" />
              <h3 className="text-xl font-bold">Jira Integration</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              jiraConfig.isConnected 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {jiraConfig.isConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>

          {jiraSaveMessage.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm flex items-center ${
          jiraSaveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
          <AlertCircle className="w-4 h-4 mr-2" />
          {jiraSaveMessage.text}
          </div>
        )}

          <form className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Jira Domain</label>
              <input
                type="text"
                placeholder="your-domain.atlassian.net"
                value={jiraConfig.domain}
                onChange={(e) => setJiraConfig({...jiraConfig, domain: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Project Key</label>
              <input
                type="text"
                placeholder="Your Jira Project Key"
                value={jiraConfig.projectKey}
                onChange={(e) => setJiraConfig({...jiraConfig, projectKey: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">API Token</label>
              <input
                type="password"
                placeholder="Your Jira API Token"
                value={jiraConfig.apiToken}
                onChange={(e) => setJiraConfig({...jiraConfig, apiToken: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="Email associated with your Jira account"
                value={jiraConfig.email}
                onChange={(e) => setJiraConfig({...jiraConfig, email: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
              />
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <AlertCircle className="w-4 h-4" />
              <span>Your credentials are encrypted and stored securely</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                // Handle Jira configuration save logic here
                setJiraConfig({...jiraConfig, isConnected: true});
                saveJiraConfig(jiraConfig).then(() => {
                  setJiraMessage({ type: 'success', text: 'Jira configuration updated successfully!' });
                }).catch((error) => {
                  console.error('Error saving Jira configuration:', error);
                  setJiraMessage({ type: 'error', text: 'Failed to save Jira configuration' });
                })
              }}
            >
              Save Configuration
            </button>
          </form>
        </div>

        {/* Slack Integration */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Settings className="w-6 h-6 text-rose-500 mr-2" />
              <h3 className="text-xl font-bold">Slack Integration</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              slackConfig.isConnected 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {slackConfig.isConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Webhook URL</label>
              <input
                type="text"
                placeholder="https://hooks.slack.com/services/..."
                value={slackConfig.webhookUrl}
                onChange={(e) => setSlackConfig({...slackConfig, webhookUrl: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
              />
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <AlertCircle className="w-4 h-4" />
              <span>Find your webhook URL in Slack App settings</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Save Configuration
            </button>
          </form>
        </div>


        {/* Allowed Domains */}
        <DynamicDomainsForm />
            {/* <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Allowed Domains</h3>
            <button

              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:opacity-90 transition-opacity">
              Add Domain
            </button>  
            </div>
          </div> */}


      </div>
      
    </div>
  );
};

export default Dashboard;