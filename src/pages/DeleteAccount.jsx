import React, { useState } from 'react';
import './DeleteAccount.css';
import api from '../services/api';

const DeleteAccount = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    deleteType: 'account_and_data',
    reason: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/account/delete-request', formData);

      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit request. Please try again or email us directly at service.amanafinance@gmail.com.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="delete-page">
        <div className="delete-container">
          <div className="delete-success-card">
            <div className="delete-success-icon">✅</div>
            <h1>Request Submitted</h1>
            <p>
              Your account deletion request has been submitted successfully. You will
              receive a confirmation email at <strong>{formData.email}</strong>.
            </p>
            <div className="delete-info-box">
              <h3>What happens next?</h3>
              <ul>
                <li>Our team will review your request within <strong>30 days</strong>.</li>
                <li>You will receive an email confirmation once your request has been processed.</li>
                <li>If you have outstanding Murabaha contracts, financial records will be retained until all obligations are fulfilled as required by law.</li>
                <li>KYC documents may be retained for the period required by Nigerian regulations.</li>
              </ul>
            </div>
            <p className="delete-contact-note">
              Questions? Contact us at{' '}
              <a href="mailto:service.amanafinance@gmail.com">service.amanafinance@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="delete-page">
      <div className="delete-container">
        {/* Hero */}
        <div className="delete-hero">
          <div className="delete-badge">
            <span className="delete-badge-dot" />
            Account Management
          </div>
          <h1>Delete Your Account</h1>
          <p className="delete-hero-description">
            You can request the deletion of your Amana account and associated personal data.
            Please fill out the form below and our team will process your request.
          </p>
        </div>

        {/* Important Notice */}
        <div className="delete-notice">
          <span className="delete-notice-icon">ℹ️</span>
          <div className="delete-notice-text">
            <strong>Before you proceed</strong> — Please note that account deletion is
            permanent. If you have any outstanding Murabaha contracts or unpaid balances,
            those financial records must be retained until obligations are fulfilled as
            required by Nigerian law.
          </div>
        </div>

        {/* Form */}
        <form className="delete-form" onSubmit={handleSubmit}>
          <div className="delete-form-card">
            <h2>Deletion Request Form</h2>

            <div className="delete-field">
              <label htmlFor="name">Full Name (optional)</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="delete-field">
              <label htmlFor="email">
                Email Address <span className="delete-required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="The email address associated with your account"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <span className="delete-field-hint">
                This must match the email used to register your Amana account.
              </span>
            </div>

            <div className="delete-field">
              <label>What would you like to delete?</label>
              <div className="delete-radio-group">
                <label className={`delete-radio-card ${formData.deleteType === 'account_and_data' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="deleteType"
                    value="account_and_data"
                    checked={formData.deleteType === 'account_and_data'}
                    onChange={handleChange}
                  />
                  <div className="delete-radio-content">
                    <strong>Delete account and all data</strong>
                    <span>Permanently remove your account and all associated personal data</span>
                  </div>
                </label>
                <label className={`delete-radio-card ${formData.deleteType === 'data_only' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="deleteType"
                    value="data_only"
                    checked={formData.deleteType === 'data_only'}
                    onChange={handleChange}
                  />
                  <div className="delete-radio-content">
                    <strong>Delete personal data only</strong>
                    <span>Remove your personal data but keep a minimal account record</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="delete-field">
              <label htmlFor="reason">Reason for deletion (optional)</label>
              <textarea
                id="reason"
                name="reason"
                placeholder="Let us know why you'd like to delete your account..."
                value={formData.reason}
                onChange={handleChange}
                rows="4"
              />
            </div>

            {error && <div className="delete-error">{error}</div>}

            <button
              type="submit"
              className="delete-submit-btn"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Deletion Request'}
            </button>
          </div>
        </form>

        {/* Data Retention Info */}
        <div className="delete-retention">
          <div className="delete-retention-card">
            <h3>What data is deleted and what is retained?</h3>
            <div className="delete-retention-grid">
              <div className="delete-retention-col">
                <h4 className="delete-retention-deleted">🗑️ Deleted upon request</h4>
                <ul>
                  <li>Account login credentials</li>
                  <li>Profile information (name, phone, address)</li>
                  <li>Psychometric test responses</li>
                  <li>Push notification tokens</li>
                  <li>App usage data</li>
                </ul>
              </div>
              <div className="delete-retention-col">
                <h4 className="delete-retention-kept">📋 Retained as required by law</h4>
                <ul>
                  <li>Financial transaction records</li>
                  <li>KYC/identity verification documents</li>
                  <li>Murabaha contract records</li>
                  <li>Repayment history</li>
                  <li>Records needed for legal compliance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="delete-contact">
          <p>
            You can also submit your request by emailing us directly at{' '}
            <a href="mailto:service.amanafinance@gmail.com">service.amanafinance@gmail.com</a>{' '}
            or calling <a href="tel:08032532333">08032532333</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;
