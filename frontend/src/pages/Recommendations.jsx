import React from 'react';
import { Lightbulb, PiggyBank, Briefcase, TrendingUp, ShieldCheck } from 'lucide-react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const TIPS = [
  {
    id: 1,
    icon: PiggyBank,
    color: 'var(--primary)',
    bg: 'rgba(124, 58, 237, 0.1)',
    title: 'The 50/30/20 Rule',
    description: 'Allocate 50% of your income to needs, 30% to wants, and 20% to savings. This simple framework ensures you cover essentials while building a safety net.'
  },
  {
    id: 2,
    icon: TrendingUp,
    color: 'var(--success)',
    bg: 'rgba(52, 211, 153, 0.1)',
    title: 'Automate Savings',
    description: 'Set up automatic transfers to your savings account on payday. Paying yourself first removes the temptation to spend money meant for your future.'
  },
  {
    id: 3,
    icon: ShieldCheck,
    color: 'var(--warning)',
    bg: 'rgba(251, 191, 36, 0.1)',
    title: 'Emergency Fund Basics',
    description: 'Aim to save 3-6 months of living expenses. Keep this money in a high-yield, easily accessible account to protect against unexpected job loss or medical bills.'
  },
  {
    id: 4,
    icon: Briefcase,
    color: 'var(--secondary)',
    bg: 'rgba(6, 182, 212, 0.1)',
    title: 'Track Every Penny',
    description: 'Consistent tracking is the key to financial awareness. Use SmartSpend daily to log transactions so you never wonder where your money went.'
  }
];

const Recommendations = () => {
  useScrollAnimation();

  return (
    <div className="max-w-4xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="animate-on-scroll">
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Financial Tips</h1>
        <p className="text-muted">Best practices to improve your financial health</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {TIPS.map((tip, i) => {
          const Icon = tip.icon;
          return (
            <div key={tip.id} className={`neu-card animate-on-scroll delay-${(i % 4) * 150}`}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: tip.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Icon className="w-6 h-6" style={{ color: tip.color }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{tip.title}</h3>
              <p style={{ color: 'var(--text)', lineHeight: '1.6' }}>{tip.description}</p>
            </div>
          );
        })}
      </div>

      <div className="neu-card animate-on-scroll delay-300" style={{ marginTop: '1.5rem', background: 'var(--primary)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <Lightbulb className="w-8 h-8 text-warning flex-shrink-0" />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Pro Tip: Review Subscriptions</h3>
            <p style={{ lineHeight: '1.6', opacity: 0.9 }}>
              Ghost subscriptions are one of the biggest money leaks. Check your bank statements at least once every 3 months for services you no longer use. Use our Utilities and Money Leaks tabs to track these effortlessly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
