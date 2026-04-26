import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LineChart, Wallet } from 'lucide-react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const Landing = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  useScrollAnimation();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', overflowX: 'hidden' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', padding: '1.5rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 100, background: scrollY > 50 ? 'rgba(30, 27, 75, 0.9)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
          <Wallet className="w-8 h-8" style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>SmartSpend</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/login')} style={{
            background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)',
            padding: '0.5rem 1.5rem', borderRadius: '12px', fontWeight: '600', cursor: 'pointer',
            transition: 'all 0.2s'
          }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
             onMouseLeave={e => e.target.style.background = 'transparent'}>
            Login
          </button>
          <button className="neu-button neu-button-primary" onClick={() => navigate('/register')} style={{ padding: '0.5rem 1.5rem' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Section 1: Hero Parallax */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1E1B4B 0%, #7C3AED 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 2rem',
        overflow: 'hidden'
      }}>
        {/* Floating background elements tied to scroll */}
        <div style={{
          position: 'absolute', top: '20%', left: '10%',
          width: '300px', height: '200px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px', backdropFilter: 'blur(10px)',
          transform: `translateY(${scrollY * 0.3}px) rotate(-10deg)`
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%',
          width: '250px', height: '250px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%', backdropFilter: 'blur(10px)',
          transform: `translateY(${scrollY * 0.4}px)`
        }} />

        <div style={{ textAlign: 'center', zIndex: 10, maxWidth: '800px', transform: `translateY(${scrollY * 0.1}px)` }}>
          <h1 style={{ fontSize: '4rem', color: 'white', fontWeight: '900', marginBottom: '1rem', lineHeight: '1.2' }}>
            Track Smart, <br/>Spend Smarter
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#C7D2FE', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            AI-powered finance tracker designed specifically for students to manage budgets, detect leaks, and save more.
          </p>
          <button className="neu-button neu-button-primary" onClick={() => navigate('/register')} style={{ fontSize: '1.125rem', padding: '1rem 2.5rem' }}>
            Start Tracking Today
          </button>
        </div>
      </section>

      {/* Section 2: Features Parallax */}
      <section style={{
        padding: '8rem 2rem',
        position: 'relative',
        background: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" opacity="0.05"><circle cx="50" cy="50" r="2" fill="%237C3AED"/></svg>')`,
        backgroundPositionY: `${scrollY * 0.5}px`
      }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 style={{ fontSize: '2.5rem', color: 'var(--sidebar-bg)' }}>Powerful Features</h2>
            <p className="text-muted">Everything you need to take control of your finances.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="neu-card animate-on-scroll delay-100 flex flex-col items-center text-center">
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(248, 113, 113, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Money Leak Detection</h3>
              <p className="text-muted">Our AI engine analyzes your spending patterns to find hidden leaks like subscriptions and impulse buys.</p>
            </div>

            <div className="neu-card animate-on-scroll delay-300 flex flex-col items-center text-center">
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <LineChart className="w-8 h-8" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Smart Analytics</h3>
              <p className="text-muted">Visualize your spending with beautiful charts and get daily insights on your financial health.</p>
            </div>

            <div className="neu-card animate-on-scroll delay-450 flex flex-col items-center text-center">
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Wallet className="w-8 h-8" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Budget Tracking</h3>
              <p className="text-muted">Set monthly limits for categories and track your progress in real-time to avoid overspending.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: CTA */}
      <section className="animate-on-scroll" style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(to right, #EDE9FE, #F5F3FF)',
        textAlign: 'center'
      }}>
        <div className="max-w-4xl mx-auto neu-card" style={{ padding: '4rem 2rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--sidebar-bg)' }}>Ready to transform your finances?</h2>
          <p className="text-muted" style={{ fontSize: '1.25rem', marginBottom: '2.5rem' }}>Start tracking today — it's free and takes 30 seconds.</p>
          <button className="neu-button neu-button-primary" onClick={() => navigate('/register')} style={{ fontSize: '1.125rem', padding: '1rem 3rem' }}>
            Create Free Account
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
