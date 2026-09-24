import { useState } from 'react'
import './App.css'

const migrations = [
  { id: 'MIG-042', title: 'Add customer risk index', detail: 'CREATE INDEX CONCURRENTLY idx_customer_risk ON customers (risk_score);', risk: 'low', time: '09:41:22', type: 'DDL' },
  { id: 'MIG-041', title: 'Drop legacy sessions', detail: 'DROP TABLE legacy_sessions;', risk: 'blocked', time: '09:38:04', type: 'DDL' },
  { id: 'MIG-040', title: 'Expand order status', detail: "ALTER TYPE order_status ADD VALUE 'refunded';", risk: 'medium', time: '09:31:17', type: 'DDL' },
]

const findings = {
  low: { label: 'Approved for signing', copy: 'No policy violations found. This migration is safe to sign.', tone: 'success' },
  medium: { label: 'Review recommended', copy: 'A lock timeout is recommended before altering a live enum.', tone: 'warning' },
  blocked: { label: 'Hard stop enforced', copy: 'DROP TABLE is prohibited by policy.production.allow_drop_table.', tone: 'danger' },
}

function Icon({ children }) { return <span className="icon" aria-hidden="true">{children}</span> }

function App() {
  const [activeMigration, setActiveMigration] = useState(migrations[0])
  const [events, setEvents] = useState([
    { label: 'MIG-042 signed and staged', meta: 'Ed25519 attestation · 09:41:23', tone: 'success' },
    { label: 'MIG-041 blocked at pre-receive', meta: 'Policy violation · 09:38:04', tone: 'danger' },
    { label: 'Policy manifest loaded', meta: 'vajra.toml · 09:30:01', tone: 'neutral' },
  ])
  const [notice, setNotice] = useState('')
  const finding = findings[activeMigration.risk]
  const runCheck = () => {
    const blocked = activeMigration.risk === 'blocked'
    setEvents((current) => [{ label: blocked ? `${activeMigration.id} rejected by policy` : `${activeMigration.id} signed and staged`, meta: blocked ? 'Hard stop · just now' : 'Ed25519 attestation · just now', tone: blocked ? 'danger' : 'success' }, ...current])
    setNotice(blocked ? 'Change rejected before it could reach production.' : 'Change verified and signed successfully.')
    window.setTimeout(() => setNotice(''), 3200)
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand-lockup"><div className="brand-mark"><span>V</span></div><div><strong>vajra<span>.db</span></strong><small>database safety</small></div></div>
      <div className="workspace-switcher"><span className="workspace-dot" /> production <span className="chevron">⌄</span></div>
      <nav className="nav-list" aria-label="Main navigation"><a className="nav-item active" href="#overview"><Icon>+</Icon>Overview</a><a className="nav-item" href="#migrations"><Icon>↗</Icon>Migrations <b>3</b></a><a className="nav-item" href="#policies"><Icon>◈</Icon>Policies</a><a className="nav-item" href="#audit"><Icon>≡</Icon>Audit trail</a></nav>
      <div className="sidebar-bottom"><div className="agent-status"><span className="pulse" /><div><strong>Agent online</strong><small>watching workspace</small></div></div><div className="profile"><div className="avatar">AY</div><div><strong>Abhiram Y.</strong><small>Admin</small></div><span className="more">•••</span></div></div>
    </aside>
    <main className="main-content" id="overview">
      <header className="topbar"><div><p className="eyebrow">WED, SEP 24, 2026 <span>/</span> 09:42 AM</p><h1>Good morning, Abhiram</h1></div><div className="top-actions"><button className="icon-button" aria-label="Notifications">◎<i /></button><button className="outline-button"><Icon>?</Icon> Docs</button><button className="primary-button" onClick={() => document.getElementById('migrations').scrollIntoView({ behavior: 'smooth' })}>Review changes <span>→</span></button></div></header>
      <section className="hero-grid"><div className="hero-copy"><div className="status-kicker"><span className="live-dot" /> SYSTEM OPERATIONAL</div><h2>Ship changes.<br /><em>Keep control.</em></h2><p>Vajra watches every schema change, analyzes its intent, and gates anything that could put production at risk.</p><div className="hero-meta"><span><strong>99.99%</strong> policy coverage</span><span><strong>184ms</strong> median check time</span></div></div><div className="shield-card"><div className="shield-orbit orbit-a" /><div className="shield-orbit orbit-b" /><div className="shield-core"><span>V</span></div><div className="shield-label"><strong>Protected</strong><small>production gateway</small></div><div className="shield-line line-one" /><div className="shield-line line-two" /></div></section>
      <section className="metrics-grid" aria-label="System metrics"><Metric label="CHANGES TODAY" value="24" note="+8.3% from yesterday" icon="↗" /><Metric label="BLOCKED THIS WEEK" value="07" note="3 critical interventions" icon="!" red /><Metric label="POLICY HEALTH" value="100%" note="All systems green" icon="✓" /><Metric label="AVG. CHECK TIME" value="184ms" note="−12ms this week" icon="◷" /></section>
      <section className="workspace-grid" id="migrations"><div className="panel migration-panel"><PanelHead eyebrow="WATCH / ANALYZE / GATE" title="Migration review queue" action="View all" /><div className="migration-list">{migrations.map((migration) => <button className={`migration-row ${activeMigration.id === migration.id ? 'selected' : ''}`} key={migration.id} onClick={() => setActiveMigration(migration)}><span className={`risk-marker ${migration.risk}`} /><div className="migration-title"><strong>{migration.title}</strong><small>{migration.id} · {migration.type}</small></div><code>{migration.detail}</code><span className={`risk-pill ${migration.risk}`}>{migration.risk === 'blocked' ? 'Blocked' : migration.risk === 'low' ? 'Safe' : 'Review'}</span><time>{migration.time}</time><span className="row-arrow">→</span></button>)}</div></div><div className="panel check-panel"><div className="panel-header"><div><p className="eyebrow">ANALYZE</p><h3>Safety check</h3></div><span className="latency">{activeMigration.risk === 'blocked' ? '0.04s' : '0.18s'}</span></div><div className={`finding ${finding.tone}`}><div className="finding-icon">{finding.tone === 'success' ? '✓' : '!'}</div><div><strong>{finding.label}</strong><p>{finding.copy}</p></div></div><div className="check-details"><div><span>Target</span><strong>production</strong></div><div><span>Policy</span><strong>vajra.toml</strong></div><div><span>Signature</span><strong>Ed25519</strong></div></div><button className={`run-button ${activeMigration.risk === 'blocked' ? 'danger-button' : ''}`} onClick={runCheck}>{activeMigration.risk === 'blocked' ? 'Reject change' : 'Run safety check'} <span>→</span></button></div></section>
      <section className="bottom-grid"><div className="panel architecture-panel" id="policies"><PanelHead eyebrow="ENFORCEMENT MODEL" title="Every change has a witness" /><div className="flow"><FlowStep number="01" title="Watch" detail="Local authoring" /><span className="flow-arrow">→</span><FlowStep number="02" title="Analyze" detail="Rust AST engine" active /><span className="flow-arrow">→</span><FlowStep number="03" title="Gate" detail="Cryptographic sign-off" /></div><div className="manifest"><span className="manifest-label">POLICY MANIFEST <b>vajra.toml</b></span><code><span>[policy.production]</span><br />allow_drop_column = <b>false</b><br />allow_truncate = <b>false</b><br />require_lock_timeout = <b>"5s"</b></code></div></div><div className="panel audit-panel" id="audit"><PanelHead eyebrow="AUDIT TRAIL" title="Recent activity" action="Export" /><div className="event-list">{events.slice(0, 4).map((event, index) => <div className="event" key={`${event.label}-${index}`}><span className={`event-dot ${event.tone}`} /><div><strong>{event.label}</strong><small>{event.meta}</small></div></div>)}</div></div></section>
      {notice && <div className="toast"><span>✓</span>{notice}</div>}
    </main>
  </div>
}

function Metric({ label, value, note, icon, red }) { return <div className="metric-card"><div className="metric-head"><span>{label}</span><Icon>{icon}</Icon></div><strong>{value}</strong><small><b className={red ? 'red-text' : ''}>{note.split(' ')[0]}</b> {note.split(' ').slice(1).join(' ')}</small><div className="metric-decoration" /></div> }
function PanelHead({ eyebrow, title, action }) { return <div className="panel-header"><div><p className="eyebrow">{eyebrow}</p><h3>{title}{title.includes('queue') && <span className="count">3 pending</span>}</h3></div>{action && <button className="ghost-button">{action} <span>→</span></button>}</div> }
function FlowStep({ number, title, detail, active }) { return <div className={`flow-step ${active ? 'active-flow' : ''}`}><span className="flow-number">{number}</span><strong>{title}</strong><small>{detail}</small></div> }

export default App
