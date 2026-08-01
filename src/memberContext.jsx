import React from 'react';
import { FAMILY_MEMBERS, createFamilyMember } from './data/data.js';

const DEFAULT_ID = 'rajesh';

export const MemberContext = React.createContext({
  members: FAMILY_MEMBERS,
  member: FAMILY_MEMBERS.find((m) => m.id === DEFAULT_ID) || FAMILY_MEMBERS[0],
  setMember: () => {},
  addMember: () => {},
  updateMember: () => {},
  removeMember: () => {},
});

export function MemberProvider({ children }) {
  const [members, setMembers] = React.useState(FAMILY_MEMBERS);
  const [memberId, setMemberId] = React.useState(DEFAULT_ID);
  const member = members.find((m) => m.id === memberId) || members[0];

  const addMember = (profile) => {
    const newMember = createFamilyMember(profile);
    setMembers((prev) => [...prev, newMember]);
    return newMember;
  };

  const updateMember = (id, patch) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const removeMember = (id) => {
    setMembers((prev) => (prev.length <= 1 ? prev : prev.filter((m) => m.id !== id)));
    setMemberId((prevId) => {
      if (prevId !== id) return prevId;
      const remaining = members.filter((m) => m.id !== id);
      return remaining.length ? remaining[0].id : prevId;
    });
  };

  return (
    <MemberContext.Provider
      value={{ members, member, setMember: setMemberId, addMember, updateMember, removeMember }}
    >
      {children}
    </MemberContext.Provider>
  );
}

export function useMember() {
  return React.useContext(MemberContext);
}
