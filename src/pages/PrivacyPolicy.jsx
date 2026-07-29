import React from 'react';
import './PrivacyPolicy.css';

const privacyData = [
  {
    id: 'introduction',
    number: '1',
    title: 'Introduction',
    clauses: [
      { num: '1.1', text: 'This Privacy Policy explains how Amana Technologies Ltd, trading as AMANA ("Amana", "we", "us", or "our"), collects, uses, stores, shares, and protects the personal information of individuals and businesses ("Trader", "you", or "your") who use our platform and services.' },
      { num: '1.2', text: 'By using our mobile application, website, or any of our services, you acknowledge that you have read and understood this Privacy Policy and consent to the collection and use of your information as described herein.' },
      { num: '1.3', text: 'This Privacy Policy is supplemented by our Terms and Conditions, which should be read together with this document.' },
      { num: '1.4', text: 'Amana is committed to protecting your privacy and handling your data in compliance with the Nigeria Data Protection Act 2023 (NDPA) and other applicable data protection laws.' },
    ],
  },
  {
    id: 'data-controller',
    number: '2',
    title: 'Data Controller',
    clauses: [
      { num: '2.1', text: 'Amana Technologies Ltd is the data controller responsible for your personal data. Our registered address is 131, Fegi, Doka, Kano State, Nigeria (RC 9696997).' },
      { num: '2.2', text: 'For any questions about this Privacy Policy or how we handle your data, you may contact us at service.amanafinance@gmail.com or 08032532333.' },
    ],
  },
  {
    id: 'data-collected',
    number: '3',
    title: 'Information We Collect',
    clauses: [
      { num: '3.1', text: 'Account Information: When you register, we collect your full name, email address, phone number(s), and password (stored in hashed form). For vendors, we also collect your business name and business address.' },
      { num: '3.2', text: 'Identity Verification (KYC): To verify your identity and comply with regulatory requirements, we collect your Bank Verification Number (BVN), a copy of a valid government-issued ID (such as a National ID, Voter\'s Card, or Driver\'s License), and proof of business location.' },
      { num: '3.3', text: 'Business Information: We collect details about your trading business, including years of operation, type of goods traded, and market location, to assess your eligibility for financing.' },
      { num: '3.4', text: 'Financial Information: We collect and generate financial data including your Amana credit score, credit limit, repayment history, transaction records, and outstanding balances under Murabaha contracts.' },
      { num: '3.5', text: 'Photos and Images: We collect photographs of KYC documents you upload, product images (for vendors), and photographs taken during agent-assisted purchases and field visits.' },
      { num: '3.6', text: 'Device Information: We collect your device\'s push notification token to send you important notifications about your account, transactions, and repayment reminders.' },
      { num: '3.7', text: 'Psychometric Assessment Data: For retailers, we collect your responses to our financial literacy and behavioural assessment during onboarding, which forms part of your initial credit scoring.' },
      { num: '3.8', text: 'Usage Data: We may collect information about how you interact with our app, including pages visited, features used, and timestamps, to improve our services.' },
    ],
  },
  {
    id: 'how-used',
    number: '4',
    title: 'How We Use Your Information',
    clauses: [
      { num: '4.1', text: 'Eligibility Assessment: To evaluate your application for inventory financing, calculate your Amana credit score, and determine your credit limit and tier.' },
      { num: '4.2', text: 'Service Delivery: To process and manage your Murabaha contracts, facilitate purchases through agents, track repayments, and maintain your account.' },
      { num: '4.3', text: 'Identity Verification: To verify your identity, prevent fraud, and comply with Know Your Customer (KYC) and anti-money laundering requirements.' },
      { num: '4.4', text: 'Communication: To send you transaction confirmations, repayment reminders, account updates, and important service announcements via email, SMS, or push notifications.' },
      { num: '4.5', text: 'Credit Scoring: To continuously assess and update your Amana score based on your repayment behaviour, which determines your credit limit and the profit margin applied to your Murabaha contracts.' },
      { num: '4.6', text: 'Platform Improvement: To analyse usage patterns and improve the functionality, user experience, and security of our platform.' },
      { num: '4.7', text: 'Legal Compliance: To comply with applicable laws, regulations, and legal processes, and to establish, exercise, or defend legal claims.' },
      { num: '4.8', text: 'Default Recovery: In the event of a default, to facilitate the recovery process described in our Terms and Conditions, including engagement through your Market Agent and, where applicable, mediation through your Market Union.' },
    ],
  },
  {
    id: 'data-sharing',
    number: '5',
    title: 'How We Share Your Information',
    clauses: [
      { num: '5.1', text: 'Payment Processors: We share necessary transaction data with Paystack, our payment gateway provider, to process your repayments securely. Paystack processes this data in accordance with its own privacy policy and PCI DSS compliance standards.' },
      { num: '5.2', text: 'Cloud Storage: Photographs and images you upload (KYC documents, product photos) are stored securely on Cloudinary, a cloud-based image management service. These images are stored with access controls and are not publicly accessible.' },
      { num: '5.3', text: 'Market Agents and Market Unions: In the event of a repayment default, we may share limited repayment information with your assigned Market Agent or Market Union for the purposes of mediation, as described in clause 10.3 of our Terms and Conditions. This disclosure is limited to what is reasonably necessary for that mediation.' },
      { num: '5.4', text: 'Amana Agents: Our appointed agents who facilitate purchases on your behalf will have access to limited information necessary to complete the transaction, including your name and the details of the goods being purchased.' },
      { num: '5.5', text: 'Legal Requirements: We may disclose your information where required by law, regulation, court order, or governmental request, or where necessary to protect our rights, safety, or property.' },
      { num: '5.6', text: 'We do not sell, rent, or trade your personal information to third parties for marketing purposes.' },
    ],
  },
  {
    id: 'data-security',
    number: '6',
    title: 'Data Security',
    clauses: [
      { num: '6.1', text: 'We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction.' },
      { num: '6.2', text: 'All data transmitted between your device and our servers is encrypted using HTTPS (TLS/SSL) encryption.' },
      { num: '6.3', text: 'Passwords are stored using industry-standard one-way hashing (bcrypt) and are never stored in plain text.' },
      { num: '6.4', text: 'Access to personal data is restricted to authorised personnel who need it to perform their duties, and our backend is protected by JWT authentication and role-based access controls.' },
      { num: '6.5', text: 'While we take reasonable steps to protect your information, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security of your data.' },
    ],
  },
  {
    id: 'data-retention',
    number: '7',
    title: 'Data Retention',
    clauses: [
      { num: '7.1', text: 'We retain your personal information for as long as your account is active and for a reasonable period thereafter, as necessary to fulfil the purposes for which it was collected, comply with legal obligations, resolve disputes, and enforce our agreements.' },
      { num: '7.2', text: 'Financial transaction records and KYC documents are retained for the period required by applicable Nigerian law and regulations, which may extend beyond the termination of your account.' },
      { num: '7.3', text: 'Where your data is no longer required for any lawful purpose, we will securely delete or anonymise it.' },
    ],
  },
  {
    id: 'your-rights',
    number: '8',
    title: 'Your Rights',
    clauses: [
      { num: '8.1', text: 'Under the Nigeria Data Protection Act 2023 and other applicable laws, you have the following rights regarding your personal data:' },
      { num: '8.2', text: 'Right of Access: You may request a copy of the personal data we hold about you.' },
      { num: '8.3', text: 'Right to Rectification: You may request correction of any inaccurate or incomplete personal data we hold about you.' },
      { num: '8.4', text: 'Right to Deletion: You may request deletion of your personal data, subject to our legal obligations to retain certain records (such as financial transaction records and KYC documents required by law).' },
      { num: '8.5', text: 'Right to Object: You may object to the processing of your personal data in certain circumstances.' },
      { num: '8.6', text: 'Right to Data Portability: Where technically feasible, you may request that we provide your personal data in a structured, commonly used, and machine-readable format.' },
      { num: '8.7', text: 'To exercise any of these rights, please contact us at service.amanafinance@gmail.com. We will respond to your request within a reasonable period, and in any event within the timeframe required by applicable law.' },
    ],
  },
  {
    id: 'cookies',
    number: '9',
    title: 'Cookies and Local Storage',
    clauses: [
      { num: '9.1', text: 'Our mobile application uses local device storage (AsyncStorage) to maintain your login session and app preferences. This data is stored only on your device and is not transmitted to third parties.' },
      { num: '9.2', text: 'Our website may use essential cookies necessary for the functioning of the site, such as session management. We do not use tracking or advertising cookies.' },
    ],
  },
  {
    id: 'children',
    number: '10',
    title: 'Children\'s Privacy',
    clauses: [
      { num: '10.1', text: 'Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18.' },
      { num: '10.2', text: 'If we become aware that we have collected personal information from a person under 18, we will take steps to delete that information promptly.' },
      { num: '10.3', text: 'If you believe that a child under 18 has provided us with personal information, please contact us at service.amanafinance@gmail.com.' },
    ],
  },
  {
    id: 'third-party-links',
    number: '11',
    title: 'Third-Party Links and Services',
    clauses: [
      { num: '11.1', text: 'Our platform may contain links to third-party websites or services (such as Paystack for payments). We are not responsible for the privacy practices of these third parties, and we encourage you to review their privacy policies before providing them with your information.' },
    ],
  },
  {
    id: 'international-transfers',
    number: '12',
    title: 'International Data Transfers',
    clauses: [
      { num: '12.1', text: 'Some of our service providers (such as Cloudinary for image storage) may process your data outside Nigeria. Where this occurs, we ensure that appropriate safeguards are in place to protect your data in accordance with applicable data protection law.' },
    ],
  },
  {
    id: 'changes',
    number: '13',
    title: 'Changes to This Privacy Policy',
    clauses: [
      { num: '13.1', text: 'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. Updated versions will be published on our website and within our mobile application.' },
      { num: '13.2', text: 'We will notify you of material changes through the app or by email. Continued use of our services after such notification constitutes acceptance of the updated Privacy Policy.' },
      { num: '13.3', text: 'We encourage you to review this Privacy Policy periodically.' },
    ],
  },
  {
    id: 'contact',
    number: '14',
    title: 'Contact Us',
    clauses: [
      { num: '14.1', text: 'Amana Technologies Ltd, trading as AMANA, registered with the Corporate Affairs Commission under RC 9696997.' },
      { num: '14.2', text: 'Registered address: 131, Fegi, Doka, Kano State, Nigeria.' },
      { num: '14.3', text: 'Email: service.amanafinance@gmail.com' },
      { num: '14.4', text: 'Phone: 08032532333' },
      { num: '14.5', text: 'You may also reach out to your assigned Market Agent for assistance.' },
    ],
  },
];

