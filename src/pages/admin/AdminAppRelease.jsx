import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  Smartphone, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Info,
  Check,
  AlertCircle,
  GitBranch,
  Lock,
  Unlock,
  Layers,
  Zap,
  Copy,
  Wifi,
  Battery,
  Signal,
  ArrowUpRight
} from 'lucide-react';
import GooglePlayBadge from '../../components/GooglePlayBadge';
import './AdminAppRelease.css';

const FALLBACK_CONFIG = {
  latestVersion: '1.0.1',
  latestVersionCode: 2,
  minVersion: '1.0.0',
  minVersionCode: 1,
  forceUpdate: false,
  enabled: true,
  storeUrl: 'https://play.google.com/store/apps/details?id=com.joinamana.app&pcampaignid=web_share',
  title: 'Update Available',
  message: 'A newer, faster version of Amana is ready on Google Play with enhanced Sharia trade features.',
  releaseNotes: [
    '• Sharia-compliant Murabaha execution upgrades',
    '• Instant inventory repayment tracking & receipts',
    '• Performance, security, and offline improvements'
  ]
};

const RELEASE_NOTE_PRESETS = [
  '• Sharia-compliant Murabaha execution upgrades',
  '• Instant inventory repayment tracking & receipts',
  '• Agent off-platform purchase verification updates',
  '• Bank transfer instant webhook confirmation',
  '• Enhanced biometric login & security hardening',
  '• Faster app boot and reduced offline data usage'
];

