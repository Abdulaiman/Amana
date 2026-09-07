/**
 * Legal Contract Templates for Amana Technologies Ltd
 * Registered under CAC RC 9696997 | 131, Fegi, Doka, Kano State, Nigeria
 * 
 * Provides dynamic contract text generators tailored to each transaction
 * complying with Sharia Murabaha requirements and Nigerian Commercial Law.
 */

export const AMANA_CORPORATE_INFO = {
  legalName: 'Amana Technologies Ltd',
  tradingAs: 'AMANA',
  rcNumber: 'RC 9696997',
  address: '131, Fegi, Doka, Kano State, Nigeria',
  jurisdiction: 'Kano State, Federal Republic of Nigeria',
  shariaPrinciple: 'Murabaha (Cost-Plus Sale) with Wa\'d Mulzim (Binding Undertaking)'
};

/**
 * Formats currency in Nigerian Naira
 */
export const formatNaira = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '₦0.00';
  return `₦${Number(val).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Generate Deed of Undertaking (Wa'd)
 * Executed BEFORE Amana acquires the goods.
 */
export const generateDeedOfUndertaking = (tx = {}) => {
  const traderName = tx.retailer?.name || tx.retailerName || tx.traderName || 'Registered Trader';
  const traderPhone = tx.retailer?.phone || tx.traderPhone || '';
  const traderBusiness = tx.retailer?.businessInfo?.name || tx.businessName || 'Trading Enterprise';
  const agentName = tx.agent?.name || tx.agentName || 'Amana Assigned Market Agent';
  const agentMarket = tx.agent?.market || tx.agentMarket || 'Designated Market, Kano State';
  const goodsName = tx.productName || tx.traderRequestNote || 'Wholesale Stock / Inventory';
  const goodsDescription = tx.productDescription || tx.traderRequestNote || 'Specified retail stock as surveyed and verified by Agent';
  const estimatedCost = tx.purchasePrice || tx.itemsPrice || 0;
  const refCode = tx._id || tx.id ? `AMN-${String(tx._id || tx.id).slice(-8).toUpperCase()}` : 'AMN-REF';
  const signedUndertakingAt = tx.undertakingSignedAt || tx.retailerConfirmedAt;
  const dateStr = signedUndertakingAt 
    ? new Date(signedUndertakingAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return {
    title: "DEED OF UNDERTAKING (WA'D)",
    subtitle: "Unilateral Binding Undertaking Prior to Goods Acquisition",
    refCode,
    dateStr,
    isSigned: Boolean(tx.undertakingSigned || tx.retailerConfirmedAt),
    signedAt: signedUndertakingAt,
    summary: {
      parties: `${AMANA_CORPORATE_INFO.legalName} & ${traderName}`,
      goods: goodsName,
      agent: `${agentName} (${agentMarket})`,
      estimatedCost: formatNaira(estimatedCost),
      securityDeposit: '₦0.00 (Waived / Hamish Jiddiyyah Not Required)',
      withdrawalRight: 'Free withdrawal without liability prior to purchase approval (Clause 4.1)',
      natureOfCommitment: "Wa'd Mulzim (Binding unilateral undertaking to enter Murabaha upon Amana taking possession)"
    },
    clauses: [
      {
        number: '1',
        title: 'Parties',
        subclauses: [
          `1.1 This Deed of Undertaking ("Undertaking") is entered into between ${AMANA_CORPORATE_INFO.legalName}, trading as ${AMANA_CORPORATE_INFO.tradingAs} ("Amana"), registered with the Corporate Affairs Commission under ${AMANA_CORPORATE_INFO.rcNumber}, of ${AMANA_CORPORATE_INFO.address}, and ${traderName} (operating as ${traderBusiness}, Phone: ${traderPhone || 'N/A'}), named in related Purchase Request ${refCode} ("Trader", "you", "your").`
        ]
      },
      {
        number: '2',
        title: 'Definitions',
        subclauses: [
          `2.1 "Agent" means ${agentName}, appointed by Amana as an Internal Agent or Agent-Trader operating on the Amana platform, to purchase and take possession of Goods on Amana's behalf.`,
          `2.2 "Goods" means the inventory or stock (${goodsName}: ${goodsDescription}) that Amana purchases, through its Agent, for onward sale to the Trader.`,
          `2.3 "Murabaha Contract" means the Sharia-compliant sale contract under which Amana sells the Goods to the Trader at a disclosed cost price plus an agreed Profit Margin, repayable over an agreed period.`,
          `2.4 "Business Day" means any day other than a Saturday, Sunday, or public holiday in Nigeria, on which banks are generally open for business in Kano State.`,
          `2.5 "Market Agent" means ${agentName}, the Amana representative assigned to the Trader within ${agentMarket}, who is the Trader's first point of contact for day-to-day support, dispute handling, and default engagement.`,
          `2.6 "Market Union" means the recognized trade association, market union, or leadership body operating within the market where the Trader conducts business, where one exists and is engaged for mediation purposes.`,
          `2.7 "Force Majeure Event" means an event beyond a party's reasonable control which that party could not reasonably have foreseen or avoided, including natural disaster, fire, flood, war, civil unrest, government action or regulation, epidemic, or widespread failure of public infrastructure or telecommunications. It does not include a Trader's ordinary business downturn, poor sales performance, personal financial difficulty, or other risks ordinarily associated with trading.`
        ]
      },
      {
        number: '3',
        title: "The Trader's Undertaking (Wa'd)",
        subclauses: [
          `3.1 By agreeing to this Undertaking, you give Amana a unilateral and binding undertaking (wa'd mulzim) to enter into a Murabaha Contract with Amana for the Goods (${goodsName}), once Amana has purchased and taken possession of those Goods through its Agent (${agentName}).`,
          `3.2 Amana is not obliged to proceed with the transaction and retains full discretion to accept, decline, or withdraw at any time before purchase.`,
          `3.3 This Undertaking does not itself constitute a sale. No ownership in the Goods passes to you under this Undertaking. Ownership passes to you only on conclusion of, and delivery under, the Murabaha Contract.`
        ]
      },
      {
        number: '4',
        title: 'Withdrawal Before Amana Purchases',
        subclauses: [
          `4.1 You may withdraw this Undertaking at any time before Amana approves the purchase, without liability.`,
          `4.2 Once Amana has approved the purchase in reliance on this Undertaking, you may withdraw only for a Valid Excuse under clause 7. Any other withdrawal, or any failure or refusal to complete the Murabaha Contract, after that point is a breach of this Undertaking governed by clause 6.`
        ]
      },
      {
        number: '5',
        title: "Security for the Trader's Undertaking",
        subclauses: [
          `5.1 Amana does not require a Security Deposit (hamish jiddiyyah) from you as security for this Undertaking.`,
          `5.2 Instead, Amana relies on the following measures to secure your performance of this Undertaking: (a) your financing limit, which Amana may reduce or revoke; (b) your account, which Amana may suspend or freeze; and (c) your eligibility for future financing, which Amana may suspend.`,
          `5.3 These measures are available to Amana only after Amana has approved and completed the purchase of the Goods in reliance on this Undertaking. Before Amana purchases the Goods, no security measures apply and no liability attaches to you.`
        ]
      },
      {
        number: '6',
        title: 'Breach of the Undertaking',
        subclauses: [
          `6.1 If, after Amana has approved and completed the purchase of the Goods in reliance on this Undertaking, you fail or refuse, without a Valid Excuse, to enter into and complete the Murabaha Contract for the Goods, you are in breach of this Undertaking and Amana may take the actions described in clause 5.2.`,
          `6.2 Amana may also take the actions described in clause 5.2 where, in connection with this Undertaking, you provide false, misleading, or incomplete information, use or intend to use the Goods for a purpose materially different from that disclosed to Amana, become insolvent or otherwise unable to meet your obligations, or commit or attempt any act of fraud or dishonesty.`,
          `6.3 Where Amana takes action under clause 6.1 or 6.2 and seeks to recover any amount already advanced or committed in reliance on this Undertaking, Amana will follow this process: (a) Amana's Market Agent will engage you directly, through reminders, discussion, and, where appropriate, restructuring, ordinarily beginning within 2 Business Days and continuing for up to a further 5 Business Days; (b) if that does not resolve the matter, Amana or the Market Agent may refer it to your Market Union for mediation, ordinarily completed within 5 Business Days of referral, and you consent to Amana sharing with the Market Union the limited information reasonably necessary for that mediation; (c) if mediation does not resolve the matter, or the Market Union declines or is unable to mediate, Amana may pursue recovery through any lawful means it considers appropriate in the circumstances, including a civil claim before a competent court, engagement of a licensed recovery agent, enforcement of any applicable security, and, where the conduct involves fraud or other criminal wrongdoing, referral to the relevant authorities, in each case without self-help repossession or seizure of the Goods without your consent or lawful authority.`
        ]
      },
      {
        number: '7',
        title: 'Valid Excuse',
        subclauses: [
          `7.1 You have a Valid Excuse to withdraw from this Undertaking, without liability under clause 6, where: (a) the Goods become unavailable from the vendor, or the vendor defaults, through no fault of yours; (b) a Force Majeure Event prevents you from proceeding; or (c) any other circumstance Amana accepts, in its discretion, as a valid excuse.`,
          `7.2 A Force Majeure Event relied upon under clause 7.1(b) must be notified to Amana in writing within 2 Business Days of it arising, describing the event and its expected impact, with reasonable supporting evidence on request. Amana may reject a claimed Force Majeure Event that is not adequately evidenced or that reflects an ordinary trading risk rather than a genuine Force Majeure Event.`,
          `7.3 Where you withdraw for a Valid Excuse, Amana bears the resulting cost of holding or disposing of the Goods as its own business risk. No adverse action under clause 5.2 will be taken against you.`
        ]
      },
      {
        number: '8',
        title: 'Goods Not Taken Up by the Trader',
        subclauses: [
          `8.1 Where this Undertaking ends without you completing the Murabaha Contract, whether for breach under clause 6 or a Valid Excuse under clause 7, Amana remains owner of the Goods and may sell them to another trader, return them to the vendor where possible, or otherwise deal with them as its own property.`,
          `8.2 Nothing in this clause obliges Amana to hold the Goods for your benefit or to offer them to you again.`
        ]
      },
      {
        number: '9',
        title: 'Relationship to Other Agreements',
        subclauses: [
          `9.1 This Undertaking is entered into before Amana purchases the Goods. A separate Agency Contract governs the Agent's appointment, duties, and liability.`,
          `9.2 The Murabaha Contract, when concluded, will supersede this Undertaking in respect of your obligation to purchase the specific Goods.`
        ]
      },
      {
        number: '10',
        title: 'Governing Law and Dispute Resolution',
        subclauses: [
          `10.1 This Undertaking is governed by the laws of the Federal Republic of Nigeria.`,
          `10.2 Any dispute arising from this Undertaking will first be referred to good faith negotiation. If unresolved, the dispute will be submitted to a court of competent jurisdiction in Nigeria, or, where both parties agree, to a single arbitrator under the Arbitration and Mediation Act 2023.`
        ]
      },
      {
        number: '11',
        title: 'Notices',
        subclauses: [
          `11.1 Any notice under this Undertaking must be given in writing and delivered by email or through the Amana platform, to the contact details provided by the relevant party.`,
          `11.2 A notice is deemed received on the Business Day it is sent, if sent before 5:00pm on a Business Day, and otherwise on the next Business Day.`
        ]
      },
      {
        number: '12',
        title: 'Acceptance',
        subclauses: [
          `12.1 By clicking "I Agree," or otherwise indicating acceptance through the Amana platform, you confirm your identity as authenticated by the platform (${traderName} / ${traderPhone || 'Authenticated Trader'}), and acknowledge that you have read, understood, and agree to be bound by this Deed of Undertaking in full. This action constitutes your valid and binding electronic signature and execution of this Deed of Undertaking, effective as of the date and time recorded by the platform, with the same legal effect as a handwritten signature. Amana's electronic record of your acceptance, including the date, time, and authenticated identity, is conclusive evidence of execution of this Deed of Undertaking.`
        ]
      }
    ]
  };
};

