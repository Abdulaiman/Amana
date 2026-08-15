import React from 'react';
import './TermsAndConditions.css';

export const termsData = [
  {
    id: 'introduction',
    number: '1',
    title: 'Introduction and Acceptance',
    clauses: [
      { num: '1.1', text: 'These Terms and Conditions (the "Terms") govern the relationship between Amana, trading as AMANA ("Amana", "we", "us", or "our"), and any individual or business ("Trader", "you", or "your") who applies for or receives inventory financing through our platform.' },
      { num: '1.2', text: 'By accessing our website, submitting an application, or accepting financing from Amana, you confirm that you have read, understood, and agree to be bound by these Terms.' },
      { num: '1.3', text: 'If you do not agree to these Terms, you should not use our services.' },
      { num: '1.4', text: 'These Terms are supplemented by, and should be read together with, the Murabaha Agreement, Agency Agreement, Security Agreement, and Privacy Policy entered into between Amana and the Trader for each transaction. Where there is a direct conflict between these Terms and a signed Murabaha Agreement for a specific transaction, the Murabaha Agreement prevails for that transaction.' },
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
      { num: '2.6', text: '"Business Day" means any day other than a Saturday, Sunday, or public holiday in Nigeria, on which banks are generally open for business in Kano State.' },
      { num: '2.7', text: '"Market Agent" means the Amana representative assigned to a Trader within their market, who serves as the Trader\'s first point of contact for day-to-day support, dispute handling, and default engagement.' },
      { num: '2.8', text: '"Market Union" means the recognized trade association, market union, or leadership body operating within the market where a Trader conducts business, where one exists and is engaged by the parties for mediation purposes.' },
      { num: '2.9', text: '"Security Agreement" means the separate agreement, referenced in clause 11, under which a Trader grants Amana a security interest over the Goods (and their proceeds) as continuing collateral for amounts owed under a Murabaha contract.' },
      { num: '2.10', text: '"Confidential Information" means any non-public business, technical, financial, or personal information disclosed by one party to the other in connection with these Terms.' },
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
      { num: '3.4', text: 'Amana only finances Goods intended for resale by the Trader in the ordinary course of their trading business. Amana does not finance the purchase of equipment, vehicles, or other assets intended for use in the Trader\'s business rather than resale.' },
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
      { num: '6.3', text: 'Late payment may attract administrative charges, as separately disclosed to the Trader, consistent with Sharia principles governing late payment by a solvent debtor. Amana will not retain any such late payment charges as income; they will instead be directed to charitable purposes, in accordance with Sharia guidance on late payment by a solvent debtor.' },
      { num: '6.4', text: 'Where a Trader makes a partial payment, it will be applied first to any outstanding administrative charges owed, and thereafter to the principal amount owed under the Murabaha contract.' },
      { num: '6.5', text: 'Early repayment by a Trader does not reduce the Profit Margin or the total repayment amount owed under the Murabaha contract. A Trader with a good record of early or on-time repayment may become eligible for an increased financing limit on future Murabaha contracts, at Amana\'s discretion.' },
    ],
  },
  {
    id: 'ownership',
    number: '7',
    title: 'Ownership and Risk',
    clauses: [
      { num: '7.1', text: 'Amana owns the Goods from the point of purchase by the Agent until the Murabaha contract is concluded and the Goods are handed to the Trader.' },
      { num: '7.2', text: 'Ownership and risk in the Goods pass to the Trader upon delivery, following conclusion of the Murabaha contract.' },
      { num: '7.3', text: 'Once the Goods have passed to the Trader, the Trader is responsible for their safekeeping and use, and for any loss or damage, subject to clause 10 (Default and Recovery).' },
      { num: '7.4', text: 'Clause 7.2 is subject to the security interest granted by the Trader to Amana under clause 11 (Security Interest), which survives the transfer of ownership.' },
      { num: '7.5', text: 'Amana bears the risk of any loss, damage, or spoilage of the Goods for as long as they remain in the possession of Amana or its Agent, prior to delivery to the Trader. Provided the Goods were not spoiled, damaged, or lost while in Amana\'s or the Agent\'s possession, risk passes to the Trader on delivery in accordance with clause 7.2.' },
      { num: '7.6', text: 'Amana bears the risk of any failure by an Agent to purchase or deliver the Goods, including where that failure results from Agent default, negligence, or fraud. Where Goods financed under a Murabaha contract are not delivered to the Trader as a result of such a failure, the Trader has no obligation to repay any amount in respect of those Goods, and any amount already paid by the Trader in respect of them will be refunded.' },
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
      { num: '8.4', text: 'The Trader agrees to cooperate with Amana, its Agent, and where applicable the Trader\'s Market Union, in the event of a repayment dispute or default.' },
      { num: '8.5', text: 'The Trader agrees not to sell, transfer, pledge, sub-finance, or otherwise dispose of the Goods, other than in the ordinary course of resale to the Trader\'s own customers, without Amana\'s prior written consent, for as long as any amount remains outstanding under the Murabaha contract.' },
    ],
  },
  {
    id: 'events-of-default',
    number: '9',
    title: 'Events of Default',
    clauses: [
      { num: '9.1', text: 'Each of the following constitutes an event of default under a Murabaha contract: failure by the Trader to make any payment when due under the repayment schedule; use of the Goods for a purpose materially different from that disclosed to Amana at application; provision of false, misleading, or incomplete information at application or at any point during the financing relationship; the Trader becoming insolvent, ceasing to trade, or otherwise being unable to pay debts as they fall due; unauthorized sale, transfer, pledge, or disposal of the Goods in breach of clause 8.5; any act of fraud, dishonesty, or attempted fraud by the Trader in connection with the financing; breach of any other material obligation owed to Amana under these Terms, the Murabaha contract, or the Security Agreement, which is not remedied within a reasonable period after notice.' },
      { num: '9.2', text: 'On the occurrence of an event of default, Amana may take the steps described in clause 10 (Default and Recovery), in addition to any other remedy available under the Security Agreement or applicable law.' },
    ],
  },
  {
    id: 'default',
    number: '10',
    title: 'Default and Recovery',
    clauses: [
      { num: '10.1', text: 'If a Trader fails to make a payment when due, or another event of default occurs, Amana\'s Market Agent will engage the Trader directly, through reminders, discussion, and, where appropriate, restructuring of the repayment schedule. Given that Amana\'s Murabaha contracts are typically short-term (1-2 weeks), this direct engagement will ordinarily begin within 2 Business Days of the missed payment and continue for up to a further 5 Business Days.' },
      { num: '10.2', text: 'If direct engagement does not resolve the default within the period in clause 10.1, Amana or the Market Agent may refer the matter to the Trader\'s Market Union for mediation, with a view to reaching an agreed repayment or settlement plan. Mediation will ordinarily be completed within 5 Business Days of referral.' },
      { num: '10.3', text: 'Any disclosure of a Trader\'s default or repayment information to a Market Union for the purposes of mediation under clause 10.2 will be limited to what is reasonably necessary for that mediation. By accepting these Terms, the Trader acknowledges and consents to this limited disclosure.' },
      { num: '10.4', text: 'What is owed by a defaulting Trader, and what Amana is recovering, is the outstanding monetary amount due under the Murabaha contract, not the Goods themselves. The Goods (and the security interest over them under clause 11) are collateral that may be realized to satisfy that monetary debt; they are not an alternative form of payment that the Trader may substitute for the amount owed. Since the Trader identifies and requests the Goods, and in many cases specifies the purchase amount, the Trader bears the risk of any fall in the value or resale price of the Goods, and surrendering or losing the Goods does not, by itself, discharge or reduce the Trader\'s debt to Amana.' },
      { num: '10.5', text: 'If mediation does not resolve the default within the period in clause 10.2, or the Market Union declines or is unable to mediate, Amana may pursue recovery through lawful civil means, including civil claim before a competent court, engagement of a licensed recovery agent acting within the law, or enforcement of the security interest described in clause 11, in each case without resort to self-help repossession or seizure of the Goods without the Trader\'s consent or lawful authority.' },
      { num: '10.6', text: 'Amana will not report, or threaten to report, a Trader\'s non-payment as a criminal matter to the police, and will not request or use police involvement to pressure or coerce repayment of amounts owed under a Murabaha contract.' },
      { num: '10.7', text: 'Where the Goods or their proceeds are realized as part of recovery and their value exceeds the amount owed by the Trader (including any recovery costs), Amana will return the surplus to the Trader. Where the value realized is less than the amount owed, the Trader remains liable to Amana for the outstanding balance in full, and Amana may continue to pursue recovery of that balance through any lawful means.' },
      { num: '10.8', text: 'By accepting these Terms, the Trader acknowledges and agrees to the recovery process described in this clause 10 as a condition of receiving financing from Amana.' },
    ],
  },
  {
    id: 'security-interest',
    number: '11',
    title: 'Security Interest',
    clauses: [
      { num: '11.1', text: 'Because ownership and risk in the Goods pass to the Trader on completion of the Murabaha contract (clause 7.2), Amana does not retain title to the Goods after that point. Instead, the Trader grants Amana a continuing security interest over the Goods, and over any proceeds from their resale, as collateral for the amounts owed under the Murabaha contract until fully repaid.' },
      { num: '11.2', text: 'The terms of this security interest, including its registration (where applicable), scope, and the process for its enforcement, will be set out in a separate Security Agreement executed by the Trader alongside the Murabaha contract.' },
      { num: '11.3', text: 'Enforcement of the security interest will follow the lawful recovery process in clause 10, and will not involve self-help seizure of the Goods.' },
    ],
  },
  {
    id: 'warranties',
    number: '12',
    title: 'Warranties and Disclaimers Regarding Goods',
    clauses: [
      { num: '12.1', text: 'Amana warrants that it will transfer good title to the Goods to the Trader on completion of the Murabaha contract, free of any encumbrance other than the security interest described in clause 11.' },
      { num: '12.2', text: 'Because the Trader deals with Amana, and not directly with the original vendor or manufacturer of the Goods, Amana will pass through to the Trader the benefit of any warranty, guarantee, or claim available from the vendor or manufacturer regarding the quality, condition, or fitness of the Goods, to the extent such a warranty exists and is capable of being passed through.' },
      { num: '12.3', text: 'Where a defect or quality issue arises with the Goods after delivery, Amana will provide reasonable assistance to the Trader in pursuing a claim against the relevant vendor or manufacturer, but Amana does not itself independently warrant the quality, fitness for purpose, or condition of the Goods beyond what was reasonably apparent at the point of purchase by the Agent.' },
      { num: '12.4', text: 'The Trader is responsible for reasonably inspecting the Goods, whether personally or through the Agent, before the Murabaha contract is concluded, and should raise any visible defect before accepting delivery.' },
      { num: '12.5', text: 'Nothing in this clause excludes or limits any warranty or protection that cannot lawfully be excluded.' },
    ],
  },
  {
    id: 'force-majeure',
    number: '13',
    title: 'Force Majeure',
    clauses: [
      { num: '13.1', text: 'Neither party will be liable for any failure or delay in performing its obligations under these Terms to the extent that such failure or delay is caused by an event beyond that party\'s reasonable control, which the party could not reasonably have foreseen or avoided (a "Force Majeure Event"), including but not limited to natural disaster, fire, flood, war, civil unrest, government action or regulation, epidemic, or widespread failure of public infrastructure or telecommunications.' },
      { num: '13.2', text: 'For the avoidance of doubt, a Force Majeure Event does not include a Trader\'s ordinary business downturn, poor sales performance, personal financial difficulty, change in market demand, or other risks ordinarily associated with trading, none of which excuse a Trader from repayment.' },
      { num: '13.3', text: 'A party seeking to rely on a Force Majeure Event must notify the other party in writing within two (2) Business Days of the event arising, describing the event and its expected impact, and must provide reasonable supporting evidence on request. Amana may reject a claimed Force Majeure Event that is not adequately evidenced or that falls within clause 13.2.' },
      { num: '13.4', text: 'A valid Force Majeure Event suspends only the specific obligation directly and demonstrably prevented by the event, and only for so long as the event continues. It does not cancel, reduce, or discharge any amount owed under a Murabaha contract; the repayment schedule resumes, extended by a period equivalent to the duration of the event, once the event ends.' },
      { num: '13.5', text: 'Given that Amana\'s Murabaha contracts are typically short-term (1-2 weeks), if a Force Majeure Event affecting a Trader\'s obligations continues for more than seven (7) consecutive days, Amana may, at its discretion, either continue to extend the repayment schedule or treat the matter under clause 10 (Default and Recovery).' },
    ],
  },
  {
    id: 'intellectual-property',
    number: '14',
    title: 'Intellectual Property',
    clauses: [
      { num: '14.1', text: 'All intellectual property in the Amana name, brand, logo, platform, application, website, and related content and materials ("Amana IP") is owned by Amana or its licensors.' },
      { num: '14.2', text: 'Amana grants the Trader a limited, non-exclusive, non-transferable license to access and use the Amana IP solely for the purpose of applying for and managing financing through the platform.' },
      { num: '14.3', text: 'The Trader will not copy, reproduce, modify, reverse-engineer, or create derivative works from the Amana IP, or use it for any purpose other than as permitted under clause 14.2.' },
      { num: '14.4', text: 'This clause survives termination of the relationship between Amana and the Trader.' },
    ],
  },
  {
    id: 'sharia',
    number: '15',
    title: 'Sharia Compliance',
    clauses: [
      { num: '15.1', text: 'Amana structures its financing model to comply with Sharia principles governing Murabaha transactions.' },
      { num: '15.2', text: 'Amana\'s Murabaha structure has been reviewed for Sharia compliance by an independent scholar.' },
    ],
  },
  {
    id: 'liability',
    number: '16',
    title: 'Limitation of Liability',
    clauses: [
      { num: '16.1', text: 'Amana will exercise reasonable care in appointing Agents and executing purchases on behalf of Traders.' },
      { num: '16.2', text: 'Amana will not be liable for delays or losses arising from circumstances beyond its reasonable control, including delays caused by vendors or Agents, except as expressly provided in clause 7.6 (which governs a Trader\'s repayment obligation where Goods are not delivered due to Agent failure).' },
      { num: '16.3', text: 'Nothing in these Terms limits any liability that cannot be excluded under applicable law.' },
    ],
  },
  {
    id: 'data',
    number: '17',
    title: 'Data Protection',
    clauses: [
      { num: '17.1', text: 'Amana collects and processes personal information provided by Traders in accordance with applicable data protection law, including the Nigeria Data Protection Act 2023 where applicable.' },
      { num: '17.2', text: 'Information provided by a Trader will be used solely to assess eligibility, administer financing, and communicate with the Trader, and will be retained only for as long as reasonably necessary for those purposes.' },
      { num: '17.3', text: 'Subject to applicable law, a Trader may request access to, correction of, or deletion of their personal information held by Amana, by contacting Amana as set out in clause 22.' },
      { num: '17.4', text: 'Where necessary for default recovery under clause 10, Amana may share limited repayment information with a Trader\'s Market Agent or Market Union, as described in clause 10.3.' },
    ],
  },
  {
    id: 'kyc',
    number: '18',
    title: 'Anti-Fraud and Know Your Customer (KYC)',
    clauses: [
      { num: '18.1', text: 'Amana requires proof of identity and may request additional documentation to verify a Trader\'s identity and business activity before approving financing.' },
      { num: '18.2', text: 'Amana may use third-party services to verify information provided by a Trader.' },
      { num: '18.3', text: 'Providing false or misleading information, or attempting to circumvent Amana\'s identity verification process, constitutes fraud, is an event of default under clause 9, and may be reported to the relevant authorities and result in immediate termination of services.' },
    ],
  },
  {
    id: 'complaints',
    number: '19',
    title: 'Complaints Procedure',
    clauses: [
      { num: '19.1', text: 'A Trader with a complaint or concern regarding their financing, the Goods, or Amana\'s services may raise it directly with their assigned Market Agent, or by contacting Amana at the email address in clause 22.' },
      { num: '19.2', text: 'Given the short-term nature of Amana\'s financing, Amana will acknowledge a complaint within 2 Business Days and aim to resolve it through direct engagement within a further 7 Business Days.' },
      { num: '19.3', text: 'If a complaint cannot be resolved through the Market Agent or direct engagement, it will be handled in accordance with clause 29 (Governing Law and Dispute Resolution).' },
    ],
  },
  {
    id: 'consumer-status',
    number: '20',
    title: 'Consumer Status',
    clauses: [
      { num: '20.1', text: 'Traders obtain Goods through Amana for resale in their trading business, and not for personal, household, or domestic consumption. These Terms accordingly constitute a business-to-business commercial arrangement between Amana and the Trader.' },
    ],
  },
  {
    id: 'termination',
    number: '21',
    title: 'Termination',
    clauses: [
      { num: '21.1', text: 'Amana may suspend or terminate a Trader\'s access to its services if the Trader breaches these Terms.' },
      { num: '21.2', text: 'Termination does not affect any repayment obligations already due under an existing Murabaha contract.' },
    ],
  },
  {
    id: 'notices',
    number: '22',
    title: 'Notices',
    clauses: [
      { num: '22.1', text: 'Any notice required under these Terms must be given in writing and delivered by email, or through the Amana platform, to the contact details provided by the relevant party.' },
      { num: '22.2', text: 'A notice is deemed received on the Business Day it is sent, if sent before 5:00pm on a Business Day, and otherwise on the next Business Day.' },
    ],
  },
  {
    id: 'severability',
    number: '23',
    title: 'Severability',
    clauses: [
      { num: '23.1', text: 'If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect, and the invalid or unenforceable provision will be replaced with a valid provision that most closely reflects the original intent.' },
    ],
  },
  {
    id: 'waiver',
    number: '24',
    title: 'Waiver',
    clauses: [
      { num: '24.1', text: 'A failure or delay by either party to exercise any right under these Terms does not operate as a waiver of that right, and a single or partial exercise of any right does not prevent any further exercise of that or any other right.' },
    ],
  },
  {
    id: 'entire-agreement',
    number: '25',
    title: 'Entire Agreement',
    clauses: [
      { num: '25.1', text: 'These Terms, together with the Murabaha Agreement, Agency Agreement, Security Agreement, and Privacy Policy applicable to a transaction, constitute the entire agreement between Amana and the Trader in relation to their subject matter, and supersede all prior discussions, representations, or agreements on that subject matter.' },
    ],
  },
  {
    id: 'assignment',
    number: '26',
    title: 'Assignment',
    clauses: [
      { num: '26.1', text: 'Amana may assign or transfer its rights and obligations under these Terms, including amounts owed by a Trader, to a third party, provided the Trader\'s obligations are not materially increased as a result.' },
      { num: '26.2', text: 'A Trader may not assign or transfer any rights or obligations under these Terms without Amana\'s prior written consent.' },
    ],
  },
  {
    id: 'electronic-signature',
    number: '27',
    title: 'Electronic Signature and Communications',
    clauses: [
      { num: '27.1', text: 'The Trader agrees that Amana may rely on electronic signatures, electronic acceptance (including in-app confirmation), and electronic communications as valid and binding, to the same extent as physical signatures and paper communications, to the extent permitted by applicable law.' },
    ],
  },
  {
    id: 'amendments',
    number: '28',
    title: 'Amendments',
    clauses: [
      { num: '28.1', text: 'Amana may update these Terms from time to time. Updated Terms will be published on our website, and continued use of our services after publication constitutes acceptance of the updated Terms.' },
      { num: '28.2', text: 'Amendments to these Terms will apply prospectively and will not vary the terms of a Murabaha contract already concluded with a Trader, unless the Trader separately agrees to the variation.' },
    ],
  },
  {
    id: 'governing-law',
    number: '29',
    title: 'Governing Law and Dispute Resolution',
    clauses: [
      { num: '29.1', text: 'These Terms are governed by the laws of the Federal Republic of Nigeria.' },
      { num: '29.2', text: 'Any dispute arising from these Terms will first be referred to good faith negotiation between the parties, which for a Trader dispute may include mediation through the Trader\'s Market Union in accordance with clause 10. If unresolved, the dispute will be submitted to a court of competent jurisdiction in Nigeria.' },
      { num: '29.3', text: 'As a faster and less costly alternative to court proceedings, either party may propose that a dispute be resolved by a single arbitrator under the Arbitration and Mediation Act 2023. Arbitration under this clause will only proceed where both parties agree to it for that dispute; if either party does not agree, the dispute will proceed under clause 29.2.' },
    ],
  },
  {
    id: 'contact',
    number: '30',
    title: 'Company Details and Contact',
    clauses: [
      { num: '30.1', text: 'Amana is operated by Amana Technologies Ltd, trading as AMANA, registered with the Corporate Affairs Commission under RC 9696997.' },
      { num: '30.2', text: 'Registered address: 131, Fegi, Doka, Kano State, Nigeria.' },
      { num: '30.3', text: 'For questions about these Terms, contact us at service.amanafinance@gmail.com or 08032532333, or reach out to your assigned Market Agent.' },
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
              Revision 4
            </span>
            <span className="terms-meta-item">
              <span className="terms-meta-icon">📅</span>
              25 July 2026
            </span>
            <span className="terms-meta-item">
              <span className="terms-meta-icon">⚖️</span>
              Nigerian Law
            </span>
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
