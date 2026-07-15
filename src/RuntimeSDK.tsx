'use client';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Eye, DollarSign, CheckCircle2 } from 'lucide-react';
import Blobi from './Blobi';

// A single, static, illustrative example — not a calculator, not user input. Modeled on what a
// real customer's numbers look like (matches the demo team's actual $10K/mo infra cost), used
// consistently across the Dashboard Preview and How It Works stats so nothing drifts. We stopped
// asking visitors to type in their own guess: nobody who hasn't installed Indi can know their real
// waste %, so a calculator that pretends otherwise contradicts the "we measure, not guess"
// positioning everywhere else on this page and in the real product.
const ILLUSTRATIVE_EXAMPLE = {
  monthlyInfraSpend: 10000,
  measuredWastePercent: 14,
  monthlySavings: 1400,
  annualSavings: 16800,
};

// Utility function to format currency
const formatCurrency = (num: number): string => {
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(0) + 'K';
  if (num < 1) return '$' + num.toFixed(2);
  return '$' + num.toFixed(0);
};

// Navigation Component
const Navigation: React.FC = () => (
  <nav className="flex justify-between items-center px-12 py-6 bg-white border-b border-gray-200">
    <div className="flex items-center gap-2">
      <Blobi emotion="happy" size={32} showBadge={false} />
      <span className="text-xl font-bold text-purple-600">INDI</span>
    </div>
    <div className="flex gap-10 text-sm">
      <a href="#demo" className="text-gray-600 hover:text-purple-600 transition">
        See it in action
      </a>
      <a href="#how" className="text-gray-600 hover:text-purple-600 transition">
        How it works
      </a>
      <a href="#contact" className="text-gray-600 hover:text-purple-600 transition">
        Contact
      </a>
    </div>
  </nav>
);

// Hero Section
const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-white py-16 px-12">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-4">
          Your App&apos;s Personal Analyst
        </div>
        <div className="text-sm font-medium text-gray-600 mb-4">Stop wasting money on broken APIs</div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">See exactly what's costing you</h1>
        <p className="text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
          Duplicate requests, slow endpoints, and redundant calls hiding in how your users actually move through your product — Indi watches real behavior, not just raw API logs, and shows you the exact cost of every inefficiency, with fixes grounded in how people really use your app.
        </p>
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => navigate('/register')}
            className="px-7 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Start Free
          </button>
          <button
            onClick={scrollToDemo}
            className="px-7 py-3 bg-white text-purple-600 border border-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
          >
            See Demo
          </button>
        </div>
      </div>
    </section>
  );
};

