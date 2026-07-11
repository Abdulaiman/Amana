import React from 'react';
import './TermsAndConditions.css';

const termsData = [
  {
    id: 'introduction',
    number: '1',
    title: 'Introduction and Acceptance',
    clauses: [
      { num: '1.1', text: 'These Terms and Conditions (the "Terms") govern the relationship between Amana, trading as AMANA ("Amana", "we", "us", or "our"), and any individual or business ("Trader", "you", or "your") who applies for or receives inventory financing through our platform.' },
      { num: '1.2', text: 'By accessing our website, submitting an application, or accepting financing from Amana, you confirm that you have read, understood, and agree to be bound by these Terms.' },
      { num: '1.3', text: 'If you do not agree to these Terms, you should not use our services.' },
    ],
  },
  {
    id: 'definitions',
    number: '2',
    title: 'Definitions',
    isDefinition: true,
    clauses: [
      { num: '2.1', text: '"Agent" means a party appointed by Amana, whether an Internal Agent employed directly by Amana or an Agent-Trader operating on the Amana platform, to purchase and take possession of Goods on Amana\'s behalf.' },
      { num: '2.2', text: '"Trader" means any individual or business that applies for and receives Goods financed by Amana under a Murabaha contract.' },
      { num: '2.3', text: '"Goods" means the inventory or stock purchased by Amana, through its Agent, for onward sale to a Trader.' },
      { num: '2.4', text: '"Murabaha" means a Sharia-compliant sale contract under which Amana purchases Goods and sells them to a Trader at a disclosed cost price plus an agreed Profit Margin, repayable over an agreed period.' },
      { num: '2.5', text: '"Profit Margin" means the amount added to the cost price of the Goods, agreed between Amana and the Trader before the Murabaha contract is concluded.' },
    ],
  },
  {
    id: 'services',
    number: '3',
    title: 'Our Services',
    clauses: [
      { num: '3.1', text: 'Amana provides Sharia-compliant inventory financing to traders using the Murabaha model.' },
      { num: '3.2', text: 'In each transaction, Amana purchases the Goods a Trader has requested, through its appointed Agent, and sells the Goods to the Trader under a Murabaha contract at cost price plus an agreed Profit Margin.' },
      { num: '3.3', text: 'Amana does not provide cash loans. Financing is always structured as a purchase and resale of specific Goods.' },
    ],
  },
  {
    id: 'eligibility',
    number: '4',
    title: 'Eligibility',
    clauses: [
      { num: '4.1', text: 'To apply for financing, you must be at least 18 years old and legally capable of entering into binding contracts.' },
      { num: '4.2', text: 'You must provide accurate and complete information during the application process, including proof of identity and any other documentation Amana may reasonably request.' },
      { num: '4.3', text: 'Amana reserves the right to accept or decline any application at its sole discretion.' },
    ],
  },
  {
    id: 'process',
    number: '5',
    title: 'Application and Purchase Process',
    clauses: [
      { num: '5.1', text: 'A Trader identifies the Goods required and requests that Amana purchase them on the Trader\'s behalf.' },
      { num: '5.2', text: 'Amana appoints an Agent and transfers the purchase funds to that Agent.' },
      { num: '5.3', text: 'The Agent purchases the Goods from the vendor and takes possession of them on Amana\'s behalf.' },
      { num: '5.4', text: 'Amana and the Trader then enter into a Murabaha contract, setting out the cost price, Profit Margin, total repayment amount, and repayment schedule.' },
      { num: '5.5', text: 'Following the conclusion of the Murabaha contract, the Agent hands the Goods over to the Trader.' },
    ],
  },
  {
    id: 'pricing',
    number: '6',
    title: 'Pricing and Payment Terms',
    clauses: [
      { num: '6.1', text: 'The cost price, Profit Margin, and total repayment amount will be disclosed to the Trader before the Murabaha contract is signed.' },
      { num: '6.2', text: 'The Trader agrees to repay Amana the full amount due under the Murabaha contract, in accordance with the agreed repayment schedule.' },
      { num: '6.3', text: 'Late payment may attract administrative charges, as separately disclosed to the Trader, consistent with Sharia principles governing late payment by a solvent debtor.' },
    ],
  },
  {
    id: 'ownership',
    number: '7',
    title: 'Ownership and Risk',
    clauses: [
      { num: '7.1', text: 'Amana owns the Goods from the point of purchase by the Agent until the Murabaha contract is concluded and the Goods are handed to the Trader.' },
      { num: '7.2', text: 'Ownership and risk in the Goods pass to the Trader upon delivery, following conclusion of the Murabaha contract.' },
      { num: '7.3', text: 'Once the Goods have passed to the Trader, the Trader is responsible for their safekeeping and use, and for any loss or damage, subject to clause 9 below.' },
    ],
  },
  {
    id: 'obligations',
    number: '8',
    title: 'Trader Obligations',
    clauses: [
      { num: '8.1', text: 'The Trader agrees to use the Goods for the purpose disclosed to Amana at the time of application.' },
      { num: '8.2', text: 'The Trader agrees to make all repayments in full and on time, in accordance with the Murabaha contract.' },
      { num: '8.3', text: 'The Trader agrees to notify Amana promptly of any circumstances that may affect their ability to repay.' },
      { num: '8.4', text: 'The Trader agrees to cooperate with Amana or its Agent in the event of a repayment dispute or default.' },
    ],
  },
  {
    id: 'default',
    number: '9',
    title: 'Default and Recovery',
    clauses: [
      { num: '9.1', text: 'If a Trader fails to make a payment when due, Amana will first attempt to recover the outstanding amount through reasonable means, including reminders, direct engagement with the Trader, and, where appropriate, restructuring of the repayment schedule.' },
      { num: '9.2', text: 'If, despite these efforts, the Trader refuses or continues to fail to pay the outstanding amount, the Trader agrees that Amana or its authorized Agent may recover the Goods financed under the Murabaha contract, or an amount equivalent to their value, in settlement of the outstanding debt.' },
      { num: '9.3', text: 'Any recovery of Goods or their equivalent value under this clause will be carried out in a lawful and reasonable manner.' },
      { num: '9.4', text: 'Where the value of Goods or funds recovered exceeds the amount owed by the Trader, Amana will return the surplus to the Trader.' },
      { num: '9.5', text: 'Where the value recovered is less than the amount owed, the Trader remains liable to Amana for the outstanding balance.' },
      { num: '9.6', text: 'By accepting these Terms, the Trader acknowledges and agrees to this recovery process as a condition of receiving financing from Amana.' },
    ],
  },
  {
    id: 'sharia',
    number: '10',
    title: 'Sharia Compliance',
    clauses: [
      { num: '10.1', text: 'Amana structures its financing model to comply with Sharia principles governing Murabaha transactions.' },
      { num: '10.2', text: 'Amana\'s Murabaha structure has been reviewed for Sharia compliance by an independent scholar.' },
    ],
  },
  {
    id: 'liability',
    number: '11',
    title: 'Limitation of Liability',
    clauses: [
      { num: '11.1', text: 'Amana will exercise reasonable care in appointing Agents and executing purchases on behalf of Traders.' },
      { num: '11.2', text: 'Amana will not be liable for delays or losses arising from circumstances beyond its reasonable control, including delays caused by vendors or Agents.' },
      { num: '11.3', text: 'Nothing in these Terms limits any liability that cannot be excluded under applicable law.' },
    ],
  },
  {
    id: 'data',
    number: '12',
    title: 'Data Protection',
    clauses: [
      { num: '12.1', text: 'Amana collects and processes personal information provided by Traders in accordance with applicable data protection law.' },
      { num: '12.2', text: 'Information provided by a Trader will be used solely to assess eligibility, administer financing, and communicate with the Trader.' },
    ],
  },
  {
    id: 'termination',
    number: '13',
    title: 'Termination',
    clauses: [
      { num: '13.1', text: 'Amana may suspend or terminate a Trader\'s access to its services if the Trader breaches these Terms.' },
      { num: '13.2', text: 'Termination does not affect any repayment obligations already due under an existing Murabaha contract.' },
    ],
  },
  {
    id: 'amendments',
    number: '14',
    title: 'Amendments',
    clauses: [
      { num: '14.1', text: 'Amana may update these Terms from time to time. Updated Terms will be published on our website, and continued use of our services after publication constitutes acceptance of the updated Terms.' },
    ],
  },
  {
    id: 'governing-law',
    number: '15',
    title: 'Governing Law and Dispute Resolution',
    clauses: [
      { num: '15.1', text: 'These Terms are governed by the laws of the Federal Republic of Nigeria.' },
      { num: '15.2', text: 'Any dispute arising from these Terms will first be referred to good faith negotiation between the parties. If unresolved, the dispute will be submitted to the courts of Kano State, Nigeria.' },
    ],
  },
  {
    id: 'contact',
    number: '16',
    title: 'Company Details and Contact',
    clauses: [
      { num: '16.1', text: 'Amana is operated by [Registered Company Name], trading as AMANA, registered with the Corporate Affairs Commission under [CAC Registration Number].' },
      { num: '16.2', text: 'Registered address: [Registered Address].' },
      { num: '16.3', text: 'For questions about these Terms, contact us at [Email Address] or [Phone Number].' },
    ],
  },
];

