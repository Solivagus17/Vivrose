import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { RiskBadge, RiskBadgeShort, Avatar } from './ui.jsx';
import { USER } from '../data/data.js';
import { useMember } from '../memberContext.jsx';
import { ROUTES } from '../routes.js';

const FILTERS = ['All', 'high', 'moderate', 'low'];

const RELATIONS = [
  'Self',
  'Spouse',
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Grandfather',
  'Grandmother',
  'Other Family Member',
];

function FilterLabel(filter) {
  if (filter === 'high') return 'High Risk';
  if (filter === 'moderate') return 'Moderate';
  if (filter === 'low') return 'Low Risk';
  return 'All';
}

function AddMemberModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Other Family Member');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('Male');
  const [location, setLocation] = useState(USER.location);

  const valid = name.trim().length > 0 && Number(age) > 0;

  const submit = () => {
    if (!valid) return;
    onAdd({
      name: name.trim(),
      relation,
      age: Number(age),
      sex,
      location: location.trim() || USER.location,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Add Family Member</div>
            <div className="modal-subtitle">Add someone new to your family health plan.</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <Icon name="x" size="sm" />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meera Mehta"
              autoFocus
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Relation</label>
              <select className="form-select" value={relation} onChange={(e) => setRelation(e.target.value)}>
                {RELATIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                className="form-input"
                type="number"
                min="0"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 34"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sex</label>
              <select className="form-select" value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit}>
            <Icon name="userPlus" size="sm" />
            Add Member
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FamilyMembers() {
  const navigate = useNavigate();
  const { members, setMember, addMember, removeMember } = useMember();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = members.filter((p) => {
    const matchesFilter = filter === 'All' || p.level === filter;
    const q = query.toLowerCase();
    const matchesQuery =
      !q || p.name.toLowerCase().includes(q) || p.relation.toLowerCase().includes(q) || p.risk.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });

  const openMember = (id) => {
    setMember(id);
    navigate(ROUTES.insights);
  };

  const handleAdd = (profile) => {
    const created = addMember(profile);
    setShowAdd(false);
    setMember(created.id);
    navigate(ROUTES.insights);
  };

  const handleDelete = (m) => {
    if (members.length <= 1) return;
    const ok = window.confirm(`Remove ${m.name} (${m.relation}) from your family? Their health profile will be deleted.`);
    if (ok) removeMember(m.id);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Family Members</div>
        <div className="page-subtitle">Manage health for everyone in your family.</div>
      </div>

      <div className="patients-toolbar">
        <div className="search-input-wrap">
          <span className="search-icon">
            <Icon name="search" size="sm" />
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by name, relation, or condition..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="segmented">
            {FILTERS.map((f) => (
              <span
                key={f}
                className={`segmented-btn${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {FilterLabel(f)}
              </span>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(true)}>
            <Icon name="userPlus" size="sm" />
            Add Member
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.assessment)}>
            <Icon name="sparkle" size="sm" />
            New Assessment
          </button>
        </div>
      </div>

      {filtered.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: 'var(--gray-400)',
            fontSize: '0.875rem',
            background: 'var(--glass-bg-strong)',
            borderRadius: 'var(--r-xl)',
            marginTop: 20,
          }}
        >
          No family members match your search.
        </div>
      )}

      <div className="family-grid">
        {filtered.map((m) => (
          <div className="family-card" key={m.id} onClick={() => openMember(m.id)}>
            <div className="family-card-top">
              <Avatar initials={m.initials} background={m.avatar} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="family-card-name">{m.name}</div>
                <div className="family-card-relation">
                  {m.relation} · {m.age} yrs
                </div>
              </div>
              <RiskBadgeShort level={m.level} />
            </div>

            <div className="family-card-meta">
              <div>
                <span className="f-label">BMI</span>
                <span className="f-value">{m.bmi}</span>
              </div>
              <div>
                <span className="f-label">BP</span>
                <span className="f-value">{m.bp.split(' ')[0]}</span>
              </div>
              <div>
                <span className="f-label">HbA1c</span>
                <span className="f-value">{m.hba1c}</span>
              </div>
              <div>
                <span className="f-label">Risk</span>
                <span className="f-value">{m.risk}</span>
              </div>
            </div>

            <div className="family-card-footer">
              <button
                className="btn btn-ghost btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openMember(m.id);
                }}
              >
                <Icon name="sparkle" size="sm" />
                View Insights
              </button>
              <button
                className="btn btn-icon-danger btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(m);
                }}
                disabled={members.length <= 1}
                title={members.length <= 1 ? 'At least one member is required' : `Remove ${m.name}`}
                aria-label={`Remove ${m.name}`}
              >
                <Icon name="trash" size="sm" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </>
  );
}
