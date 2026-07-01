import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layout,
  Copy,
  Check,
  LogOut,
  Key,
  Activity,
  AlertTriangle,
  RefreshCw,
  RotateCcw,
  Settings,
  TrendingDown,
  Target,
  Zap,
  GitBranch,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { supabase, type Team, type Indicator, type Violation } from './supabase/config';
import { signOut, getUser, getTeamForUser, createTeamForUser } from './supabase/auth';
import { getInfraCostPerMonth } from './supabase/teamSettings';
import { computeInsights } from './insights/compute';
import { fetchEndpointStats, fetchSessionTraces } from './insights/fetchLive';
import type { EndpointInsight, Insights } from './insights/types';
import { mineJourneys } from './journeys/mine';
import type { Funnel, JourneyFlow, JourneysResult } from './journeys/types';
import type { User } from '@supabase/supabase-js';

const TIME_RANGE_MS = 24 * 60 * 60 * 1000;
/** Mirrors src/insights/compute.ts's own slow-endpoint threshold, for consistent labeling. */
const SLOW_P95_THRESHOLD_MS = 1000;

/** Ranks endpoints by measured waste contribution. Used for "#1 Priority Fix" and "Quick Wins"
 * until M4 wires in Claude-generated recommendations — this is real computed data, not a placeholder. */
function wasteScore(e: EndpointInsight): number {
  return e.errorRate * e.callCount + e.duplicateCount + (e.p95 > SLOW_P95_THRESHOLD_MS ? e.callCount : 0);
}

function formatCurrency(num: number): string {
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(0) + 'K';
  return '$' + num.toFixed(2);
}

interface RecommendationItem {
  title: string;
  endpoint: string;
  problem: string;
  fix: string;
  severity: 'high' | 'medium' | 'low';
  estimatedMonthlySavingsUsd: number;
}

interface RecommendationsResponse {
  available: boolean;
  priorityFix?: { title: string; rationale: string };
  recommendations?: RecommendationItem[];
}

const SEVERITY_COLOR: Record<RecommendationItem['severity'], string> = {
  high: 'bg-red-900 text-red-300',
  medium: 'bg-yellow-900 text-yellow-300',
  low: 'bg-gray-800 text-gray-300',
};

const SectionHelp: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative ml-auto">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-gray-500 hover:text-gray-300 transition-colors"
        aria-label="How to read this section"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-10 w-80 bg-gray-800 border border-gray-700 rounded-lg p-4 text-xs text-gray-300 shadow-xl space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};

const KpiCard: React.FC<{ label: string; value: string; sublabel: string }> = ({ label, value, sublabel }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
    <p className="text-3xl font-bold text-white mb-1">{value}</p>
    <p className="text-sm text-gray-500">{sublabel}</p>
  </div>
);

const KpiRow: React.FC<{ insights: Insights }> = ({ insights }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <KpiCard
      label="Monthly Savings"
      value={formatCurrency(insights.money.monthlySavings)}
      sublabel={insights.money.monthlySavings > 0 ? 'from measured waste' : 'set infra cost in Settings'}
    />
    <KpiCard label="Calls / Day" value={insights.kpis.totalCallsPerDay.toLocaleString()} sublabel="last 24h" />
    <KpiCard
      label="Health Score"
      value={insights.kpis.healthScore.toFixed(0)}
      sublabel={insights.kpis.healthScore >= 80 ? 'healthy' : insights.kpis.healthScore >= 50 ? 'needs attention' : 'critical'}
    />
    <KpiCard
      label="Waste Ratio"
      value={`${(insights.kpis.wasteRatio * 100).toFixed(0)}%`}
      sublabel="of total call volume"
    />
  </div>
);