// Discover Section
// Framed as capability, not a claim about the reader's problems — each line is a preview of one
// of the three proof sections further down the page (cost, behavior, learning system), so nothing
// here is asserted without being demonstrated shortly after.
const DiscoverSection: React.FC = () => (
  <section className="bg-white py-12 px-6 border-b border-gray-100">
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          'Discover exactly where your money is going — and prove it, dollar for dollar.',
          "Discover how people actually move through your product, and which slow moments are costing you customers.",
          'Discover the moment something changes, before a customer has to tell you.',
        ].map((text, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-purple-600 font-bold text-xl flex-shrink-0">→</span>
            <p className="text-gray-700 text-base">{text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Dashboard Preview Section
// A single static, illustrative example (ILLUSTRATIVE_EXAMPLE) — modeled on real-shaped numbers,
// never a visitor's own guess. Every figure here is labeled as measured, not asked-for.
const DashboardSection: React.FC = () => (
  <section id="demo" className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 py-12 px-6">
    <div className="max-width mx-auto max-w-6xl">
      <p className="text-center text-sm text-gray-500 mb-6">
        A real-shaped example of what Indi finds — not your numbers, and not something you type in.
      </p>
      {/* Dashboard Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg mb-8">
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Your Cost Overview</h3>
          <p className="text-sm text-gray-600">{formatCurrency(ILLUSTRATIVE_EXAMPLE.monthlyInfraSpend)}/mo infra spend</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-l-4 border-purple-600">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Monthly Infra Spend</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(ILLUSTRATIVE_EXAMPLE.monthlyInfraSpend)}</p>
            <p className="text-xs text-gray-600">what they told us they pay</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-l-4 border-red-500">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Measured Waste</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{ILLUSTRATIVE_EXAMPLE.measuredWastePercent}%</p>
            <p className="text-xs text-gray-600">of real, observed processing time</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-l-4 border-teal-600">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Monthly Savings</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(ILLUSTRATIVE_EXAMPLE.monthlySavings)}</p>
            <p className="text-xs text-gray-600">that % of their reported spend</p>
          </div>
        </div>

        {/* Problems */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4">What's Draining Their Budget</p>
          <div className="space-y-3">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="font-bold text-gray-900">{ILLUSTRATIVE_EXAMPLE.measuredWastePercent}% Measured Waste</p>
              <p className="text-sm text-red-600 font-bold">{formatCurrency(ILLUSTRATIVE_EXAMPLE.monthlySavings)}/mo — duplicate calls, slow endpoints, and errors</p>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <p className="font-bold text-gray-900">Redundant Calls in User Journeys</p>
              <p className="text-sm text-yellow-700 font-bold">Found in how real users navigate your product — not just raw endpoint stats</p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="font-bold text-gray-900">Annual Infrastructure Waste</p>
              <p className="text-sm text-red-600 font-bold">{formatCurrency(ILLUSTRATIVE_EXAMPLE.annualSavings)}/year (fixable)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Deploy', desc: '2 lines of code', color: 'from-purple-600 to-purple-700' },
          { title: 'Watch', desc: 'Real traffic', color: 'from-teal-500 to-teal-600' },
          { title: 'Calculate', desc: 'See costs', color: 'from-red-400 to-red-500' },
          { title: 'Fix', desc: 'Ship code', color: 'from-cyan-500 to-cyan-600' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${item.color} shadow-lg`}></div>
            <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Journey Showcase Section
// Illustrates the behavior-based signal (not raw API logs) with a concrete, realistic example —
// modeled on how a real mined user journey looks, so the "we watch real behavior" claim is
// concrete rather than abstract.
const JOURNEY_EXAMPLE_STEPS: { step: string; screen: string; pct: number }[] = [
  { step: '/api/people/:id', screen: '/org-chart', pct: 100 },
  { step: '/api/org-chart', screen: '/org-chart', pct: 25 },
  { step: '/api/people/:id', screen: '/org-chart', pct: 25 },
  { step: '/api/people/:id', screen: '/org-chart', pct: 25 },
];

const JourneyShowcaseSection: React.FC = () => (
  <section className="bg-white py-20 px-6">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-center text-gray-900 mb-3">Not Just API Logs — Real User Behavior</h2>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Indi doesn't just watch individual calls — it maps how real users move through your product, session by session, to find waste hiding in the patterns, not just the raw numbers.
      </p>
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-8 shadow-sm">
        <code className="text-sm font-mono text-gray-700 block mb-6">
          /api/people/:id → /api/org-chart → /api/people/:id → /api/people/:id
        </code>
        <div className="space-y-3 mb-6">
          {JOURNEY_EXAMPLE_STEPS.map((s, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>
                  <code className="text-gray-800">{s.step}</code> · screen: {s.screen}
                </span>
                <span>{s.pct}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.max(s.pct, 4)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
          <p className="font-bold text-gray-900">/api/people/:id called 3.0x per session — likely redundant</p>
          <p className="text-sm text-gray-700 mt-1">
            Happening on the org-chart screen: managers clicking through several direct reports re-fetch the same
            profile data each time, instead of it being cached for the session — waste that's invisible if you only
            look at raw API counts.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-8 shadow-sm mt-6">
        <code className="text-sm font-mono text-gray-700 block mb-4">
          /api/people/:id → /api/time-off/balance/:id
        </code>
        <p className="text-sm text-gray-600 mb-4">
          This second call is chronically slow. Here&apos;s what happens to real visits when it is:
        </p>
        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
          <p className="font-bold text-gray-900">Slow responses correlate with people actually leaving</p>
          <p className="text-sm text-gray-700 mt-1">
            9 out of 10 visits continued when this call responded fast. Only 3 out of 10 continued when it was slow.
            Not proof it&apos;s the cause — but a real, checkable pattern grounded in your own traffic, not a
            generic industry benchmark.
          </p>
        </div>
      </div>
    </div>
  </section>
);

// Unusual Activity Showcase Section
// Gives the learning-system pillar the same visual proof treatment Journey Showcase gives
// behavior — a concrete example instead of a bare claim, so "learns what's normal for you" isn't
// just a line in a bullet list with nothing to point to.
const UNUSUAL_ACTIVITY_EXAMPLE: { day: string; calls: number; isToday?: boolean }[] = [
  { day: 'Mon', calls: 520 },
  { day: 'Tue', calls: 480 },
  { day: 'Wed', calls: 510 },
  { day: 'Thu', calls: 495 },
  { day: 'Fri', calls: 530 },
  { day: 'Sat', calls: 190 },
  { day: 'Sun', calls: 175 },
  { day: 'Today', calls: 1420, isToday: true },
];

const UnusualActivityShowcaseSection: React.FC = () => {
  const maxCalls = Math.max(...UNUSUAL_ACTIVITY_EXAMPLE.map((d) => d.calls));

  return (
    <section className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-3">Knows What's Normal For You</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Indi remembers every day, forever — so it knows what a normal day looks like for every part of your app,
          and notices the moment something isn't. Compared only to that endpoint's own history, never to anything
          else.
        </p>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
          <code className="text-sm font-mono text-gray-700 block mb-6">GET /api/checkout</code>
          <div className="flex items-end gap-2 h-40 mb-6">
            {UNUSUAL_ACTIVITY_EXAMPLE.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className={`w-full rounded-t ${d.isToday ? 'bg-red-500' : 'bg-purple-300'}`}
                  style={{ height: `${Math.max((d.calls / maxCalls) * 100, 3)}%` }}
                />
                <span className={`text-[10px] mt-1 ${d.isToday ? 'text-red-600 font-bold' : 'text-gray-500'}`}>{d.day}</span>
              </div>
            ))}
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <p className="font-bold text-gray-900">Traffic much higher than usual</p>
            <p className="text-sm text-gray-700 mt-1">
              This endpoint typically sees about 500 calls a day. Today: 1,420 — nearly 3x normal. Flagged
              automatically, the moment it happens, using data Indi already has — nothing new to set up.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection: React.FC = () => (
  <section id="how" className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 py-20 px-6">
    <div className="max-w-5xl mx-auto">
      <h2 className="text-4xl font-bold text-center text-gray-900 mb-2">How Indi Works</h2>
      <p className="text-center text-gray-600 mb-16">Deploy once. Watch continuously. Fix everything.</p>

      {/* Timeline Steps */}
      <div className="space-y-12">
        {[
          { title: 'SDK Deploys', desc: 'Install @indi/runtime. Two lines of code. Runs silently in your production app, zero performance impact.', Icon: Terminal },
          { title: 'Watches Traffic & Journeys', desc: 'Every API call flows through — but Indi also maps full user sessions, tracking how people actually move through your product, screen by screen, not just isolated requests.', Icon: Eye },
          { title: 'Calculates Waste', desc: "Weighs each inefficiency by how much it actually costs — a slow call counts for more than a fast one — and expresses savings as a share of the infrastructure spend you report.", Icon: DollarSign },
          { title: 'AI Recommends the Fix', desc: 'Recommendations are grounded in real behavior patterns, like "managers re-fetch the same profile 3x per session" — not generic advice. Ship the fix in hours.', Icon: CheckCircle2 },
        ].map((step, i) => (
          <div key={i} className={`flex gap-8 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}>
            <div className="flex-1">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            </div>
            <div className="flex-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center border-4 border-gray-50">
                <step.Icon className="w-9 h-9 text-purple-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        {[
          { value: formatCurrency(ILLUSTRATIVE_EXAMPLE.annualSavings), label: 'Annual savings', desc: 'In the example above' },
          { value: `${ILLUSTRATIVE_EXAMPLE.measuredWastePercent}%`, label: 'Measured waste', desc: 'Not guessed — observed in real traffic' },
          { value: '2hrs', label: 'To first fix', desc: 'See it. Fix it. Deploy.' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <p className="text-2xl font-bold text-purple-600 mb-2">{stat.value}</p>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">{stat.label}</p>
            <p className="text-xs text-gray-600">{stat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Why It Works Section
const WhyItWorksSection: React.FC = () => (
  <section className="bg-gradient-to-br from-orange-50 to-gray-100 py-16 px-6 border-t border-b border-gray-200">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-gray-900 mb-3">Why Indi Works</h2>
      <p className="text-gray-600 mb-8">Real production data. Real cost math. No guesses.</p>
      <ul className="space-y-3">
        {[
          'Real user traffic and real user journeys, not synthetic tests or sample data',
          'Dollar estimates grounded in your own reported infra spend, not invented numbers',
          'Recommendations based on how your users actually behave, not generic playbooks',
          "Learns what's normal for every part of your app, and flags the moment something changes",
          'Specific, fixable inefficiencies you can ship today',
          'Privacy first—we never see your actual data',
          'Works with any backend, any API',
        ].map((item, i) => (
          <li key={i} className="text-lg text-gray-900 flex items-start gap-4">
            <span className="text-purple-600 font-bold text-2xl flex-shrink-0">→</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

// Get Started Section
const GetStartedSection: React.FC = () => (
  <section className="py-16 px-6">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-gray-900 mb-3">Get started in 4 steps</h2>
      <p className="text-gray-600 mb-12">Zero credit card. Zero commitment.</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { num: 'I', title: 'Install', desc: 'npm install @indi/runtime' },
          { num: 'II', title: 'Initialize', desc: 'Two lines of config in your app' },
          { num: 'III', title: 'Monitor', desc: 'SDK runs quietly in production' },
          { num: 'IV', title: 'Fix', desc: 'Dashboard shows problems and solutions' },
        ].map((step, i) => (
          <div key={i} className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{step.num}</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-xs text-gray-600">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// CTA Section
const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-r from-purple-600 via-purple-700 to-teal-500 py-20 px-6 text-center shadow-lg">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold text-white mb-4">Your APIs are probably wasting money right now</h2>
        <p className="text-white text-lg mb-8 opacity-95">Find out for free. No credit card. No commitment. Takes 5 minutes.</p>
        <button
          onClick={() => navigate('/register')}
          className="px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:shadow-lg transition"
        >
          Start Watching
        </button>
      </div>
    </section>
  );
};

// Footer
const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-white py-8 px-6 text-center text-xs">
    <p className="mb-2">© 2026 Indi. Built by developers who know this pain.</p>
    <p>indimapper.com | Privacy | Terms</p>
  </footer>
);

// Main Component
const RuntimeSDK: React.FC = () => (
  <div className="w-full">
    <Navigation />
    <HeroSection />
    <DiscoverSection />
    <DashboardSection />
    <JourneyShowcaseSection />
    <UnusualActivityShowcaseSection />
    <HowItWorksSection />
    <WhyItWorksSection />
    <GetStartedSection />
    <CTASection />
    <Footer />
  </div>
);

export default RuntimeSDK;