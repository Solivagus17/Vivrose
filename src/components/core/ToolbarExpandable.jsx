'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useMeasure from 'react-use-measure';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { cn } from '../../lib/utils';
import useClickOutside from '../../hooks/useClickOutside';
import Icon from '../Icon.jsx';
import { useMember } from '../../memberContext.jsx';
import { ROUTES } from '../../routes.js';

const transition = {
  type: 'spring',
  bounce: 0.1,
  duration: 0.25,
};

const ITEMS = [
  {
    id: 1,
    label: 'Profile',
    icon: 'user',
    content: (member) => (
      <div className="mp-toolbar-stack">
        <div className="mp-toolbar-profile">
          <span className="mp-toolbar-avatar" style={{ background: member.avatar }}>
            {member.initials}
          </span>
          <span className="mp-toolbar-text">{member.name}</span>
        </div>
        <button className="mp-toolbar-action" type="button" data-go={ROUTES.insights}>
          View health insights
        </button>
      </div>
    ),
  },
  {
    id: 2,
    label: 'Alerts',
    icon: 'warning',
    content: () => (
      <div className="mp-toolbar-stack">
        <div className="mp-toolbar-text">You have new health alerts that need attention.</div>
        <button className="mp-toolbar-action" type="button" data-go={ROUTES.dashboard}>
          Open dashboard
        </button>
      </div>
    ),
  },
  {
    id: 3,
    label: 'Reports',
    icon: 'document',
    content: () => (
      <div className="mp-toolbar-stack">
        <div className="mp-toolbar-list">
          <span>Rajesh_Report.pdf</span>
          <span>Kavya_Report.pdf</span>
          <span>Family_Overview.pdf</span>
        </div>
        <button className="mp-toolbar-action" type="button" data-go={ROUTES.reports}>
          Open reports
        </button>
      </div>
    ),
  },
  {
    id: 4,
    label: 'Education',
    icon: 'book',
    content: () => (
      <div className="mp-toolbar-stack">
        <div className="mp-toolbar-text">Health guides in English, Hindi, and Gujarati.</div>
        <button className="mp-toolbar-action" type="button" data-go={ROUTES.education}>
          Browse education
        </button>
      </div>
    ),
  },
];

export default function ToolbarExpandable() {
  const navigate = useNavigate();
  const { member } = useMember();
  const [active, setActive] = useState(null);
  const [contentRef, { height: heightContent }] = useMeasure();
  const [menuRef, { width: widthContainer }] = useMeasure();
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [maxWidth, setMaxWidth] = useState(0);

  useClickOutside(ref, () => {
    setIsOpen(false);
    setActive(null);
  });

  useEffect(() => {
    if (!widthContainer || maxWidth > 0) return;
    setMaxWidth(widthContainer);
  }, [widthContainer, maxWidth]);

  const go = (route) => {
    setIsOpen(false);
    setActive(null);
    navigate(route);
  };

  return (
    <MotionConfig transition={transition}>
      <div className="mp-toolbar" ref={ref}>
        <div className="mp-toolbar-panel">
          <div className="overflow-hidden">
            <AnimatePresence initial={false} mode="sync">
              {isOpen ? (
                <motion.div
                  key="content"
                  initial={{ height: 0 }}
                  animate={{ height: heightContent || 0 }}
                  exit={{ height: 0 }}
                  style={{ width: maxWidth }}
                >
                  <div ref={contentRef} className="mp-toolbar-content">
                    {ITEMS.map((item) => {
                      const isSelected = active === item.id;
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isSelected ? 1 : 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <div
                            className={cn('mp-toolbar-item', isSelected ? 'block' : 'hidden')}
                            onClick={(e) => {
                              const goTo = e.target.closest('[data-go]')?.dataset.go;
                              if (goTo) go(goTo);
                            }}
                          >
                            {item.content(member)}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <div className="mp-toolbar-bar" ref={menuRef}>
            {ITEMS.map((item) => (
              <button
                key={item.id}
                aria-label={item.label}
                className={cn('mp-toolbar-btn', active === item.id && 'active')}
                type="button"
                onClick={() => {
                  if (!isOpen) setIsOpen(true);
                  if (active === item.id) {
                    setIsOpen(false);
                    setActive(null);
                    return;
                  }
                  setActive(item.id);
                }}
              >
                <Icon name={item.icon} size="md" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
