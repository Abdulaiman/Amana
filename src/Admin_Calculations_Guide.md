# Admin System Calculations & Guide

This document explains the logic behind the numbers you see in the Admin Dashboard and how the tools function.

## 1. Financial Calculations

### Total Volume (Gross Transaction Value)
*   **Formula**: `Sum of (Order.totalRepaymentAmount)`
*   **Description**: This represents the total value of all business flowing through Amana. It includes the Cost of Goods (Principal) + the Profit (Markup).

### Money Out (Principal Disbursed)
*   **Formula**: `Sum of (Order.itemsPrice)`
*   **Description**: The raw capital that has been paid out (or promised) to Vendors for goods. This is your "Cost of Sales".

### Net Revenue (Profit / Markup)
*   **Formula**: `Sum of (Order.markupAmount)` for all valid orders.
*   **Description**: The total profit Amana has earned.
*   **How Markup is Calculated**:
    *   The `markupPercentage` is determined dynamically based on the **Retailer's Amana Score**.
    *   The system uses the `determineMarkup` engine:
        *   **Low Score (New Users)**: Higher Markup (risk premium).
        *   **High Score (Trusted Users)**: Lower Markup (reward).
    *   Markup Amount = `Items Price` * (`Markup Percentage` / 100).
    *   This is calculated automatically when an Order is created.

### Outstanding Debt
*   **Formula**: Sum of `totalRepaymentAmount` for orders where `status` is `goods_received` AND `isPaid` is `false`.
*   **Description**: Money currently in the hands of Retailers that is due back to Amana.

### Total Payouts (Real Cash Out)
*   **Formula**: Sum of all `WithdrawalRequest` amounts where status is `approved`.
*   **Description**: The actual cash money that has left the Amana corporate bank account and been sent to Vendors.

### Pending Payouts (Vendor Wallet Liability)
*   **Formula**: Sum of all `Vendor.walletBalance`.
*   **Description**: Money stored in the digital wallets of all vendors. This is money they have earned but haven't withdrawn yet. This is a **Liability** for Amana.

---

## 2. Tools & Operations Guide

### Manual Ledger (The "Danger Zone")
*   **What it does**: It directly modifies the `walletBalance` field of a User or Vendor in the database.
*   **Does it effect records?**: YES. It changes their financial balance instantly. It does NOT create a bank transaction.
*   **When to use it**:
    *   **Corrections**: If a vendor was underpaid due to a bug.
    *   **Manual Deposits**: If a user pays you cash physically, and you want to top up their wallet manually.
    *   **Refunds**: If you need to revert a transaction manually.
*   **Safety**: All actions here are logged in the **Audit Log** forever.

### Broadcast Center
*   **What it does**: Sends an email to the registered email addresses of the selected group.
*   **Technology**: Uses the configured SMTP server (Nodemailer).

### User Management Logic
*   **Ban/Deactivate**: Toggles the `isActive` flag on a user.
    *   **Effect**: A banned user cannot log in. Their token is invalidated on next refresh.
    *   **Unban**: Restores access immediately.

---

## 3. Order Status Flow (Murabaha)
1.  **Pending Vendor**: Vendor sees order, verifies stock.
2.  **Ready for Pickup**: Vendor confirms. **Agent is assigned**. System adds order to Retailer's `usedCredit` (soft hold).
3.  **Vendor Settled**: AGENT pays/confirms payment to Vendor. Vendor's Wallet is credited.
4.  **Goods Received**: Retailer confirms receipt. Retailer's `usedCredit` is finalized (Hard Debt).
5.  **Completed/Repaid**: Retailer pays back Amana.
