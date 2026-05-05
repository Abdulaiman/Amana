import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Target, Shield, Zap, TrendingUp } from 'lucide-react';
import './Landing.css';

const Landing = () => {
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  return (
    <div className="landing-new">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg-image">
          <img src="/hero-trader.png" alt="Informal Trade" />
        </div>
        <div className="hero-content section-container">
          <h1 className="hero-headline animate-fade-in">
            Turning Informal Trade into <span className="text-gradient">Financial Identity</span>
          </h1>
          <p className="hero-subheadline">
            We make hustle visible, verifiable, and bankable.
          </p>
          <p className="hero-supporting">
            Millions of traders work every day, but to the financial system, they don’t exist. Amana changes that.
          </p>
          <div className="cta-group">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started <ArrowRight size={20} />
            </Link>
            <a href="#problem" className="btn btn-outline btn-lg">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM */}
      <section id="problem" className="fade-in-section" ref={addToRefs}>
        <div className="section-container">
          <span className="section-title">The Problem</span>
          <h2 className="section-headline">
            Informal workers power entire economies, yet they are invisible to the systems designed to support them.
          </h2>
          <div className="feature-grid">
            <div className="feature-card">
              <Shield className="text-primary mb-4" size={40} />
              <h3>No financial records</h3>
              <p>Years of hard work leave no digital trace, making it impossible to prove income.</p>
            </div>
            <div className="feature-card">
              <Target className="text-primary mb-4" size={40} />
              <h3>No credit history</h3>
              <p>Without data, traditional banks see informal traders as "high risk," regardless of their actual reliability.</p>
            </div>
            <div className="feature-card">
              <TrendingUp className="text-primary mb-4" size={40} />
              <h3>No access to capital</h3>
              <p>Opportunities for growth are blocked by a lack of collateral and verifiable business history.</p>
            </div>
          </div>
          <p className="closing-line">Effort exists. Recognition doesn’t.</p>
        </div>
      </section>

      {/* 3. THE SOLUTION */}
      <section id="solution" className="fade-in-section" ref={addToRefs}>
        <div className="section-container">
          <span className="section-title">What Amana Does</span>
          <h2 className="section-headline">
            Amana builds digital financial identities for informal workers by turning everyday trade into verified records.
          </h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="step-number">01</div>
              <h3>Capture</h3>
              <p>We record real trade activity directly from markets and communities.</p>
            </div>
            <div className="feature-card">
              <div className="step-number">02</div>
              <h3>Verify</h3>
              <p>Every transaction becomes a trusted, permanent proof of work.</p>
            </div>
            <div className="feature-card">
              <div className="step-number">03</div>
              <h3>Unlock</h3>
              <p>That record becomes access — to credit, financial services, and opportunity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="fade-in-section" ref={addToRefs}>
        <div className="section-container">
          <span className="section-title">How It Works</span>
          <h2 className="section-headline">
            We integrate into existing trade flows — no complexity, no behavior change.
          </h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>1. Access Goods</h3>
              <p>Traders access goods or inventory through Amana's network.</p>
            </div>
            <div className="feature-card">
              <h3>2. Record Activity</h3>
              <p>Transactions are recorded automatically as they happen.</p>
            </div>
            <div className="feature-card">
              <h3>3. Build Identity</h3>
              <p>A comprehensive financial identity is built over time with every trade.</p>
            </div>
          </div>
          <p className="closing-line">No paperwork. No guesswork. Just proof.</p>
        </div>
      </section>

      {/* 5. WHY IT MATTERS */}
      <section className="fade-in-section" ref={addToRefs}>
        <div className="section-container">
          <span className="section-title">Why This Matters</span>
          <h2 className="section-headline">When work is invisible, progress stops.</h2>
          <ul className="impact-bullets">
            <li className="impact-item">Businesses can’t grow</li>
            <li className="impact-item">Families remain financially vulnerable</li>
            <li className="impact-item">Entire economies lose potential</li>
          </ul>
          <p className="closing-line">We’re not just recording transactions — we’re unlocking futures.</p>
        </div>
      </section>

      {/* 6. OUR VISION */}
      <section className="fade-in-section" ref={addToRefs}>
        <div className="section-container text-center">
          <span className="section-title">Our Vision</span>
          <h2 className="section-headline">
            A world where every worker — no matter where they start — has a financial identity that opens doors.
          </h2>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="final-cta fade-in-section" ref={addToRefs}>
        <div className="section-container">
          <h2 className="hero-headline">Make Your Work Count</h2>
          <p className="hero-subheadline">Start building a financial identity today.</p>
          <div className="cta-group mt-4">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