const AdminAppRelease = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [previewMode, setPreviewMode] = useState('auto'); // 'auto' | 'force' | 'flexible'
  const [lastUpdated, setLastUpdated] = useState(null);

  const [codebaseBuild, setCodebaseBuild] = useState({
    version: '1.0.1',
    versionCode: 2,
    loaded: false
  });

  const [formData, setFormData] = useState(FALLBACK_CONFIG);
  const [releaseNotesText, setReleaseNotesText] = useState('');

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/system/app-version');
      if (data) {
        const detectedVersion = data.detectedAppJsonVersion || '1.0.1';
        const detectedVersionCode = data.detectedAppJsonVersionCode || 2;

        setCodebaseBuild({
          version: detectedVersion,
          versionCode: detectedVersionCode,
          loaded: true
        });

        setFormData({
          latestVersion: data.latestVersion || detectedVersion,
          latestVersionCode: data.latestVersionCode || detectedVersionCode,
          minVersion: data.minVersion || '1.0.0',
          minVersionCode: data.minVersionCode || 1,
          forceUpdate: Boolean(data.forceUpdate),
          enabled: data.enabled !== undefined ? Boolean(data.enabled) : true,
          storeUrl: data.storeUrl || FALLBACK_CONFIG.storeUrl,
          title: data.title || FALLBACK_CONFIG.title,
          message: data.message || FALLBACK_CONFIG.message,
          releaseNotes: Array.isArray(data.releaseNotes) ? data.releaseNotes : FALLBACK_CONFIG.releaseNotes
        });

        const notes = Array.isArray(data.releaseNotes) ? data.releaseNotes : FALLBACK_CONFIG.releaseNotes;
        setReleaseNotesText(notes.join('\n'));
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (error) {
      console.error('Failed to load app version config:', error);
      addToast('Using default app version settings', 'info');
      setReleaseNotesText(FALLBACK_CONFIG.releaseNotes.join('\n'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotesChange = (e) => {
    const text = e.target.value;
    setReleaseNotesText(text);
    const parsed = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    setFormData(prev => ({ ...prev, releaseNotes: parsed }));
  };

  const handleAddPreset = (presetText) => {
    const currentLines = releaseNotesText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);
    if (!currentLines.includes(presetText)) {
      const updated = [...currentLines, presetText].join('\n');
      setReleaseNotesText(updated);
      setFormData(prev => ({
        ...prev,
        releaseNotes: [...currentLines, presetText]
      }));
      addToast('Added release note item', 'info');
    }
  };

  const handleSyncFromCodebase = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/system/app-version/sync');
      if (res.data?.success) {
        const synced = res.data.data;
        setFormData(prev => ({
          ...prev,
          latestVersion: synced.latestVersion,
          latestVersionCode: synced.latestVersionCode
        }));
        if (res.data.detectedAppJsonVersion) {
          setCodebaseBuild({
            version: res.data.detectedAppJsonVersion,
            versionCode: res.data.detectedAppJsonVersionCode,
            loaded: true
          });
        }
        addToast(`Synchronized with app.json: v${synced.latestVersion} (Code ${synced.latestVersionCode})`, 'success');
      }
    } catch (error) {
      console.error('Failed to sync version with codebase:', error);
      if (codebaseBuild.version) {
        setFormData(prev => ({
          ...prev,
          latestVersion: codebaseBuild.version,
          latestVersionCode: codebaseBuild.versionCode
        }));
        addToast(`Filled from detected app.json: v${codebaseBuild.version}`, 'info');
      } else {
        addToast('Failed to sync with app codebase', 'error');
      }
    } finally {
      setSyncing(false);
    }
  };

  const isOutOfSync = codebaseBuild.loaded && (
    codebaseBuild.version !== formData.latestVersion ||
    Number(codebaseBuild.versionCode) !== Number(formData.latestVersionCode)
  );

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        latestVersionCode: parseInt(formData.latestVersionCode, 10) || 2,
        minVersionCode: parseInt(formData.minVersionCode, 10) || 1,
        releaseNotes: releaseNotesText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
      };

      const res = await api.put('/system/app-version', payload);
      if (res.data?.success) {
        addToast('App Version & Update rules deployed live to Google Play users!', 'success');
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        addToast('Settings updated', 'success');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      addToast(error.response?.data?.message || 'Failed to update app version settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Determine effective preview mode
  const effectiveIsForce = previewMode === 'auto' ? formData.forceUpdate : (previewMode === 'force');

  return (
    <div className="admin-release-view">
      {/* ── TOP HEADER SECTION ── */}
      <div className="release-header-panel">
        <div className="release-header-main">
          <div className="release-icon-halo">
            <Smartphone size={26} className="text-brand" />
          </div>
          <div className="release-title-block">
            <div className="release-tag-row">
              <span className="release-badge-tag">Mobile Engineering</span>
              <span className="release-dot-separator">•</span>
              <span className="release-sub-badge">Google Play Store & In-App Update Engine</span>
            </div>
            <h1 className="release-main-title">App Version & Store Release Control</h1>
            <p className="release-subtitle">
              Configure in-app update prompts, enforce mandatory Sharia compliance upgrades, and direct users seamlessly to Google Play.
            </p>
          </div>
        </div>

        <div className="release-header-actions">
          {lastUpdated && (
            <span className="last-sync-tag">
              <span className="live-pulsing-dot"></span>
              Live: {lastUpdated}
            </span>
          )}
          <button 
            type="button" 
            onClick={fetchConfig} 
            disabled={loading || saving || syncing}
            className="btn-action-glass"
            title="Reload live configuration from database and app.json"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={saving}
            className="btn-action-primary"
          >
            <Save size={16} />
            <span>{saving ? 'Deploying Live...' : 'Deploy Changes'}</span>
          </button>
        </div>
      </div>

      {/* ── 4-CARD METRIC COMMAND CENTER ── */}
      <div className="release-metrics-grid">
        {/* Metric 1: Store Target */}
        <div className="metric-glass-card metric-brand">
          <div className="metric-card-top">
            <span className="metric-card-label">Target Store Version</span>
            <div className="metric-card-icon-pill">
              <GooglePlayBadge size="sm" className="compact-mini-badge" />
            </div>
          </div>
          <div className="metric-card-body">
            <div className="metric-card-number font-mono">v{formData.latestVersion}</div>
            <div className="metric-card-sub">
              Build Code <strong className="font-mono">#{formData.latestVersionCode}</strong>
            </div>
          </div>
          <div className="metric-card-foot">
            <span className="status-chip chip-success">
              <CheckCircle2 size={12} /> Google Play Live
            </span>
          </div>
        </div>

        {/* Metric 2: Detected Repository Build */}
        <div className="metric-glass-card metric-repo">
          <div className="metric-card-top">
            <span className="metric-card-label">app.json Build</span>
            <div className="metric-card-icon-pill icon-subtle">
              <GitBranch size={16} />
            </div>
          </div>
          <div className="metric-card-body">
            <div className="metric-card-number font-mono text-emerald-700 dark:text-emerald-400">
              v{codebaseBuild.version || '1.0.1'}
            </div>
            <div className="metric-card-sub">
              Android Code <strong className="font-mono">#{codebaseBuild.versionCode || 2}</strong>
            </div>
          </div>
          <div className="metric-card-foot">
            {isOutOfSync ? (
              <span className="status-chip chip-warning animate-pulse">
                <AlertTriangle size={12} /> New Build Detected
              </span>
            ) : (
              <span className="status-chip chip-neutral">
                <Check size={12} /> Synced with Codebase
              </span>
            )}
          </div>
        </div>

        {/* Metric 3: Lockout Floor */}
        <div className="metric-glass-card metric-floor">
          <div className="metric-card-top">
            <span className="metric-card-label">Minimum Allowed</span>
            <div className="metric-card-icon-pill icon-subtle">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="metric-card-body">
            <div className="metric-card-number font-mono">v{formData.minVersion}</div>
            <div className="metric-card-sub">
              Lockout Code <strong className="font-mono">#{formData.minVersionCode}</strong>
            </div>
          </div>
          <div className="metric-card-foot">
            <span className="status-chip chip-danger">
              <Lock size={12} /> Hard Gate Barrier
            </span>
          </div>
        </div>

        {/* Metric 4: Enforcement Mode */}
        <div className="metric-glass-card metric-mode">
          <div className="metric-card-top">
            <span className="metric-card-label">Enforcement Mode</span>
            <div className="metric-card-icon-pill icon-subtle">
              {formData.forceUpdate ? <Lock size={16} color="#e11d48" /> : <Unlock size={16} color="#059669" />}
            </div>
          </div>
          <div className="metric-card-body">
            <div className="metric-card-number text-lg font-bold">
              {formData.forceUpdate ? 'Mandatory Lock' : 'Flexible Dialog'}
            </div>
            <div className="metric-card-sub">
              {formData.enabled ? 'Broadcast Active on Devices' : 'Broadcast Paused'}
            </div>
          </div>
          <div className="metric-card-foot">
            <span className={`status-chip ${formData.enabled ? 'chip-success' : 'chip-neutral'}`}>
              <Zap size={12} /> {formData.enabled ? 'Active Engine' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* ── CODEBASE SYNC CALLOUT BANNER ── */}
      {isOutOfSync && (
        <div className="sync-callout-card animate-fade-in">
          <div className="sync-callout-glow"></div>
          <div className="sync-callout-content">
            <div className="sync-callout-icon">
              <Sparkles size={24} className="text-brand" />
            </div>
            <div className="sync-callout-text">
              <h4>New App Build Detected in <code>my-app/app.json</code></h4>
              <p>
                Your repository codebase specifies <strong>v{codebaseBuild.version} (Build #{codebaseBuild.versionCode})</strong>, 
                while the live Google Play release rule in your database is set to <strong>v{formData.latestVersion} (Build #{formData.latestVersionCode})</strong>.
              </p>
            </div>
          </div>
          <div className="sync-callout-actions">
            <button
              type="button"
              onClick={handleSyncFromCodebase}
              disabled={syncing}
              className="btn-sync-now"
            >
              <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
              <span>{syncing ? 'Syncing...' : 'Sync to app.json Build'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 2-COLUMN WORKSPACE ── */}
      <div className="release-workspace-layout">
        {/* LEFT COLUMN: CONFIGURATION PANELS */}
        <div className="release-controls-pane">
          {/* PANEL 1: VERSION RULES */}
          <div className="control-section-card">
            <div className="control-section-header">
              <div className="header-badge-title">
                <Layers size={18} className="text-brand" />
                <h3>1. Store Target & Minimum Barrier</h3>
              </div>
              {codebaseBuild.version && (
                <button
                  type="button"
                  onClick={() => {
                    handleChange('latestVersion', codebaseBuild.version);
                    handleChange('latestVersionCode', codebaseBuild.versionCode);
                    addToast(`Auto-filled v${codebaseBuild.version} (#${codebaseBuild.versionCode})`, 'info');
                  }}
                  className="chip-quick-sync"
                  title="Auto-fill latest version from app.json"
                >
                  <Sparkles size={13} />
                  <span>Use app.json build</span>
                </button>
              )}
            </div>

            <div className="control-section-body">
              {/* Visual Version Migration Timeline */}
              <div className="version-flow-visual">
                <div className="flow-step step-min">
                  <span className="flow-badge">Min Barrier</span>
                  <span className="flow-val font-mono">v{formData.minVersion}</span>
                  <span className="flow-code font-mono">Code #{formData.minVersionCode}</span>
                </div>
                <div className="flow-arrow">
                  <div className="flow-line"></div>
                  <ArrowRight size={16} />
                </div>
                <div className="flow-step step-installed">
                  <span className="flow-badge">User Base</span>
                  <span className="flow-val">All Devices</span>
                  <span className="flow-code">Auto-prompted</span>
                </div>
                <div className="flow-arrow">
                  <div className="flow-line"></div>
                  <ArrowRight size={16} />
                </div>
                <div className="flow-step step-target">
                  <span className="flow-badge">Google Play Target</span>
                  <span className="flow-val font-mono text-brand">v{formData.latestVersion}</span>
                  <span className="flow-code font-mono">Code #{formData.latestVersionCode}</span>
                </div>
              </div>

              {/* Version Inputs */}
              <div className="form-fields-grid">
                <div className="form-col">
                  <label className="field-label">
                    <span>Latest Store Version Name</span>
                    <span className="field-hint">e.g. 1.0.1</span>
                  </label>
                  <input
                    type="text"
                    value={formData.latestVersion}
                    onChange={(e) => handleChange('latestVersion', e.target.value)}
                    placeholder="1.0.1"
                    className="field-input font-mono"
                    required
                  />
                  <p className="field-subtext">
                    Human-readable release tag displayed on Google Play and inside the modal.
                  </p>
                </div>

                <div className="form-col">
                  <label className="field-label">
                    <span>Google Play Version Code</span>
                    <span className="field-hint">Integer e.g. 2</span>
                  </label>
                  <input
                    type="number"
                    value={formData.latestVersionCode}
                    onChange={(e) => handleChange('latestVersionCode', parseInt(e.target.value, 10) || '')}
                    placeholder="2"
                    className="field-input font-mono"
                    required
                  />
                  <p className="field-subtext">
                    Android internal build number. Must increase monotonically with each release.
                  </p>
                </div>
              </div>

              <div className="form-fields-grid">
                <div className="form-col">
                  <label className="field-label">
                    <span>Minimum Allowed Version Name</span>
                    <span className="field-hint">e.g. 1.0.0</span>
                  </label>
                  <input
                    type="text"
                    value={formData.minVersion}
                    onChange={(e) => handleChange('minVersion', e.target.value)}
                    placeholder="1.0.0"
                    className="field-input font-mono"
                    required
                  />
                  <p className="field-subtext">
                    App versions below this are completely blocked from transacting.
                  </p>
                </div>

                <div className="form-col">
                  <label className="field-label">
                    <span>Minimum Allowed Version Code</span>
                    <span className="field-hint">Integer e.g. 1</span>
                  </label>
                  <input
                    type="number"
                    value={formData.minVersionCode}
                    onChange={(e) => handleChange('minVersionCode', parseInt(e.target.value, 10) || '')}
                    placeholder="1"
                    className="field-input font-mono"
                    required
                  />
                  <p className="field-subtext">
                    Build codes below this trigger mandatory immediate lock screen.
                  </p>
                </div>
              </div>

              {/* Toggles */}
              <div className="toggles-cluster">
                {/* Toggle 1: Force Update */}
                <div className={`switch-row ${formData.forceUpdate ? 'switch-active-danger' : ''}`}>
                  <div className="switch-text-block">
                    <div className="switch-title-wrap">
                      <span className="switch-title">Enforce Mandatory Lock (Force Update)</span>
                      {formData.forceUpdate && (
                        <span className="pill-lock-badge">HARD LOCK ACTIVE</span>
                      )}
                    </div>
                    <p className="switch-desc">
                      Removes the "Remind Me Later" dismissal button and blocks back-navigation. Users must upgrade before accessing any Amana trade features.
                    </p>
                  </div>
                  <label className="modern-switch">
                    <input
                      type="checkbox"
                      checked={formData.forceUpdate}
                      onChange={(e) => handleChange('forceUpdate', e.target.checked)}
                    />
                    <span className="modern-slider round"></span>
                  </label>
                </div>

                {/* Toggle 2: Broadcast Updates */}
                <div className="switch-row">
                  <div className="switch-text-block">
                    <div className="switch-title-wrap">
                      <span className="switch-title">Broadcast In-App Update Prompts</span>
                      <span className={`status-dot ${formData.enabled ? 'online' : 'offline'}`}></span>
                    </div>
                    <p className="switch-desc">
                      When enabled, devices check for upgrades on launch and display the update dialog.
                    </p>
                  </div>
                  <label className="modern-switch">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => handleChange('enabled', e.target.checked)}
                    />
                    <span className="modern-slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL 2: STORE LINK & MESSAGING */}
          <div className="control-section-card">
            <div className="control-section-header">
              <div className="header-badge-title">
                <ExternalLink size={18} className="text-brand" />
                <h3>2. Google Play Link & Modal Content</h3>
              </div>
            </div>

            <div className="control-section-body">
              {/* Store URL */}
              <div className="field-group">
                <label className="field-label">
                  <span>Official Google Play Store Link</span>
                </label>
                <div className="input-affix-group">
                  <input
                    type="url"
                    value={formData.storeUrl}
                    onChange={(e) => handleChange('storeUrl', e.target.value)}
                    placeholder="https://play.google.com/store/apps/details?id=com.joinamana.app&pcampaignid=web_share"
                    className="field-input"
                    required
                  />
                  <a 
                    href={formData.storeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="affix-btn"
                    title="Test Open in Google Play Store"
                  >
                    <ArrowUpRight size={16} />
                    <span>Test Link</span>
                  </a>
                </div>
                <div className="field-badge-line">
                  <span className="micro-badge">Package: com.joinamana.app</span>
                  <span className="micro-badge">Play Store Verified</span>
                </div>
              </div>

              {/* Title & Message */}
              <div className="form-fields-grid">
                <div className="form-col" style={{ gridColumn: 'span 2' }}>
                  <label className="field-label">
                    <span>Modal Headline</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Update Available"
                    className="field-input"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">
                  <span>Modal Subtitle & Description</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Explain why traders should update..."
                  className="field-textarea"
                />
              </div>

              {/* Release Notes */}
              <div className="field-group">
                <div className="label-with-presets">
                  <label className="field-label">
                    <span>What's New in This Version (One item per line)</span>
                  </label>
                  <span className="text-xs text-secondary">Presets:</span>
                </div>

                {/* Preset Chips */}
                <div className="preset-chips-cluster">
                  {RELEASE_NOTE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPreset(preset)}
                      className="preset-chip-btn"
                      title="Click to add this item to release notes"
                    >
                      <Sparkles size={11} />
                      <span>{preset.replace('• ', '')}</span>
                    </button>
                  ))}
                </div>

                <textarea
                  rows={4}
                  value={releaseNotesText}
                  onChange={handleNotesChange}
                  placeholder="• Sharia-compliant Murabaha execution upgrades&#10;• Instant inventory repayment tracking & receipts&#10;• Performance, security, and offline improvements"
                  className="field-textarea font-mono"
                />
                <p className="field-subtext">
                  These bullets render inside the mobile update prompt with green Sharia checkmarks.
                </p>
              </div>
            </div>
          </div>

          {/* DEPLOY ACTION DOCK */}
          <div className="deploy-dock-bar">
            <div className="deploy-dock-info">
              <ShieldCheck size={20} className="text-brand" />
              <div>
                <strong>Instant Live Deployment</strong>
                <p>Saved parameters are fetched immediately on the next mobile app launch or foreground resume.</p>
              </div>
            </div>
            <div className="deploy-dock-btns">
              <button
                type="button"
                onClick={fetchConfig}
                disabled={saving || loading}
                className="btn-dock-secondary"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-dock-primary"
              >
                <Save size={18} />
                <span>{saving ? 'Deploying Changes...' : 'Save & Deploy Rules'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HYPER-REALISTIC FLAGSHIP PHONE FRAME PREVIEW */}
        <div className="release-preview-pane">
          <div className="preview-sticky-wrap">
            <div className="preview-toolbar">
              <div className="toolbar-title">
                <Sparkles size={15} className="text-brand" />
                <span>Live Device Simulation</span>
              </div>
              <div className="toolbar-segmented">
                <button
                  type="button"
                  onClick={() => setPreviewMode('auto')}
                  className={`segment-btn ${previewMode === 'auto' ? 'active' : ''}`}
                >
                  Live
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('flexible')}
                  className={`segment-btn ${previewMode === 'flexible' ? 'active' : ''}`}
                >
                  Optional
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('force')}
                  className={`segment-btn ${previewMode === 'force' ? 'active' : ''}`}
                >
                  Mandatory
                </button>
              </div>
            </div>

            {/* FLAGSHIP HARDWARE FRAME */}
            <div className="flagship-phone-shell">
              {/* Phone Speaker & Dynamic Island */}
              <div className="phone-dynamic-island">
                <div className="camera-lens"></div>
                <div className="speaker-sensor"></div>
              </div>

              {/* Realistic Status Bar */}
              <div className="phone-os-statusbar">
                <span className="os-time">9:41</span>
                <div className="os-icons">
                  <Signal size={12} />
                  <Wifi size={12} />
                  <Battery size={13} />
                </div>
              </div>

              {/* Simulated App Background (Blurred Trade Dashboard) */}
              <div className="mock-app-canvas">
                <div className="mock-bg-header">
                  <div className="mock-bg-logo">AMANA</div>
                  <div className="mock-bg-avatar"></div>
                </div>
                <div className="mock-bg-card">
                  <div className="mock-bg-card-sub">Murabaha Facility</div>
                  <div className="mock-bg-card-amt">₦850,000</div>
                </div>
                <div className="mock-bg-orders">
                  <div className="mock-bg-line"></div>
                  <div className="mock-bg-line short"></div>
                </div>

                {/* MODAL DIALOG OVERLAY */}
                <div className="modal-dialog-layer">
                  <div className={`modal-native-card ${effectiveIsForce ? 'is-mandatory-gate' : ''}`}>
                    {/* Header Banner */}
                    <div className={`dialog-hero-banner ${effectiveIsForce ? 'banner-mandatory' : 'banner-flexible'}`}>
                      <div className="dialog-halo-icon">
                        {effectiveIsForce ? (
                          <AlertCircle size={28} className="text-amber-700" />
                        ) : (
                          <Sparkles size={28} className="text-emerald-700" />
                        )}
                      </div>
                      <span className="dialog-banner-kicker">
                        {effectiveIsForce ? 'MANDATORY SHARIA UPGRADE' : 'NEW RELEASE READY'}
                      </span>
                      <h3 className="dialog-banner-headline">
                        {effectiveIsForce ? 'Update Required to Continue' : (formData.title || 'Update Available')}
                      </h3>
                    </div>

                    {/* Dialog Body */}
                    <div className="dialog-scroll-body">
                      {/* Version Compare Chips */}
                      <div className="dialog-version-pill-row">
                        <div className="version-pill-installed">
                          <span className="pill-small-tag">Installed</span>
                          <strong className="font-mono">v{formData.minVersion}</strong>
                        </div>
                        <div className="version-pill-divider">
                          <ArrowRight size={13} />
                        </div>
                        <div className="version-pill-latest">
                          <span className="pill-small-tag">New on Store</span>
                          <strong className="font-mono">v{formData.latestVersion}</strong>
                        </div>
                      </div>

                      {/* Description Message */}
                      <p className="dialog-body-copy">
                        {effectiveIsForce
                          ? 'To ensure complete Sharia compliance, transaction validity, and account security, you must update Amana to proceed.'
                          : (formData.message || 'A newer, faster version of Amana is ready on Google Play with enhanced trade features.')}
                      </p>

                      {/* What's New Feature List */}
                      <div className="dialog-features-card">
                        <div className="features-card-title">
                          <CheckCircle2 size={13} className="text-brand" />
                          <span>What's New in v{formData.latestVersion}</span>
                        </div>
                        <ul className="features-bullet-list">
                          {(formData.releaseNotes && formData.releaseNotes.length > 0
                            ? formData.releaseNotes
                            : ['• Sharia Murabaha upgrades', '• Instant receipts']
                          ).slice(0, 3).map((item, idx) => (
                            <li key={idx}>
                              <span className="bullet-dot"></span>
                              <span>{item.replace('• ', '')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Halal Guarantee Seal */}
                      <div className="dialog-halal-seal">
                        <ShieldCheck size={14} className="text-brand" />
                        <span>100% Sharia Certified Trade Financing</span>
                      </div>

                      {/* Buttons */}
                      <div className="dialog-cta-cluster">
                        <a 
                          href={formData.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dialog-btn-primary"
                        >
                          <svg className="gp-vector" viewBox="0 0 24 24" fill="none">
                            <path d="M3.609 1.814L13.738 11.943L3.609 22.072V1.814Z" fill="#00A0FF"/>
                            <path d="M17.09 15.549L13.738 12.197L17.09 8.451L21.144 10.756C22.278 11.4 22.278 12.454 21.144 13.098L17.09 15.549Z" fill="#FFE000"/>
                            <path d="M17.172 15.356L13.738 11.922L3.609 22.051C4.015 22.482 4.693 22.537 5.467 22.098L17.172 15.356Z" fill="#FF3A44"/>
                            <path d="M17.172 8.498L5.467 1.756C4.693 1.317 4.015 1.372 3.609 1.803L13.738 11.932L17.172 8.498Z" fill="#00F076"/>
                          </svg>
                          <span>Update on Google Play</span>
                        </a>

                        {!effectiveIsForce && (
                          <button type="button" className="dialog-btn-dismiss">
                            Remind Me Later
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Home Indicator */}
                <div className="phone-home-indicator"></div>
              </div>
            </div>

            <div className="preview-footnote">
              <Info size={14} />
              <span>Real-time preview updates automatically as you configure parameters.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAppRelease;