const PriorityFixCard: React.FC<{
  endpoint: EndpointInsight | null;
  aiPriorityFix?: { title: string; rationale: string };
}> = ({ endpoint, aiPriorityFix }) => {
  if (aiPriorityFix) {
    return (
      <div className="bg-gradient-to-br from-indi-purple-950 to-gray-900 border border-indi-purple-800 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-indi-purple-400" />
          <h3 className="text-lg font-bold text-white">#1 Priority Fix</h3>
          <span className="text-xs text-gray-500 ml-auto">AI-identified</span>
        </div>
        <p className="text-sm font-semibold text-indi-purple-300 mb-2">{aiPriorityFix.title}</p>
        <p className="text-sm text-gray-300">{aiPriorityFix.rationale}</p>
      </div>
    );
  }

  if (!endpoint) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-indi-purple-400" />
          <h3 className="text-lg font-bold text-white">#1 Priority Fix</h3>
        </div>
        <p className="text-sm text-gray-500">No traffic in the last 24h yet — nothing to prioritize.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indi-purple-950 to-gray-900 border border-indi-purple-800 rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-5 h-5 text-indi-purple-400" />
        <h3 className="text-lg font-bold text-white">#1 Priority Fix</h3>
        <span className="text-xs text-gray-500 ml-auto">computed from measured data</span>
      </div>
      <code className="text-sm font-mono text-indi-purple-300 block mb-2">
        {endpoint.method} {endpoint.endpoint}
      </code>
      <p className="text-sm text-gray-300">
        {endpoint.callCount.toLocaleString()} calls, {(endpoint.errorRate * 100).toFixed(1)}% error rate,{' '}
        {endpoint.duplicateCount} duplicate calls, p95 {endpoint.p95}ms.
      </p>
    </div>
  );
};