const TermsAndConditions = () => {

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
    <div className="terms-page">
      <div className="terms-container">

        {/* Hero */}
        <div className="terms-hero">
          <div className="terms-badge">
            <span className="terms-badge-dot" />
            Legal Document
          </div>
          <h1>Terms &amp; Conditions</h1>
          <p className="terms-hero-description">
            Please read these terms carefully before using the Amana platform.
            They govern the relationship between Amana and all Traders who apply
            for or receive inventory financing through our services.
          </p>
          <div className="terms-meta">
            <span className="terms-meta-item">
              <span className="terms-meta-icon">📄</span>
              Draft Version
            </span>
            <span className="terms-meta-item">
              <span className="terms-meta-icon">📅</span>
              11 July 2026
            </span>
            <span className="terms-meta-item">
              <span className="terms-meta-icon">⚖️</span>
              Nigerian Law
            </span>
          </div>
        </div>

        {/* Draft Notice */}
        <div className="terms-draft-notice">
          <span className="terms-draft-notice-icon">⚠️</span>
          <div className="terms-draft-notice-text">
            <strong>Draft version</strong> — Prepared for legal review. Not for
            publication until approved by legal counsel. Draft date: 11 July 2026.
          </div>
        </div>

        {/* Table of Contents */}
        <div className="terms-toc">
          <div className="terms-toc-title">Table of Contents</div>
          <ul className="terms-toc-list">
            {termsData.map((section) => (
              <li key={section.id}>
                <button
                  className="terms-toc-item"
                  onClick={() => scrollToSection(section.id)}
                  type="button"
                >
                  <span className="terms-toc-number">{section.number}.</span>
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        <div className="terms-sections">
          {termsData.map((section) => (
            <div className="terms-section" key={section.id} id={section.id}>
              <div className="terms-section-card">
                <div className="terms-section-header">
                  <span className="terms-section-number">{section.number}</span>
                  <h2 className="terms-section-title">{section.title}</h2>
                </div>
                <div className="terms-clauses">
                  {section.clauses.map((clause) => {
                    // Highlight defined terms with bold
                    const formattedText = section.isDefinition
                      ? highlightDefinition(clause.text)
                      : clause.text;

                    return (
                      <div
                        className={`terms-clause ${section.isDefinition ? 'terms-definition' : ''}`}
                        key={clause.num}
                      >
                        <span className="terms-clause-number">{clause.num}</span>
                        <span className="terms-clause-text">{formattedText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Acceptance Footer */}
        <div className="terms-acceptance">
          <div className="terms-acceptance-card">
            <div className="terms-acceptance-icon">🤝</div>
            <p>
              By accessing this website, applying for financing, or accepting Goods
              from Amana, you confirm your <strong>acceptance of these Terms and
              Conditions</strong> in full.
            </p>
          </div>
        </div>

        {/* Back to Top */}
        <div className="terms-back-to-top">
          <button onClick={scrollToTop} type="button">
            ↑ Back to Top
          </button>
        </div>

      </div>
    </div>
  );
};

/**
 * Highlights the defined term (text between quotes) in bold.
 * e.g., `"Agent" means ...` -> <strong>"Agent"</strong> means ...
 */
function highlightDefinition(text) {
  const match = text.match(/^(".*?")\s/);
  if (match) {
    return (
      <>
        <strong>{match[1]}</strong>
        {text.slice(match[1].length)}
      </>
    );
  }
  return text;
}

export default TermsAndConditions;
