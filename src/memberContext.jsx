import React from 'react';
import { addMember, loadMembers, refreshMembers, removeMember, updateMember } from './membersStore.js';

const DEFAULT_ID = 'rajesh';

export const MemberContext = React.createContext({
  members: loadMembers(),
  member: loadMembers().find((m) => m.id === DEFAULT_ID) || loadMembers()[0],
  setMember: () => {},
  addMember: () => {},
  updateMember: () => {},
  removeMember: () => {},
});

export function MemberProvider({ children }) {
  const [members, setMembers] = React.useState(loadMembers);
  const [memberId, setMemberId] = React.useState(DEFAULT_ID);
  const member = members.find((m) => m.id === memberId) || members[0];

  React.useEffect(() => {
    refreshMembers().then(setMembers);
  }, []);

  const sync = () => setMembers(loadMembers());

  const add = (profile) => {
    const newMember = addMember(profile);
    sync();
    return newMember;
  };

  const update = (id, patch) => {
    updateMember(id, patch);
    sync();
  };

  const remove = (id) => {
    if (members.length <= 1) return;
    removeMember(id);
    setMemberId((prevId) => {
      if (prevId !== id) return prevId;
      const remaining = loadMembers();
      return remaining.length ? remaining[0].id : prevId;
    });
    sync();
  };

  return (
    <MemberContext.Provider value={{ members, member, setMember: setMemberId, addMember: add, updateMember: update, removeMember: remove }}>
      {children}
    </MemberContext.Provider>
  );
}

export function useMember() {
  return React.useContext(MemberContext);
}