const QuickWinsSection: React.FC<{ endpoints: EndpointInsight[] }> = ({ endpoints }) => {
  const topThree = [...endpoints].sort((a, b) => wasteScore(b) - wasteScore(a)).slice(0, 3);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-indi-purple-400" />
        <h3 className="text-lg font-bold text-white">Quick Wins</h3>
      </div>
      {topThree.length === 0 ? (
        <p className="text-sm text-gray-500">No endpoints with waste detected yet.</p>
      ) : (
        <div className="space-y-3">
          {topThree.map((e) => (
            <div key={`${e.method} ${e.endpoint}`} className="bg-gray-950 rounded-lg p-4">
              <code className="text-sm font-mono text-gray-200">
                {e.method} {e.endpoint}
              </code>
              <p className="text-xs text-gray-500 mt-1">
                {e.duplicateCount} duplicates &middot; {(e.errorRate * 100).toFixed(1)}% errors &middot; p95 {e.p95}ms
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AIRecommendationsSection: React.FC<{ recommendations: RecommendationItem[] }> = ({ recommendations }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
    <div className="flex items-center gap-2 mb-6">
      <Sparkles className="w-5 h-5 text-indi-purple-400" />
      <h3 className="text-lg font-bold text-white">AI Recommendations</h3>
      <SectionHelp>
        <p>
          <strong className="text-gray-100">Duplicate calls</strong> — the exact same request happening
          again within 1 second (a double-click, a re-render, or a race condition), not a caching check.
        </p>
        <p>
          <strong className="text-gray-100">avgCallsPerSession</strong> — how many times a single user
          calls that endpoint during one visit, on average. Above 1 means the same request is repeated
          within a session, even if each call is a second or more apart.
        </p>
        <p>
          <strong className="text-gray-100">Dollar estimates</strong> are always your Monthly Infra Cost
          (set in Settings) x that item's share of measured waste — never a guess.
        </p>
      </SectionHelp>
    </div>
    <div className="space-y-3">
      {recommendations.map((r, i) => (
        <div key={i} className="bg-gray-950 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-100">{r.title}</p>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${SEVERITY_COLOR[r.severity]}`}>
              {r.severity}
            </span>
          </div>
          <code className="text-xs font-mono text-gray-500 block mb-2">{r.endpoint}</code>
          <p className="text-xs text-gray-400 mb-1">{r.problem}</p>
          <p className="text-xs text-gray-300">{r.fix}</p>
          {r.estimatedMonthlySavingsUsd > 0 && (
            <p className="text-xs text-indi-purple-300 mt-2">{formatCurrency(r.estimatedMonthlySavingsUsd)}/mo estimated</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

const MoneyLeakingSection: React.FC<{ endpoints: EndpointInsight[] }> = ({ endpoints }) => {
  const sorted = [...endpoints].sort((a, b) => wasteScore(b) - wasteScore(a));

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingDown className="w-5 h-5 text-red-400" />
        <h3 className="text-lg font-bold text-white">Where Money Is Leaking</h3>
      </div>
      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500">No endpoint data in the last 24h.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sorted.map((e) => (
            <div key={`${e.method} ${e.endpoint}`} className="p-3 bg-gray-950 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <code className="text-sm font-mono text-gray-200">
                  {e.method} {e.endpoint}
                </code>
                <span className="text-xs text-gray-500">{e.callCount.toLocaleString()} calls</span>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>{e.duplicateCount} duplicates</span>
                <span>{(e.errorRate * 100).toFixed(1)}% errors</span>
                <span>p95 {e.p95}ms</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SlowEndpointsSection: React.FC<{ endpoints: EndpointInsight[] }> = ({ endpoints }) => {
  const slow = [...endpoints].filter((e) => e.p95 > SLOW_P95_THRESHOLD_MS).sort((a, b) => b.p95 - a.p95);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-bold text-white">Slow Endpoints</h3>
      </div>
      {slow.length === 0 ? (
        <p className="text-sm text-gray-500">No endpoint is above the {SLOW_P95_THRESHOLD_MS}ms p95 threshold.</p>
      ) : (
        <div className="space-y-3">
          {slow.map((e) => (
            <div key={`${e.method} ${e.endpoint}`} className="flex items-center justify-between p-3 bg-gray-950 rounded-lg">
              <code className="text-sm font-mono text-gray-200">
                {e.method} {e.endpoint}
              </code>
              <span className="text-sm font-bold text-yellow-400">p95 {e.p95}ms</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FunnelBar: React.FC<{ funnel: Funnel }> = ({ funnel }) => (
  <div className="space-y-2 mt-3">
    {funnel.steps.map((step) => (
      <div key={step.step}>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <code>{step.step}</code>
          <span>
            {step.sessionsReached} ({(step.retention * 100).toFixed(0)}%)
            {funnel.dropOffAt === step.step && <span className="text-red-400 ml-2">drop-off</span>}
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${funnel.dropOffAt === step.step ? 'bg-red-500' : 'bg-indi-purple-500'}`}
            style={{ width: `${Math.max(step.retention * 100, 2)}%` }}
          />
        </div>
      </div>
    ))}
  </div>
);

const JourneyCard: React.FC<{ journey: JourneyFlow }> = ({ journey }) => (
  <div className="bg-gray-950 rounded-lg p-4">
    <div className="flex items-center justify-between mb-1">
      <code className="text-sm font-mono text-gray-200">{journey.flow.steps.join(' -> ') || journey.flow.name}</code>
      {journey.flow.name && (
        <span className="text-xs bg-indi-purple-900 text-indi-purple-300 px-2 py-0.5 rounded">{journey.flow.name}</span>
      )}
    </div>
    <p className="text-xs text-gray-500 mb-2">
      {journey.flow.sessionCount} sessions ({(journey.flow.frequency * 100).toFixed(0)}%) &middot;{' '}
      {(journey.conversion.conversionRate * 100).toFixed(0)}% converted &middot; avg {journey.costAndPerf.avgDurationMs.toFixed(0)}ms
      &middot; {journey.costAndPerf.violationCount} violations
      {journey.costAndPerf.estimatedMonthlyCost > 0 && (
        <> &middot; {formatCurrency(journey.costAndPerf.estimatedMonthlyCost)}/mo</>
      )}
    </p>
    <FunnelBar funnel={journey.funnel} />
    {journey.repeatedSteps.length > 0 && (
      <div className="mt-3 space-y-1">
        {journey.repeatedSteps.map((r) => (
          <p key={r.step} className="text-xs text-yellow-400">
            <code>{r.step}</code> called {r.avgCallsPerSession.toFixed(1)}x per session &mdash; likely redundant within this journey
          </p>
        ))}
      </div>
    )}
  </div>
);

const JourneysSection: React.FC<{ journeys: JourneysResult }> = ({ journeys }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
    <div className="flex items-center gap-2 mb-6">
      <GitBranch className="w-5 h-5 text-teal-400" />
      <h3 className="text-lg font-bold text-white">Journeys</h3>
      <SectionHelp>
        <p>
          Each flow is a sequence of API calls made during real user sessions, most frequent first.
          The bar under each step shows what % of sessions reached it, relative to the first step.
        </p>
        <p>
          <strong className="text-gray-100">Drop-off</strong> (red) marks the step where the biggest
          share of sessions stopped continuing the flow.
        </p>
        <p>
          A <strong className="text-gray-100">yellow line</strong> means that endpoint is called more
          than once per session on average within that flow — likely a redundant re-fetch, not a
          single, necessary call.
        </p>
      </SectionHelp>
    </div>
    {journeys.flows.length === 0 ? (
      <p className="text-sm text-gray-500">Not enough session data in the last 24h to mine journeys yet.</p>
    ) : (
      <div className="space-y-4">
        {journeys.flows.map((journey, i) => (
          <JourneyCard key={i} journey={journey} />
        ))}
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [journeys, setJourneys] = useState<JourneysResult | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Load user, team, indicators/violations, and computed insights/journeys.
  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);

        let userTeam = await getTeamForUser(currentUser.id);
        if (!userTeam) {
          userTeam = await createTeamForUser(currentUser);
        }
        setTeam(userTeam);

        if (userTeam) {
          const { data: indicatorsData } = await supabase
            .from('indicators')
            .select('*')
            .eq('team_id', userTeam.id)
            .order('created_at', { ascending: false });

          setIndicators(indicatorsData || []);

          const { data: violationsData } = await supabase
            .from('violations')
            .select('*')
            .eq('team_id', userTeam.id)
            .order('created_at', { ascending: false })
            .limit(50);

          setViolations(violationsData || []);

          const sinceMs = Date.now() - TIME_RANGE_MS;
          const [endpointStats, sessionTraces, infraCostPerMonth] = await Promise.all([
            fetchEndpointStats(userTeam.id, sinceMs),
            fetchSessionTraces(userTeam.id, sinceMs),
            getInfraCostPerMonth(userTeam.id),
          ]);

          const computedInsights = computeInsights(endpointStats, violationsData || [], infraCostPerMonth);
          const computedJourneys = mineJourneys(sessionTraces, violationsData || [], infraCostPerMonth);
          setInsights(computedInsights);
          setJourneys(computedJourneys);

          // AI recommendations are best-effort — the dashboard above already works without them.
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData.session?.access_token;
            if (accessToken) {
              const res = await fetch('/api/recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({ teamId: userTeam.id, insights: computedInsights, journeys: computedJourneys }),
              });
              const data: RecommendationsResponse = await res.json();
              if (data.available) setRecommendations(data);
            }
          } catch (error) {
            console.error('Error loading AI recommendations:', error);
          }
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

  const [relearningIds, setRelearningIds] = useState<Set<string>>(new Set());

  const handleRelearn = async (indicatorId: string) => {
    setRelearningIds((prev) => new Set(prev).add(indicatorId));

    const { error } = await supabase
      .from('indicators')
      .update({ relearn_requested: true })
      .eq('id', indicatorId)
      .select()
      .single();

    if (error) {
      console.error('Failed to request re-learn:', error);
    }

    setTimeout(() => {
      setRelearningIds((prev) => {
        const next = new Set(prev);
        next.delete(indicatorId);
        return next;
      });
    }, 2000);
  };

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
        return 'bg-indi-purple-900 text-indi-purple-300';
      case 'missing_field':
        return 'bg-red-900 text-red-300';
      case 'type_mismatch':
        return 'bg-orange-900 text-orange-300';
      case 'unexpected_status':
        return 'bg-red-900 text-red-300';
      case 'slow_response':
        return 'bg-yellow-900 text-yellow-300';
      default:
        return 'bg-gray-800 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-lg">
          <div className="w-8 h-8 border-4 border-indi-purple-500 border-t-transparent rounded-full animate-spin"></div>
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
              <span className="ml-2 text-lg font-semibold text-white">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/settings" className="p-2 text-gray-400 hover:text-white transition-colors" title="Settings">
                <Settings className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-indi-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-gray-400 hidden sm:block">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-white transition-colors"
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
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">{team?.name || 'My Team'}</h2>
              <p className="text-gray-500 text-sm mt-1">
                Created {team?.created_at ? formatDate(team.created_at) : 'recently'}
              </p>
            </div>
          </div>

          <div className="bg-gray-950 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Key className="w-5 h-5 text-indi-purple-400" />
                <div>
                  <p className="text-sm text-gray-500">API Key</p>
                  <code className="text-sm font-mono text-gray-200">{team?.api_key || 'No API key'}</code>
                </div>
              </div>
              <button
                onClick={handleCopyApiKey}
                className="flex items-center space-x-2 px-4 py-2 bg-indi-purple-600 text-white rounded-lg hover:bg-indi-purple-700 transition-opacity"
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
            Use this API key in your <code className="bg-gray-800 px-1 rounded">indi.init()</code> call to send data to this dashboard.
          </p>
        </div>

        {insights && <KpiRow insights={insights} />}
        {insights && (
          <PriorityFixCard
            endpoint={
              insights.endpoints.length > 0
                ? [...insights.endpoints].sort((a, b) => wasteScore(b) - wasteScore(a))[0]
                : null
            }
            aiPriorityFix={recommendations?.priorityFix}
          />
        )}

        {insights && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <MoneyLeakingSection endpoints={insights.endpoints} />
            <QuickWinsSection endpoints={insights.endpoints} />
          </div>
        )}

        {recommendations?.recommendations && recommendations.recommendations.length > 0 && (
          <div className="mb-8">
            <AIRecommendationsSection recommendations={recommendations.recommendations} />
          </div>
        )}

        {insights && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SlowEndpointsSection endpoints={insights.endpoints} />
            {journeys && <JourneysSection journeys={journeys} />}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monitored Endpoints */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-indi-purple-400" />
                <h3 className="text-xl font-bold text-white">Monitored Endpoints</h3>
              </div>
              <span className="text-sm text-gray-500">{indicators.length} endpoints</span>
            </div>

            {indicators.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No endpoints monitored yet</p>
                <p className="text-sm mt-1">
                  Use <code className="bg-gray-800 px-1 rounded">indi.watch()</code> to start monitoring
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {indicators.map((indicator) => (
                  <div key={indicator.id} className="p-3 bg-gray-950 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <code className="text-sm font-mono text-gray-200">{indicator.endpoint}</code>
                      <span className="ml-2 px-2 py-0.5 bg-indi-purple-900 text-indi-purple-300 text-xs rounded">
                        {indicator.method}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRelearn(indicator.id)}
                        disabled={relearningIds.has(indicator.id)}
                        className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
                          relearningIds.has(indicator.id)
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-indi-purple-950 text-indi-purple-300 hover:bg-indi-purple-900'
                        }`}
                        title={relearningIds.has(indicator.id) ? 'Re-learning in progress' : 'Re-learn schema'}
                      >
                        <RotateCcw className={`w-3 h-3 ${relearningIds.has(indicator.id) ? 'animate-spin' : ''}`} />
                        <span>{relearningIds.has(indicator.id) ? 'Re-learning...' : 'Re-learn'}</span>
                      </button>
                      <span className="text-xs text-gray-500">{formatDate(indicator.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Violations */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-indi-purple-400" />
                <h3 className="text-xl font-bold text-white">Contract Violations</h3>
              </div>
              <button
                onClick={refreshViolations}
                className="p-2 text-gray-400 hover:text-white transition-colors"
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
                  <div key={violation.id} className="p-3 bg-gray-950 rounded-lg border-l-4 border-indi-purple-500">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-0.5 text-xs rounded font-medium ${getViolationTypeColor(violation.type)}`}
                      >
                        {violation.type}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(violation.created_at)}</span>
                    </div>
                    <code className="text-sm font-mono text-gray-300 block mb-1">
                      {violation.method} {violation.endpoint}
                    </code>
                    <p className="text-sm text-gray-400">{violation.message}</p>
                    {violation.path && (
                      <p className="text-xs text-gray-500 mt-1">
                        Path: <code className="bg-gray-800 px-1 rounded">{violation.path}</code>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Quick Start</h3>
          <div className="bg-black rounded-lg p-4 overflow-x-auto">
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
