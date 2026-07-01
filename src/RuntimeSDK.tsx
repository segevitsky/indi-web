'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Eye, DollarSign, CheckCircle2 } from 'lucide-react';
import Blobi from './Blobi';

// Types
interface CalculatorState {
  dailyApiCalls: number;
  duplicateRate: number;
  retryRate: number;
  costPerCall: number;
}

interface WasteNumbers {
  duplicateCost: number;
  retryCost: number;
  totalDaily: number;
}

interface CalculatorResult {
  dailyDuplicates: string;
  dailyRetries: string;
  totalDaily: string;
}

// Default example used by the calculator and by the static preview sections below it,
// so both stay mathematically consistent with each other.
const DEFAULT_CALCULATOR_STATE: CalculatorState = {
  dailyApiCalls: 100000,
  duplicateRate: 35,
  retryRate: 8,
  costPerCall: 0.0004,
};

// Utility function to format currency
const formatCurrency = (num: number): string => {
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(0) + 'K';
  if (num < 1) return '$' + num.toFixed(2);
  return '$' + num.toFixed(0);
};

// Utility function to format a plain count (no currency sign)
const formatCount = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num.toFixed(0);
};

// Calculate raw waste numbers from API metrics
const computeWaste = (state: CalculatorState): WasteNumbers => {
  const duplicateCalls = state.dailyApiCalls * (state.duplicateRate / 100);
  const duplicateCost = duplicateCalls * state.costPerCall;

  const failedCalls = state.dailyApiCalls * (state.retryRate / 100);
  const retryCost = failedCalls * 2 * state.costPerCall;

  return { duplicateCost, retryCost, totalDaily: duplicateCost + retryCost };
};

const formatWaste = (waste: WasteNumbers): CalculatorResult => ({
  dailyDuplicates: formatCurrency(waste.duplicateCost),
  dailyRetries: formatCurrency(waste.retryCost),
  totalDaily: formatCurrency(waste.totalDaily),
});

// SVG Icons
const UserIcon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <circle cx="50" cy="35" r="12" fill="white" />
    <path d="M 30 55 Q 30 50 50 50 Q 70 50 70 55 L 70 70 Q 70 75 65 75 L 35 75 Q 30 75 30 70 Z" fill="white" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path d="M 50 20 L 60 40 L 80 40 L 65 55 L 72 75 L 50 60 L 28 75 L 35 55 L 20 40 L 40 40 Z" fill="white" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path d="M 30 50 L 45 65 L 70 35" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="50" cy="50" r="28" fill="none" stroke="white" strokeWidth="2" />
  </svg>
);

const DollarIcon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <text x="50" y="60" fontSize="40" fill="white" textAnchor="middle" fontWeight="bold">
      $
    </text>
    <circle cx="50" cy="50" r="28" fill="none" stroke="white" strokeWidth="2" />
  </svg>
);

