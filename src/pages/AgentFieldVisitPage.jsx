import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Camera, CheckCircle, XCircle, Store, DollarSign, Users, FileText, ShieldCheck, PhoneOutgoing, Mail } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './AgentFieldVisitPage.css';

const StepToggle = ({ checked, onChange, label }) => (
  <label className="fv-toggle">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className={`fv-toggle-track ${checked ? 'checked' : ''}`}>
      <span className="fv-toggle-indicator" />
      <span className="fv-toggle-text">{checked ? 'Yes' : 'No'}</span>
    </span>
  </label>
);

const AgentFieldVisitPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [retailer, setRetailer] = useState(null);

  const [a1PhysicalStore, setA1PhysicalStore] = useState(true);
  const [a1Notes, setA1Notes] = useState('');

  const [a2MinHistory, setA2MinHistory] = useState(true);
  const [a2Notes, setA2Notes] = useState('');

  const [a3ResaleOnly, setA3ResaleOnly] = useState(true);
  const [a3Notes, setA3Notes] = useState('');

  const [capitalAmount, setCapitalAmount] = useState('');
  const [storePhotoUrl, setStorePhotoUrl] = useState('');
  const [storePhotoFileName, setStorePhotoFileName] = useState('');

  const [c2UnionAwareness, setC2UnionAwareness] = useState(true);
  const [c2Notes, setC2Notes] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchRetailerDetails();
  }, [id]);

  const fetchRetailerDetails = async () => {
    try {
      const res = await api.get(`/agent/retailer/${id}`);
      setRetailer(res.data);
    } catch (error) {
      addToast('Failed to load trader details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStorePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('files', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStorePhotoUrl(res.data[0]);
      setStorePhotoFileName(file.name);
      addToast('Store photo uploaded!', 'success');
    } catch {
      addToast('Failed to upload store photo', 'error');
    }
  };

  const calculatedCapital = Number(capitalAmount) || 0;
  const isB2Pass = calculatedCapital >= 500000;
  const rawCeiling = calculatedCapital * 0.20;
  const calculatedCeiling = isB2Pass ? Math.min(1000000, Math.max(100000, rawCeiling)) : 0;
  const progressPct = Math.min(100, Math.round((calculatedCapital / 500000) * 100));

  const aPass = a1PhysicalStore && a2MinHistory && a3ResaleOnly;
  const allPass = aPass && isB2Pass && c2UnionAwareness && storePhotoUrl;

  const handleSubmitChecklist = async () => {
    if (!capitalAmount || isNaN(calculatedCapital)) {
      addToast('Please enter a valid verified capital amount', 'error');
      return;
    }
    if (!storePhotoUrl) {
      addToast('Please upload a store photo', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        a1_physicalStore: { pass: a1PhysicalStore, notes: a1Notes },
        a2_minTradingHistory: { pass: a2MinHistory, notes: a2Notes },
        a3_goodsResaleOnly: { pass: a3ResaleOnly, notes: a3Notes },
        verifiedCapitalAmount: calculatedCapital,
        storePhotoUrl,
        c2_marketUnionAwareness: { pass: c2UnionAwareness, notes: c2Notes },
        notes,
      };

      await api.post(`/agent/field-visits/${id}/submit`, payload);
      addToast('Field Verification submitted!', 'success');
      navigate('/agent/tasks');
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to submit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fv-loading">
        <div className="fv-spinner" />
        <p>Loading trader details…</p>
      </div>
    );
  }

  if (!retailer) {
    return (
      <div className="fv-loading">
        <p>Trader not found</p>
        <button className="fv-back-btn" onClick={() => navigate('/agent/tasks')}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="fv">
      <header className="fv-top">
        <button className="fv-top-back" onClick={() => navigate('/agent/tasks')}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <div className="fv-top-breadcrumb">
          <span>Agent Dashboard</span>
          <span className="fv-sep">/</span>
          <span className="fv-current">Field Verification</span>
        </div>
        <a href={`tel:${retailer.phone}`} className="fv-top-call">
          <PhoneOutgoing size={15} />
          Call
        </a>
      </header>

      <div className="fv-body">
        <div className="fv-main">

          <div className="fv-profile">
            <div className="fv-profile-glow" />
            <div className="fv-profile-ring">
              <div className="fv-profile-avatar">
                {retailer.name?.charAt(0)?.toUpperCase() || 'T'}
              </div>
            </div>
            <div className="fv-profile-info">
              <h1>{retailer.name}</h1>
              <div className="fv-profile-meta">
                <span><ShieldCheck size={13} /> Pending Field Verification</span>
              </div>
              <div className="fv-profile-detail">
                <span><strong>Phone</strong> {retailer.phone}</span>
                <span><strong>Business</strong> {retailer.businessInfo?.businessName || '—'}</span>
                <span><strong>Address</strong> {retailer.address || '—'}</span>
              </div>
            </div>
          </div>

          <div className="fv-checklist">
            <div className="fv-checklist-header">
              <ShieldCheck size={18} />
              <span>On-Field Verification Checklist</span>
              <div className="fv-checklist-count">
                {[aPass, isB2Pass, c2UnionAwareness, !!storePhotoUrl].filter(Boolean).length} / 4
              </div>
            </div>

            <div className="fv-progress-track">
              {[aPass, isB2Pass, c2UnionAwareness, !!storePhotoUrl].map((done, i) => (
                <div key={i} className={`fv-prog-seg ${done ? 'done' : ''}`} />
              ))}
            </div>

            <div className="fv-step">
              <div className="fv-step-overline">
                <Store size={15} />
                <span>Step 1 of 4</span>
              </div>
              <h3 className="fv-step-title">Business Legitimacy</h3>
              <p className="fv-step-desc">Confirm the trader operates a legitimate business with physical premises.</p>

              <div className="fv-items">
                <div className="fv-item">
                  <div className="fv-item-head">
                    <div className="fv-item-left">
                      <span className="fv-item-code">A1</span>
                      <div>
                        <span className="fv-item-label">Physical Store / Premises</span>
                        <span className="fv-item-desc">In-person visit confirmed premises</span>
                      </div>
                    </div>
                    <StepToggle checked={a1PhysicalStore} onChange={e => setA1PhysicalStore(e.target.checked)} />
                  </div>
                  {a1Notes && (
                    <div className="fv-item-extra">
                      <input
                        className="fv-inp"
                        placeholder="Verification notes for A1…"
                        value={a1Notes}
                        onChange={e => setA1Notes(e.target.value)}
                      />
                    </div>
                  )}
                  <button className="fv-note-toggle" onClick={() => setA1Notes(a1Notes ? '' : ' ')}>
                    {a1Notes ? 'Remove note' : '+ Add note'}
                  </button>
                </div>

                <div className="fv-item">
                  <div className="fv-item-head">
                    <div className="fv-item-left">
                      <span className="fv-item-code">A2</span>
                      <div>
                        <span className="fv-item-label">Min. 6 Months History</span>
                        <span className="fv-item-desc">Trader operated at site &ge; 6 months</span>
                      </div>
                    </div>
                    <StepToggle checked={a2MinHistory} onChange={e => setA2MinHistory(e.target.checked)} />
                  </div>
                  {a2Notes && (
                    <div className="fv-item-extra">
                      <input
                        className="fv-inp"
                        placeholder="Verification notes for A2…"
                        value={a2Notes}
                        onChange={e => setA2Notes(e.target.value)}
                      />
                    </div>
                  )}
                  <button className="fv-note-toggle" onClick={() => setA2Notes(a2Notes ? '' : ' ')}>
                    {a2Notes ? 'Remove note' : '+ Add note'}
                  </button>
                </div>

                <div className="fv-item">
                  <div className="fv-item-head">
                    <div className="fv-item-left">
                      <span className="fv-item-code">A3</span>
                      <div>
                        <span className="fv-item-label">Goods For Resale Only</span>
                        <span className="fv-item-desc">Financing intended for inventory resale</span>
                      </div>
                    </div>
                    <StepToggle checked={a3ResaleOnly} onChange={e => setA3ResaleOnly(e.target.checked)} />
                  </div>
                  {a3Notes && (
                    <div className="fv-item-extra">
                      <input
                        className="fv-inp"
                        placeholder="Verification notes for A3…"
                        value={a3Notes}
                        onChange={e => setA3Notes(e.target.value)}
                      />
                    </div>
                  )}
                  <button className="fv-note-toggle" onClick={() => setA3Notes(a3Notes ? '' : ' ')}>
                    {a3Notes ? 'Remove note' : '+ Add note'}
                  </button>
                </div>

                <div className="fv-photo">
                  <label className={`fv-dropzone ${storePhotoUrl ? 'has-photo' : ''}`}>
                    {storePhotoUrl ? (
                      <div className="fv-dropzone-preview">
                        <img src={storePhotoUrl} alt="Store" />
                        <span className="fv-dropzone-change">Tap to change</span>
                      </div>
                    ) : (
                      <div className="fv-dropzone-empty">
                        <Camera size={28} />
                        <span className="fv-dropzone-title">Upload Store Photo</span>
                        <span className="fv-dropzone-sub">Evidence of physical premises (A1)</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" capture="environment" onChange={handleStorePhotoUpload} hidden />
                  </label>
                </div>
              </div>
            </div>

            <div className="fv-step">
              <div className="fv-step-overline">
                <DollarSign size={15} />
                <span>Step 2 of 4</span>
              </div>
              <h3 className="fv-step-title">Financial Capacity</h3>
              <p className="fv-step-desc">Physically count and verify the trader&apos;s stock value and cash on hand.</p>

              <div className="fv-b1">
                <div className="fv-b1-head">
                  <span className="fv-item-code">B1</span>
                  <span className="fv-item-label">Verified Capital</span>
                </div>
                <div className="fv-b1-field">
                  <span className="fv-currency-sign">₦</span>
                  <input
                    type="number"
                    className="fv-b1-input"
                    placeholder="0"
                    value={capitalAmount}
                    onChange={e => setCapitalAmount(e.target.value)}
                  />
                </div>
              </div>

              {capitalAmount > 0 && (
                <div className="fv-b-calc">
                  <div className={`fv-b2 ${isB2Pass ? 'pass' : 'fail'}`}>
                    <div className="fv-b2-top">
                      <span>B2 — Capital Threshold</span>
                      <span className="fv-b2-badge">{isB2Pass ? 'PASS' : 'FAIL'}</span>
                    </div>
                    <div className="fv-b2-bar-track">
                      <div
                        className={`fv-b2-bar-fill ${isB2Pass ? 'pass' : 'fail'}`}
                        style={{ width: `${Math.min(100, progressPct)}%` }}
                      />
                    </div>
                    <div className="fv-b2-labels">
                      <span>₦{calculatedCapital.toLocaleString()}</span>
                      <span>₦500,000</span>
                    </div>
                    <p className="fv-b2-note">
                      {isB2Pass
                        ? `₦${calculatedCapital.toLocaleString()} ≥ ₦500,000 — threshold met`
                        : `₦${calculatedCapital.toLocaleString()} < ₦500,000 — below threshold`}
                    </p>
                  </div>

                  <div className="fv-b3">
                    <div className="fv-b3-top">
                      <span>B3 — Financing Ceiling</span>
                      <span className="fv-b3-value">₦{calculatedCeiling.toLocaleString()}</span>
                    </div>
                    <p className="fv-b3-note">
                      20% of verified capital{isB2Pass ? '' : ' (requires B2 pass)'} · min ₦100,000 · max ₦1,000,000
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="fv-step">
              <div className="fv-step-overline">
                <Users size={15} />
                <span>Step 3 of 4</span>
              </div>
              <h3 className="fv-step-title">Social Vetting</h3>
              <p className="fv-step-desc">Confirm market union leadership is aware of the trader with no objection.</p>

              <div className="fv-items">
                <div className="fv-item">
                  <div className="fv-item-head">
                    <div className="fv-item-left">
                      <span className="fv-item-code">C2</span>
                      <div>
                        <span className="fv-item-label">Market Union Awareness</span>
                        <span className="fv-item-desc">Union leadership aware with no objection</span>
                      </div>
                    </div>
                    <StepToggle checked={c2UnionAwareness} onChange={e => setC2UnionAwareness(e.target.checked)} />
                  </div>
                  {c2Notes && (
                    <div className="fv-item-extra">
                      <input
                        className="fv-inp"
                        placeholder="Verification notes for C2…"
                        value={c2Notes}
                        onChange={e => setC2Notes(e.target.value)}
                      />
                    </div>
                  )}
                  <button className="fv-note-toggle" onClick={() => setC2Notes(c2Notes ? '' : ' ')}>
                    {c2Notes ? 'Remove note' : '+ Add note'}
                  </button>
                </div>
              </div>
            </div>

            <div className="fv-step">
              <div className="fv-step-overline">
                <FileText size={15} />
                <span>Step 4 of 4</span>
              </div>
              <h3 className="fv-step-title">Agent Notes</h3>
              <p className="fv-step-desc">Optional — any additional observations from the field visit.</p>
              <textarea
                className="fv-notes-inp"
                placeholder="Include anything relevant for admin&apos;s final review…"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="fv-submit">
            <div className="fv-submit-left">
              <span className="fv-submit-status">
                {allPass ? (
                  <><CheckCircle size={16} /> All criteria verified — ready to submit</>
                ) : (
                  <><XCircle size={16} /> Some criteria not yet met</>
                )}
              </span>
              <span className="fv-submit-hint">
                After submission the application moves to Admin for final review.
              </span>
            </div>
            <button
              className={`fv-submit-btn ${allPass ? 'ready' : ''}`}
              onClick={handleSubmitChecklist}
              disabled={submitting || !allPass}
            >
              {submitting ? (
                <><div className="fv-spinner-sm" /> Submitting…</>
              ) : (
                <><CheckCircle size={20} /> Submit to Admin</>
              )}
            </button>
          </div>
        </div>

        <aside className="fv-side">
          <div className="fv-side-box">
            <h4>Progress</h4>
            <div className="fv-side-row">
              <span>Section A</span>
              <span className={`fv-side-tag ${aPass ? 'done' : ''}`}>{aPass ? 'Complete' : 'Pending'}</span>
            </div>
            <div className="fv-side-row">
              <span>Section B</span>
              <span className={`fv-side-tag ${isB2Pass ? 'done' : ''}`}>{capitalAmount ? (isB2Pass ? 'Complete' : 'Below threshold') : 'Not entered'}</span>
            </div>
            <div className="fv-side-row">
              <span>Section C</span>
              <span className={`fv-side-tag ${c2UnionAwareness ? 'done' : ''}`}>{c2UnionAwareness ? 'Complete' : 'Pending'}</span>
            </div>
            <div className="fv-side-row">
              <span>Store Photo</span>
              <span className={`fv-side-tag ${storePhotoUrl ? 'done' : ''}`}>{storePhotoUrl ? 'Uploaded' : 'Missing'}</span>
            </div>
            <hr />
            <div className="fv-side-row">
              <span>Ceiling</span>
              <span className="fv-side-val">₦{calculatedCeiling.toLocaleString()}</span>
            </div>
          </div>

          <div className="fv-side-box">
            <h4>Contact</h4>
            <a href={`tel:${retailer.phone}`} className="fv-side-link">
              <PhoneOutgoing size={15} /> Call Trader
            </a>
            {retailer.email && (
              <a href={`mailto:${retailer.email}`} className="fv-side-link">
                <Mail size={15} /> Send Email
              </a>
            )}
          </div>

          <div className="fv-side-box">
            <h4>Checklist</h4>
            <ul className="fv-side-list">
              <li className={a1PhysicalStore ? 'done' : ''}>Physical premises verified</li>
              <li className={a2MinHistory ? 'done' : ''}>6-month history confirmed</li>
              <li className={a3ResaleOnly ? 'done' : ''}>Goods for resale only</li>
              <li className={!!storePhotoUrl ? 'done' : ''}>Store photo captured</li>
              <li className={!!capitalAmount ? 'done' : ''}>Capital counted & verified</li>
              <li className={c2UnionAwareness ? 'done' : ''}>Union awareness checked</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AgentFieldVisitPage;
