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

  React.useEffect(() => {
    refreshMembers().then((list) => {
      setMembers(list);
      if (list.length && !memberId) {
        setMemberId(list[0].id);
      }
    });
  }, []);

  const sync = () => setMembers(loadMembers());

  const add = async (profile) => {
    const newMember = await addMember(profile);
    await refreshMembers().then(setMembers);
    return newMember;
  };

  const update = async (id, patch) => {
    await updateMember(id, patch);
    await refreshMembers().then(setMembers);
  };

  const remove = async (id) => {
    if (members.length <= 1) return;
    await removeMember(id);
    const remaining = await refreshMembers();
    setMembers(remaining);
    setMemberId((prevId) => {
      if (prevId !== id) return prevId;
      return remaining.length ? remaining[0].id : null;
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
