import React from 'react';
import { addMember, loadMembers, refreshMembers, removeMember, updateMember } from './membersStore.js';

export const MemberContext = React.createContext({
  members: [],
  member: null,
  setMember: () => {},
  addMember: () => {},
  updateMember: () => {},
  removeMember: () => {},
});

export function MemberProvider({ children }) {
  const [members, setMembers] = React.useState([]);
  const [memberId, setMemberId] = React.useState(null);
  const member = (memberId && members.find((m) => m.id === memberId)) || members[0] || null;

  // Initial load from Supabase on mount
  React.useEffect(() => {
    refreshMembers().then((list) => {
      setMembers(list);
      if (list.length && !memberId) {
        setMemberId(list[0].id);
      }
    });
  }, []);

  const add = (profile) => {
    // addMember is synchronous-optimistic: returns localMember immediately
    const newMember = addMember(profile);
    // newMember is the Promise result — but addMember returns localMember synchronously
    // Because we made addMember non-blocking, we resolve it via .then
    Promise.resolve(newMember).then((m) => {
      setMembers(loadMembers());
    });
    // Return the promise so callers can get the id
    return Promise.resolve(newMember);
  };

  const update = (id, patch) => {
    updateMember(id, patch).then(() => {
      setMembers(loadMembers());
    });
  };

  const remove = (id) => {
    if (members.length <= 1) return;
    removeMember(id).then((remaining) => {
      setMembers(remaining);
      setMemberId((prevId) => {
        if (prevId !== id) return prevId;
        return remaining.length ? remaining[0].id : null;
      });
    });
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
