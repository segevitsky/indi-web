import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layout,
  ArrowLeft,
  Mail,
  Clock,
  Bell,
  BellOff,
  Save,
  CheckCircle,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import { getUser, getTeamForUser } from './supabase/auth';
import {
  getNotificationSettings,
  upsertNotificationSettings,
  getNotificationLog,
  type NotificationLogEntry,
} from './supabase/notifications';
import { getInfraCostPerMonth, upsertInfraCostPerMonth } from './supabase/teamSettings';
import type { Team } from './supabase/config';

const Settings = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState('1hr');
  const [enabled, setEnabled] = useState(true);
  const [lastNotifiedAt, setLastNotifiedAt] = useState<string | null>(null);
  const [log, setLog] = useState<NotificationLogEntry[]>([]);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [infraCost, setInfraCost] = useState('');
  const [savingInfraCost, setSavingInfraCost] = useState(false);
  const [infraCostFeedback, setInfraCostFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Step 1: Load user & team (controls the main spinner)
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const currentUser = await getUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }

        const userTeam = await getTeamForUser(currentUser.id);
        if (!userTeam) {
          navigate('/dashboard');
          return;
        }

        setTeam(userTeam);
        setEmail(currentUser.email || '');
      } catch (error) {
        console.error('Error loading auth:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
  }, [navigate]);

  // Step 2: Once team is loaded, fetch notification data + infra cost (non-blocking)
  useEffect(() => {
    if (!team) return;

    const loadNotificationData = async () => {
      try {
        const settings = await getNotificationSettings(team.id);
        if (settings) {
          setEmail(settings.email);
          setFrequency(settings.frequency);
          setEnabled(settings.enabled);
          setLastNotifiedAt(settings.last_notified_at);
        }
      } catch {
        // Table may not exist yet
      }

      try {
        const logData = await getNotificationLog(team.id);
        setLog(logData);
      } catch {
        // Table may not exist yet
      }
    };

    const loadInfraCost = async () => {
      try {
        const cost = await getInfraCostPerMonth(team.id);
        if (cost != null) setInfraCost(String(cost));
      } catch {
        // Column may not exist yet (migration not applied)
      }
    };

    loadNotificationData();
    loadInfraCost();
  }, [team]);

  const handleSave = async () => {
    if (!team) return;
    if (!email.trim()) {
      setFeedback({ type: 'error', message: 'Email is required.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const result = await upsertNotificationSettings(team.id, email.trim(), frequency, enabled);

    if (result) {
      setFeedback({ type: 'success', message: 'Notification settings saved successfully.' });
    } else {
      setFeedback({ type: 'error', message: 'Failed to save settings. Please try again.' });
    }

    setSaving(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSaveInfraCost = async () => {
    if (!team) return;
    const amount = parseFloat(infraCost);
    if (isNaN(amount) || amount < 0) {
      setInfraCostFeedback({ type: 'error', message: 'Enter a valid monthly cost.' });
      return;
    }

    setSavingInfraCost(true);
    setInfraCostFeedback(null);

    const success = await upsertInfraCostPerMonth(team.id, amount);

    setInfraCostFeedback(
      success
        ? { type: 'success', message: 'Infra cost saved. Dashboard savings will use this figure.' }
        : { type: 'error', message: 'Failed to save. The database may not be migrated yet.' }
    );

    setSavingInfraCost(false);
    setTimeout(() => setInfraCostFeedback(null), 4000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-lg text-center">
          <div className="w-8 h-8 border-4 border-indi-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-400 mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Layout className="w-6 h-6 text-indi-purple-400" />
              <span className="ml-2 text-lg font-semibold text-white">Settings</span>
            </div>
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Infra Cost Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-indi-purple-400" />
            <h2 className="text-xl font-bold text-white">Monthly Infra Cost</h2>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            What you pay your cloud provider per month. The dashboard derives every savings figure
            from this number x measured waste — never a hardcoded estimate.
          </p>

          {infraCostFeedback && (
            <div
              className={`flex items-center space-x-2 p-3 rounded-lg mb-6 ${
                infraCostFeedback.type === 'success' ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'
              }`}
            >
              {infraCostFeedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{infraCostFeedback.message}</span>
            </div>
          )}

          <div className="flex gap-3">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
              <input
                type="number"
                min="0"
                step="1"
                value={infraCost}
                onChange={(e) => setInfraCost(e.target.value)}
                placeholder="e.g. 2000"
                className="w-full pl-9 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-indi-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <button
              onClick={handleSaveInfraCost}
              disabled={savingInfraCost}
              className="flex items-center space-x-2 px-4 py-2 bg-indi-purple-600 text-white rounded-lg hover:bg-indi-purple-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingInfraCost ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Notification Settings Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Bell className="w-5 h-5 text-indi-purple-400" />
            <h2 className="text-xl font-bold text-white">Notification Settings</h2>
          </div>

          {/* Feedback message */}
          {feedback && (
            <div
              className={`flex items-center space-x-2 p-3 rounded-lg mb-6 ${
                feedback.type === 'success' ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{feedback.message}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Email input */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>Notification Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-indi-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Frequency dropdown */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>Notification Frequency</span>
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-indi-purple-500 focus:border-transparent outline-none transition-all"
              >
                <option value="30min">Every 30 minutes</option>
                <option value="1hr">Every hour</option>
                <option value="daily">Daily digest</option>
              </select>
            </div>

            {/* Enable/disable toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {enabled ? (
                  <Bell className="w-4 h-4 text-indi-purple-400" />
                ) : (
                  <BellOff className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-sm font-medium text-gray-300">
                  {enabled ? 'Notifications enabled' : 'Notifications disabled'}
                </span>
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enabled ? 'bg-indi-purple-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Last notification sent */}
            {lastNotifiedAt && (
              <div className="flex items-center space-x-2 text-sm text-gray-400 bg-gray-950 p-3 rounded-lg">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>Last notification sent: {formatDate(lastNotifiedAt)}</span>
              </div>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-indi-purple-600 text-white rounded-lg hover:bg-indi-purple-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

        {/* Notification History Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Mail className="w-5 h-5 text-indi-purple-400" />
            <h2 className="text-xl font-bold text-white">Notification History</h2>
          </div>

          {log.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No notifications sent yet</p>
              <p className="text-sm mt-1">
                Notifications will appear here once violations are detected and emails are sent.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {log.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-gray-950 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-300">
                      {entry.violations_count} violation{entry.violations_count !== 1 ? 's' : ''} reported
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(entry.sent_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
