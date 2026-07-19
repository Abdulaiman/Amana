import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Award, Download } from 'lucide-react';
import './landing.css';
import AppPromo from '../components/AppPromo';

const Landing = () => {
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
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

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-new">
      {/* SECTION 2: Hero */}
      <section className="hero-section islamic-pattern">
        <div className="hero-content">
          <h1 className="hero-headline">
            Grow Your Trade the Halal Way
          </h1>
          <p className="hero-subheadline">
            Amana buys the stock you need and sells it back to you at a clear, agreed profit. No interest. No hidden charges. No compromise on your faith.
          </p>
          <div className="cta-group">
            <Link to="/register" className="btn-cta-lg">
              Apply for Financing <ArrowRight size={20} />
            </Link>
            <a 
              href="https://drive.google.com/uc?export=download&id=1Yqz9jshwEwVvSSpPSKDOWBOSBKV1pUW2" 
              className="btn-cta-secondary"
            >
              Download for Android <Download size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 3: The Problem, Stated Plainly */}
      <section id="problem" className="fade-in-section" ref={addToRefs}>
        <div className="section-container">
          <span className="section-label">The Challenge</span>
          <h2 className="section-headline">Most trade financing isn't built for you</h2>
          <p className="plain-body">
            If you've looked for financing to grow your business, you've probably run into the same wall: interest. Bank loans, microfinance, most digital lenders, they all charge riba, which many traders cannot and will not accept. So you wait, undercapitalized, watching opportunities pass you by. Amana was built to close that gap.
          </p>
        </div>
      </section>

      {/* SECTION 4: What Is Murabaha */}
      <section id="education" className="fade-in-section" ref={addToRefs}>
        <div className="section-container">
          <span className="section-label">Sharia-Compliant Trade</span>
          <h2 className="section-headline">How Murabaha Works, In Plain Terms</h2>
          <p className="plain-body">
            Murabaha is a Sharia-compliant sale, not a loan. Instead of lending you cash, Amana buys the exact goods you need directly from your supplier. We then sell those goods to you at a clear price that already includes our profit, agreed with you in advance. You know exactly what you'll pay before you commit. No interest is ever charged, at any point, for any reason.
          </p>
          <div className="callout-box">
            <p>No interest. No cash you could be tempted to misuse. Full transparency, always.</p>
          </div>
        </div>
      </section>

      {/* SECTION 5: How It Works (4-step visual flow) */}
      <section id="how-it-works" className="fade-in-section" ref={addToRefs}>
        <div className="section-container">
          <span className="section-label">Simple Process</span>
          <h2 className="section-headline">From Request to Restock, In Four Simple Steps</h2>
          
          <div className="steps-container">
            <div className="step-card">
              <div className="step-badge">1</div>
              <h3>Tell Us What You Need</h3>
              <p>Log the stock you want to buy directly in the Amana app, or ask a local agent to help you.</p>
            </div>
            
            <div className="step-card">
              <div className="step-badge">2</div>
              <h3>We Buy It For You</h3>
              <p>Our agent purchases the goods directly from your supplier and confirms the purchase details.</p>
            </div>
            
            <div className="step-card">
              <div className="step-badge">3</div>
              <h3>Agree Your Terms</h3>
              <p>A clear Murabaha agreement is generated, showing your price and repayment schedule before you sign.</p>
            </div>
            
            <div className="step-card">
              <div className="step-badge">4</div>
              <h3>Get Your Goods & Sell</h3>
              <p>Your stock is delivered directly. Repay over an agreed period as you sell your inventory.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Trust and Compliance */}
      <section id="about" className="fade-in-section" ref={addToRefs}>
        <div className="section-container">
          <span className="section-label">Trust & Governance</span>
          <h2 className="section-headline">Built on Real Sharia Governance, Not a Marketing Label</h2>
          <p className="plain-body">
            Amana's Murabaha structure is undergoing formal review by Sheikh Dr. Bashir Aliyu Umar, Imam of Al-Furqan Mosque, Kano, to ensure it meets rigorous Islamic finance standards, not just in name, but in how every transaction actually works.
          </p>
          
          <div className="compliance-points">
            <div className="compliance-card">
              <ShieldCheck className="compliance-icon" size={32} />
              <h4>No interest, ever</h4>
              <p>Fully compliant with Sharia standards forbidding riba on credit.</p>
            </div>
            <div className="compliance-card">
              <Award className="compliance-icon" size={32} />
              <h4>Transparent pricing</h4>
              <p>All pricing, markup, and schedules are agreed before you commit.</p>
            </div>
            <div className="compliance-card">
              <CheckCircle2 className="compliance-icon" size={32} />
              <h4>Real physical trade</h4>
              <p>We purchase physical goods on your behalf rather than handing over cash.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Who Amana Is For */}
      <section className="fade-in-section" ref={addToRefs}>
        <div className="section-container">
          <span className="section-label">Our Community</span>
          <h2 className="section-headline">Built for Nigeria's Traders</h2>
          <p className="plain-body">
            Amana serves market and informal traders who need working capital to restock but won't compromise on interest-free financing. We're currently active across 3 states, growing with every market we reach.
          </p>
        </div>
      </section>

      {/* SECTION 8: FAQ */}
      <section id="faq" className="fade-in-section" ref={addToRefs}>
        <div className="section-container">
          <span className="section-label">Answers</span>
          <h2 className="section-headline">Common Questions</h2>
          
          <div className="faq-grid">
            <div className="faq-item">
              <h3 className="faq-question">Is this really interest-free?</h3>
              <p className="faq-answer">
                Yes. Amana never charges interest. We buy the goods you need and sell them to you at a fixed, agreed price that includes our profit margin, set before you commit to anything.
              </p>
            </div>
            
            <div className="faq-item">
              <h3 className="faq-question">What happens if I can't pay on time?</h3>
              <p className="faq-answer">
                Talk to us as early as possible. We work with traders directly to find a fair path forward before anything else happens.
              </p>
            </div>
            
            <div className="faq-item">
              <h3 className="faq-question">How much stock can I get financed?</h3>
              <p className="faq-answer">
                This depends on the goods you need and your trading history with us. Apply and our team will walk you through it.
              </p>
            </div>
            
            <div className="faq-item">
              <h3 className="faq-question">Which areas do you currently serve?</h3>
              <p className="faq-answer">
                Amana is currently active across 3 states. Apply and we'll let you know if we're live in your market yet.
              </p>
            </div>
            
            <div className="faq-item">
              <h3 className="faq-question">Do I need a smartphone to use Amana?</h3>
              <p className="faq-answer">
                No. While we have a mobile app and a web version, we also have dedicated market agents who can assist you directly in the market. They can help you create an account, request inventory financing, and manage your repayments without needing a smartphone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: App Download (Kept from old version) */}
      <AppPromo />

      {/* SECTION 10: Final CTA */}
      <section className="final-cta fade-in-section" ref={addToRefs}>
        <div className="section-container">
          <h2 className="section-headline">Ready to Grow Your Trade the Halal Way?</h2>
          <p className="plain-body">Apply in minutes. No interest, no hidden charges, no compromise.</p>
          <div className="cta-group">
            <Link to="/register" className="btn-cta-lg">
              Apply for Financing <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