const PrivacyPolicy = () => {

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="privacy-page">
      <div className="privacy-container">

        {/* Hero */}
        <div className="privacy-hero">
          <div className="privacy-badge">
            <span className="privacy-badge-dot" />
            Legal Document
          </div>
          <h1>Privacy Policy</h1>
          <p className="privacy-hero-description">
            This Privacy Policy explains how Amana collects, uses, stores, and
            protects your personal information when you use our platform and
            services.
          </p>
          <div className="privacy-meta">
            <span className="privacy-meta-item">
              <span className="privacy-meta-icon">🔒</span>
              Data Protection
            </span>
            <span className="privacy-meta-item">
              <span className="privacy-meta-icon">📅</span>
              Effective: 29 July 2026
            </span>
            <span className="privacy-meta-item">
              <span className="privacy-meta-icon">🇳🇬</span>
              NDPA 2023 Compliant
            </span>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="privacy-toc">
          <div className="privacy-toc-title">Table of Contents</div>
          <ul className="privacy-toc-list">
            {privacyData.map((section) => (
              <li key={section.id}>
                <button
                  className="privacy-toc-item"
                  onClick={() => scrollToSection(section.id)}
                  type="button"
                >
                  <span className="privacy-toc-number">{section.number}.</span>
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        <div className="privacy-sections">
          {privacyData.map((section) => (
            <div className="privacy-section" key={section.id} id={section.id}>
              <div className="privacy-section-card">
                <div className="privacy-section-header">
                  <span className="privacy-section-number">{section.number}</span>
                  <h2 className="privacy-section-title">{section.title}</h2>
                </div>
                <div className="privacy-clauses">
                  {section.clauses.map((clause) => (
                    <div className="privacy-clause" key={clause.num}>
                      <span className="privacy-clause-number">{clause.num}</span>
                      <span className="privacy-clause-text">{clause.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Acceptance Footer */}
        <div className="privacy-acceptance">
          <div className="privacy-acceptance-card">
            <div className="privacy-acceptance-icon">🔐</div>
            <p>
              By using the Amana platform, you acknowledge that you have read and
              understood this <strong>Privacy Policy</strong> and consent to the
              collection and use of your information as described herein.
            </p>
          </div>
        </div>

        {/* Back to Top */}
        <div className="privacy-back-to-top">
          <button onClick={scrollToTop} type="button">
            ↑ Back to Top
          </button>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
