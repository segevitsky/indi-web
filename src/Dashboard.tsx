import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  BellDot,
  Copy,
  Check,
  LogOut,
  Key,
  Activity,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { supabase, type Team, type Indicator, type Violation } from './supabase/config';
import { signOut, getUser, getTeamForUser, createTeamForUser } from './supabase/auth';
import type { User } from '@supabase/supabase-js';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Load user and team data
  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);

        // Get or create team
        let userTeam = await getTeamForUser(currentUser.id);
        if (!userTeam) {
          userTeam = await createTeamForUser(currentUser);
        }
        setTeam(userTeam);

        // Load indicators for team
        if (userTeam) {
          const { data: indicatorsData } = await supabase
            .from('indicators')
            .select('*')
            .eq('team_id', userTeam.id)
            .order('created_at', { ascending: false });

          setIndicators(indicatorsData || []);

          // Load violations for team
          const { data: violationsData } = await supabase
            .from('violations')
            .select('*')
            .eq('team_id', userTeam.id)
            .order('created_at', { ascending: false })
            .limit(50);

          setViolations(violationsData || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Subscribe to real-time violations
  useEffect(() => {
    if (!team) return;

    const channel = supabase
      .channel('violations-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'violations',
          filter: `team_id=eq.${team.id}`,
        },
        (payload) => {
          setViolations((prev) => [payload.new as Violation, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [team]);

  const handleCopyApiKey = () => {
    if (team?.api_key) {
      navigator.clipboard.writeText(team.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const refreshViolations = async () => {
    if (!team) return;
    const { data } = await supabase
      .from('violations')
      .select('*')
      .eq('team_id', team.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setViolations(data || []);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getViolationTypeColor = (type: string) => {
    switch (type) {
      case 'schema_drift':
        return 'bg-purple-100 text-purple-700';
      case 'missing_field':
        return 'bg-red-100 text-red-700';
      case 'type_mismatch':
        return 'bg-orange-100 text-orange-700';
      case 'unexpected_status':
        return 'bg-red-100 text-red-700';
      case 'slow_response':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-gray-600 hidden sm:block">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Team Info & API Key Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                {team?.name || 'My Team'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Created {team?.created_at ? formatDate(team.created_at) : 'recently'}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Key className="w-5 h-5 text-rose-500" />
                <div>
                  <p className="text-sm text-gray-500">API Key</p>
                  <code className="text-sm font-mono text-gray-800">
                    {team?.api_key || 'No API key'}
                  </code>
                </div>
              </div>
              <button
                onClick={handleCopyApiKey}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Use this API key in your <code className="bg-gray-100 px-1 rounded">indi.init()</code> call to send violations to this dashboard.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monitored Endpoints */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-rose-500" />
                <h3 className="text-xl font-bold">Monitored Endpoints</h3>
              </div>
              <span className="text-sm text-gray-500">{indicators.length} endpoints</span>
            </div>

            {indicators.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No endpoints monitored yet</p>
                <p className="text-sm mt-1">
                  Use <code className="bg-gray-100 px-1 rounded">indi.watch()</code> to start monitoring
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {indicators.map((indicator) => (
                  <div
                    key={indicator.id}
                    className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <code className="text-sm font-mono text-gray-800">
                        {indicator.endpoint}
                      </code>
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        {indicator.method}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDate(indicator.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Violations */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="text-xl font-bold">Recent Violations</h3>
              </div>
              <button
                onClick={refreshViolations}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {violations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No violations detected</p>
                <p className="text-sm mt-1">Your APIs are running smoothly!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {violations.map((violation) => (
                  <div
                    key={violation.id}
                    className="p-3 bg-gray-50 rounded-lg border-l-4 border-rose-400"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-0.5 text-xs rounded font-medium ${getViolationTypeColor(
                          violation.type
                        )}`}
                      >
                        {violation.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(violation.created_at)}
                      </span>
                    </div>
                    <code className="text-sm font-mono text-gray-700 block mb-1">
                      {violation.method} {violation.endpoint}
                    </code>
                    <p className="text-sm text-gray-600">{violation.message}</p>
                    {violation.path && (
                      <p className="text-xs text-gray-400 mt-1">
                        Path: <code className="bg-gray-100 px-1 rounded">{violation.path}</code>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Quick Start</h3>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-100">
              <code>{`import { indi } from '@indi/runtime';

indi.init({
  apiKey: '${team?.api_key || 'your-api-key'}',
  teamId: '${team?.id || 'your-team-id'}',
});

indi.watch('/api/users', { learningPeriod: 20 });
indi.watch('/api/orders', { maxResponseTime: 500 });`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