// Navigation Component
const Navigation: React.FC = () => (
  <nav className="flex justify-between items-center px-12 py-6 bg-white border-b border-gray-200">
    <div className="flex items-center gap-2">
      <Blobi emotion="happy" size={32} showBadge={false} />
      <span className="text-xl font-bold text-purple-600">INDI</span>
    </div>
    <div className="flex gap-10 text-sm">
      <a href="#calculator" className="text-gray-600 hover:text-purple-600 transition">
        Calculator
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
          API Intelligence System
        </div>
        <div className="text-sm font-medium text-gray-600 mb-4">Stop wasting money on broken APIs</div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">See exactly what's costing you</h1>
        <p className="text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
          Every day, duplicate requests, slow endpoints, and schema mismatches drain your budget. Indi shows you the exact cost of every inefficiency—and how to fix it in hours, not weeks.
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

// Calculator Section
const CalculatorSection: React.FC = () => {
  const [state, setState] = useState<CalculatorState>(DEFAULT_CALCULATOR_STATE);

  const results = formatWaste(computeWaste(state));

  const handleInputChange = (field: keyof CalculatorState, value: number) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section id="calculator" className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Measure Your API Waste</h2>
        <p className="text-center text-gray-600 mb-8">See what you're actually paying for. No guesses about business impact.</p>

        <div className="bg-white rounded-2xl p-12 shadow-lg">
          {/* Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
            {/* Daily API Calls */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                  <UserIcon />
                </div>
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Daily API Calls</label>
              </div>
              <input
                type="number"
                value={state.dailyApiCalls}
                onChange={(e) => handleInputChange('dailyApiCalls', parseFloat(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-purple-600 focus:bg-white transition"
              />
              <p className="text-xs text-gray-600 mt-2">Total API calls per day across your app</p>
            </div>

            {/* Duplicate Rate */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                  <StarIcon />
                </div>
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Duplicate Call Rate</label>
              </div>
              <input
                type="number"
                value={state.duplicateRate}
                onChange={(e) => handleInputChange('duplicateRate', parseFloat(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-purple-600 focus:bg-white transition"
              />
              <p className="text-xs text-gray-600 mt-2">What % of calls are unnecessary duplicates? (Indi detects this)</p>
            </div>

            {/* Retry/Error Rate */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center">
                  <CheckIcon />
                </div>
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Retry/Error Rate</label>
              </div>
              <input
                type="number"
                value={state.retryRate}
                onChange={(e) => handleInputChange('retryRate', parseFloat(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-purple-600 focus:bg-white transition"
              />
              <p className="text-xs text-gray-600 mt-2">What % of calls fail and need to retry? (Indi detects this)</p>
            </div>

            {/* API Cost Per Call */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                  <DollarIcon />
                </div>
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">API Cost Per Call</label>
              </div>
              <input
                type="number"
                step="0.00001"
                value={state.costPerCall}
                onChange={(e) => handleInputChange('costPerCall', parseFloat(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-purple-600 focus:bg-white transition"
              />
              <p className="text-xs text-gray-600 mt-2">What do you pay your cloud provider per call? (Check your AWS/GCP bill)</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 my-8"></div>

          {/* Results */}
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-6">Real Infrastructure Waste</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-purple-600">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Daily Waste from Duplicates</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{results.dailyDuplicates}</p>
              <p className="text-sm text-gray-600">calls you shouldn't make</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-red-500">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Daily Cost of Retries</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{results.dailyRetries}</p>
              <p className="text-sm text-gray-600">failed calls + retry attempts</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-teal-500">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Daily Total Waste</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{results.totalDaily}</p>
              <p className="text-sm text-gray-600">real money you're paying for nothing</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-teal-50 border-l-4 border-teal-600 rounded-lg p-6 mt-8">
            <p className="font-bold text-gray-900 mb-2">What This Calculation Shows</p>
            <p className="text-sm text-gray-700 mb-2">
              This is purely infrastructure cost waste — what you're actually paying your cloud provider for API calls that shouldn't exist or are failing. This number is real, measurable, and Indi detects it automatically.
            </p>
            <p className="text-sm text-gray-700">
              <strong>What this does NOT include:</strong> business impact, lost customers, or productivity costs. Those vary wildly by business and only you can calculate them.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Dashboard Preview Section
// Mirrors the calculator's default example so the numbers never drift apart.
const DASHBOARD_WASTE = computeWaste(DEFAULT_CALCULATOR_STATE);
const DASHBOARD_ANNUAL_WASTE = DASHBOARD_WASTE.totalDaily * 365;

const DashboardSection: React.FC = () => (
  <section id="demo" className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 py-12 px-6">
    <div className="max-width mx-auto max-w-6xl">
      {/* Dashboard Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg mb-8">
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Your API Performance</h3>
          <p className="text-sm text-gray-600">{formatCount(DEFAULT_CALCULATOR_STATE.dailyApiCalls)} daily requests</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-l-4 border-purple-600">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Daily Requests</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{formatCount(DEFAULT_CALCULATOR_STATE.dailyApiCalls)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-l-4 border-red-500">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Daily Waste</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(DASHBOARD_WASTE.totalDaily)}</p>
            <p className="text-xs text-gray-600">from duplicates & retries</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-l-4 border-teal-600">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Duplicate Rate</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{DEFAULT_CALCULATOR_STATE.duplicateRate}%</p>
            <p className="text-xs text-gray-600">of all requests</p>
          </div>
        </div>

        {/* Problems */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4">What's Draining Your Budget</p>
          <div className="space-y-3">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="font-bold text-gray-900">{DEFAULT_CALCULATOR_STATE.duplicateRate}% Duplicate Requests</p>
              <p className="text-sm text-red-600 font-bold">{formatCurrency(DASHBOARD_WASTE.duplicateCost)}/day in wasted API calls</p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="font-bold text-gray-900">{DEFAULT_CALCULATOR_STATE.retryRate}% Retry/Error Rate</p>
              <p className="text-sm text-red-600 font-bold">{formatCurrency(DASHBOARD_WASTE.retryCost)}/day in failed + retry costs</p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="font-bold text-gray-900">Annual Infrastructure Waste</p>
              <p className="text-sm text-red-600 font-bold">{formatCurrency(DASHBOARD_ANNUAL_WASTE)}/year (fixable)</p>
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
          { title: 'Watches Traffic', desc: 'Every API call from real users flows through. The SDK learns patterns, tracks sequences, identifies duplicates and failures.', Icon: Eye },
          { title: 'Calculates Waste', desc: 'Maps each inefficiency to real infrastructure costs. Duplicates cost $X/day. Retries cost $Y/day. Everything is quantified.', Icon: DollarSign },
          { title: 'You Fix It', desc: 'Dashboard shows exactly what to fix. Ship code in hours. Watch infrastructure costs drop. Impact compounds over time.', Icon: CheckCircle2 },
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
        {[
          { value: formatCurrency(DASHBOARD_ANNUAL_WASTE), label: 'Annual savings', desc: 'Just from detected waste' },
          { value: `${DEFAULT_CALCULATOR_STATE.duplicateRate}%`, label: 'Duplicate calls', desc: 'Typical reduction' },
          { value: `${DEFAULT_CALCULATOR_STATE.retryRate}%`, label: 'Retry rate', desc: 'Targetable with fixes' },
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
          'Real user traffic, not synthetic tests or sample data',
          'Infrastructure costs that are actually measurable',
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
    <CalculatorSection />
    <DashboardSection />
    <HowItWorksSection />
    <WhyItWorksSection />
    <GetStartedSection />
    <CTASection />
    <Footer />
  </div>
);

export default RuntimeSDK;