/**
 * Generate Murabaha Contract
 * Executed AFTER Amana acquires the goods through its agent.
 */
export const generateMurabahaContract = (tx = {}) => {
  const traderName = tx.retailer?.name || tx.retailerName || tx.traderName || 'Registered Trader';
  const traderPhone = tx.retailer?.phone || tx.traderPhone || '';
  const traderBusiness = tx.retailer?.businessInfo?.name || tx.businessName || 'Trading Enterprise';
  const agentName = tx.agent?.name || tx.agentName || 'Amana Appointed Agent';
  const agentMarket = tx.agent?.market || tx.agentMarket || 'Kano Market';
  const goodsName = tx.productName || tx.traderRequestNote || 'Wholesale Goods';
  const actualCost = tx.purchasePrice || tx.itemsPrice || 0;
  const markupPercentage = tx.markupPercentage || 0;
  const markupAmount = tx.markupAmount || (tx.totalRetailerCost && actualCost ? tx.totalRetailerCost - actualCost : 0);
  const totalPrice = tx.totalRetailerCost || tx.totalRepaymentAmount || (actualCost + markupAmount);
  const repaymentTerm = tx.repaymentTerm || 14;
  const dueDateStr = tx.dueDate 
    ? new Date(tx.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : `${repaymentTerm} days following physical handover and delivery confirmation`;
  const refCode = tx._id || tx.id ? `AMN-MUR-${String(tx._id || tx.id).slice(-8).toUpperCase()}` : 'AMN-MUR-REF';
  const signedMurabahaAt = tx.murabahaSignedAt || tx.murabahaAcceptedAt;
  const dateStr = signedMurabahaAt
    ? new Date(signedMurabahaAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const receivedTimestamp = tx.receivedAt || tx.goodsReceivedAt;
  const receivedDateStr = receivedTimestamp
    ? new Date(receivedTimestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  return {
    title: 'MURABAHA CONTRACT',
    subtitle: 'Cost-Plus Sharia Sale Contract with Deferred Repayment',
    refCode,
    dateStr,
    isSigned: Boolean(tx.murabahaSigned || tx.murabahaAcceptedAt),
    signedAt: signedMurabahaAt,
    isReceived: Boolean(receivedTimestamp),
    receivedAt: receivedTimestamp,
    receivedDateStr,
    schedule: {
      goods: goodsName,
      actualCost: formatNaira(actualCost),
      profitMargin: `${formatNaira(markupAmount)} (${markupPercentage}%)`,
      totalPrice: formatNaira(totalPrice),
      repaymentDate: dueDateStr,
      repaymentTerm: `${repaymentTerm} Days`,
      agent: `${agentName} (${agentMarket})`,
      ...(receivedDateStr ? { deliveryConfirmation: `Confirmed on ${receivedDateStr}` } : {})
    },
    clauses: [
      {
        number: '1',
        title: 'Parties',
        subclauses: [
          `1.1 This Murabaha Contract ("Contract") is entered into between ${AMANA_CORPORATE_INFO.legalName}, trading as ${AMANA_CORPORATE_INFO.tradingAs} ("Amana", "we", "us"), registered with the Corporate Affairs Commission under ${AMANA_CORPORATE_INFO.rcNumber}, of ${AMANA_CORPORATE_INFO.address}, and the Trader named in the Transaction Summary (${traderName}, operating as ${traderBusiness}, Phone: ${traderPhone || 'N/A'}) ("Trader", "you").`
        ]
      },
      {
        number: '2',
        title: 'Definitions',
        subclauses: [
          `2.1 "Agent" means ${agentName}, the party appointed by Amana, whether an Internal Agent employed directly by Amana or an Agent-Trader operating on the Amana platform, who purchased and took possession of the Goods on Amana's behalf.`,
          `2.2 "Goods" means the inventory or stock (${goodsName}) described in the Transaction Summary, purchased by Amana through its Agent for sale to you under this Contract.`,
          `2.3 "Transaction Summary" means the document or platform record setting out the Goods (${goodsName}), the Actual Cost Price (${formatNaira(actualCost)}), the Profit Margin (${formatNaira(markupAmount)} / ${markupPercentage}%), the Total Price (${formatNaira(totalPrice)}), and the Repayment Date (${dueDateStr}) for this specific transaction.`,
          `2.4 "Secured Property" means the Goods and any proceeds from their resale, together with any other inventory or trading goods you now own or later acquire in the ordinary course of your trading business, over which you grant Amana a security interest under clause 8.`,
          `2.5 "Business Day" means any day other than a Saturday, Sunday, or public holiday in Nigeria, on which banks are generally open for business in Kano State.`,
          `2.6 "Market Agent" means ${agentName}, the Amana representative assigned to you within ${agentMarket}, who is your first point of contact for day-to-day support, dispute handling, and default engagement.`,
          `2.7 "Market Union" means the recognized trade association, market union, or leadership body operating within the market where you conduct business, where one exists and is engaged for mediation purposes.`
        ]
      },
      {
        number: '3',
        title: 'The Sale',
        subclauses: [
          `3.1 Before this Contract is concluded, Amana, through its Agent (${agentName}), purchased the Goods (${goodsName}) described in the Transaction Summary from the vendor and took possession of them.`,
          `3.2 Amana discloses to you the Actual Cost Price it paid for the Goods, as stated in the Transaction Summary: ${formatNaira(actualCost)}.`,
          `3.3 Amana sells, and you buy, the Goods at the Total Price of ${formatNaira(totalPrice)}, being the Actual Cost Price plus the Profit Margin, payable in full by the Repayment Date stated in the Transaction Summary.`
        ]
      },
      {
        number: '4',
        title: 'Price and Payment',
        subclauses: [
          `4.1 The Actual Cost Price (${formatNaira(actualCost)}), Profit Margin (${formatNaira(markupAmount)} / ${markupPercentage}%), and Total Price (${formatNaira(totalPrice)}) are disclosed to you in the Transaction Summary before this Contract is concluded.`,
          `4.2 You agree to pay the Total Price (${formatNaira(totalPrice)}) to Amana in full by the Repayment Date (${dueDateStr}).`,
          `4.3 Late payment may attract administrative charges, as separately disclosed to you, consistent with Sharia principles governing late payment by a solvent debtor. Amana will not retain any such charges as income; they will instead be directed to charitable purposes.`,
          `4.4 Where you make a partial payment, it will be applied first to any outstanding administrative charges, and thereafter to the Total Price.`,
          `4.5 Early repayment does not reduce the Profit Margin or the Total Price.`
        ]
      },
      {
        number: '5',
        title: 'Delivery and Possession',
        subclauses: [
          `5.1 Following the conclusion of this Contract, the Agent will hand the Goods over to you.`,
          `5.2 You are responsible for inspecting the Goods before accepting delivery and should raise any visible defect at that time.`,
          `5.3 Delivery is complete when you confirm receipt through the Amana platform.`
        ]
      },
      {
        number: '6',
        title: 'Ownership and Risk',
        subclauses: [
          `6.1 Amana owned the Goods from the point of purchase by the Agent until this Contract was concluded.`,
          `6.2 Ownership and risk in the Goods passed to you upon conclusion of this Contract, subject to the security interest granted under clause 8.`,
          `6.3 Amana bore the risk of any loss, damage, or spoilage of the Goods for as long as they remained in the possession of Amana or its Agent prior to delivery. Amana also bears the risk of any failure by the Agent to purchase or deliver the Goods, including where that failure results from Agent default, negligence, or fraud; where Goods are not delivered to you as a result of such a failure, you have no obligation to pay the corresponding part of the Total Price, and any amount already paid in respect of those Goods will be refunded.`
        ]
      },
      {
        number: '7',
        title: 'Warranties Regarding the Goods',
        subclauses: [
          `7.1 Amana warrants that it transfers good title to the Goods to you, free of any encumbrance other than the security interest described in clause 8.`,
          `7.2 Amana will pass through to you the benefit of any warranty, guarantee, or claim available from the vendor or manufacturer of the Goods, to the extent it exists and is capable of being passed through.`,
          `7.3 Amana will provide reasonable assistance to you in pursuing a claim against the relevant vendor or manufacturer for a defect or quality issue arising after delivery.`
        ]
      },
      {
        number: '8',
        title: 'Security Interest',
        subclauses: [
          `8.1 You grant Amana a continuing security interest over the Secured Property as collateral for the Total Price until fully paid. This security interest is not limited to the Goods purchased under this Contract: it also extends to your other inventory or trading goods, whether now owned or later acquired, to the extent necessary to secure the Total Price.`,
          `8.2 Enforcement of the security interest will follow the recovery process in clause 10, and will not involve self-help seizure of the Goods or other Secured Property.`
        ]
      },
      {
        number: '9',
        title: 'Trader Obligations',
        subclauses: [
          `9.1 You agree to use the Goods for resale in the ordinary course of your trading business.`,
          `9.2 You agree to make all repayments in full and on time, in accordance with this Contract.`,
          `9.3 You agree to notify Amana promptly of any circumstances that may affect your ability to repay.`,
          `9.4 You agree to cooperate with Amana, its Agent, and where applicable your Market Union, in the event of a repayment dispute or default.`,
          `9.5 You agree not to sell, transfer, pledge, sub-finance, or otherwise dispose of the Goods, other than in the ordinary course of resale to your own customers, without Amana's prior written consent, for as long as any amount remains outstanding under this Contract.`
        ]
      },
      {
        number: '10',
        title: 'Default and Recovery',
        subclauses: [
          `10.1 Each of the following constitutes an event of default under this Contract: (a) failure to make any payment when due under clause 4; (b) use of the Goods for a purpose materially different from that disclosed to Amana; (c) provision of false, misleading, or incomplete information to Amana in connection with this Contract; (d) you becoming insolvent, ceasing to trade, or otherwise being unable to pay debts as they fall due; (e) unauthorized sale, transfer, pledge, or disposal of the Goods in breach of clause 9.5; (f) any act of fraud, dishonesty, or attempted fraud in connection with this Contract; or (g) breach of any other material obligation under this Contract, not remedied within a reasonable period after notice.`,
          `10.2 On an event of default, Amana's Market Agent will engage you directly, through reminders, discussion, and, where appropriate, restructuring of the repayment schedule. Given that Amana's Murabaha contracts are typically short-term (1–2 weeks), this direct engagement will ordinarily begin within 2 Business Days of the missed payment or other default and continue for up to a further 5 Business Days.`,
          `10.3 If direct engagement does not resolve the default within the period in clause 10.2, Amana or the Market Agent may refer the matter to your Market Union for mediation, with a view to reaching an agreed repayment or settlement plan, ordinarily completed within 5 Business Days of referral. You consent to Amana sharing with the Market Union the limited repayment information reasonably necessary for that mediation.`,
          `10.4 If mediation does not resolve the default within the period in clause 10.3, or the Market Union declines or is unable to mediate, Amana may pursue recovery through any lawful means it considers appropriate in the circumstances, including a civil claim before a competent court, engagement of a licensed recovery agent, enforcement of the security interest described in clause 8, and, where the conduct involves fraud or other criminal wrongdoing, referral to the relevant authorities, in each case without self-help repossession or seizure of the Secured Property without your consent or lawful authority.`,
          `10.5 What is recovered from a defaulting Trader is the outstanding Total Price, not the Secured Property itself. The Secured Property, and the security interest over it, is collateral that may be realized to satisfy that debt; surrendering or losing any part of the Secured Property does not, by itself, discharge or reduce your debt to Amana.`,
          `10.6 Where any part of the Secured Property or its proceeds is realized as part of recovery and its value exceeds the amount owed by you (including any recovery costs), Amana will return the surplus to you. Where the value realized is less than the amount owed, you remain liable to Amana for the outstanding balance in full.`
        ]
      },
      {
        number: '11',
        title: 'Sharia Compliance',
        subclauses: [
          `11.1 This Contract is structured to comply with Sharia principles governing Murabaha sales, including full disclosure of the Actual Cost Price and Profit Margin, Amana's prior ownership and possession of the Goods, and your payment obligation arising strictly from a bona fide Murabaha sale of specifically identified tangible inventory goods.`
        ]
      },
      {
        number: '12',
        title: 'Relationship to Other Agreements',
        subclauses: [
          `12.1 This Contract is entered into following, and in fulfilment of, your Undertaking.`,
          `12.2 This Contract does not affect your obligations under any other Murabaha Contract previously concluded with Amana.`
        ]
      },
      {
        number: '13',
        title: 'Governing Law and Dispute Resolution',
        subclauses: [
          `13.1 This Contract is governed by the laws of the Federal Republic of Nigeria.`,
          `13.2 Any dispute arising from this Contract will first be referred to good faith negotiation between the parties, which may include mediation through your Market Union. If unresolved, the dispute will be submitted to a court of competent jurisdiction in Nigeria, or, where both parties agree, to a single arbitrator under the Arbitration and Mediation Act 2023.`
        ]
      },
      {
        number: '14',
        title: 'Notices',
        subclauses: [
          `14.1 Any notice under this Contract must be given in writing and delivered by email or through the Amana platform, to the contact details provided by the relevant party.`,
          `14.2 A notice is deemed received on the Business Day it is sent, if sent before 5:00pm on a Business Day, and otherwise on the next Business Day.`
        ]
      },
      {
        number: '15',
        title: 'Acceptance',
        subclauses: [
          `15.1 By clicking "I Agree," or otherwise indicating acceptance through the Amana platform, you confirm your identity as authenticated by the platform (${traderName} / ${traderPhone || 'Authenticated Trader'}), and acknowledge that you have read, understood, and agree to be bound by this Murabaha Contract in full. This action constitutes your valid and binding electronic signature and execution of this Murabaha Contract, effective as of the date and time recorded by the platform, with the same legal effect as a handwritten signature. Amana's electronic record of your acceptance, including the date, time, and authenticated identity, is conclusive evidence of execution of this Murabaha Contract.`
        ]
      }
    ]
  };
};
