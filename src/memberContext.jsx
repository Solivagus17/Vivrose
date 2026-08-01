import React from 'react';
import { addMember, loadMembers, refreshMembers, removeMember, updateMember } from './membersStore.js';
import { useAuth } from './authContext.jsx';

export const MemberContext = React.createContext({
  members: [],
  member: null,
  setMember: () => {},
  addMember: () => {},
  updateMember: () => {},
  removeMember: () => {},
});

export function MemberProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [members, setMembers] = React.useState([]);
  const [memberId, setMemberId] = React.useState(null);
  const member = (memberId && members.find((m) => m.id === memberId)) || members[0] || null;

  // Initial load from Supabase backend after auth is ready
  React.useEffect(() => {
    if (authLoading) return;
    refreshMembers().then((list) => {
      setMembers(list || []);
      if (list && list.length && !memberId) {
        setMemberId(list[0].id);
      }
    });
  }, [authLoading]);


  const add = async (profile) => {
    const created = await addMember(profile);
    setMembers(loadMembers());
    if (created && created.id) setMemberId(created.id);
    return created;
  };

  const update = async (id, patch) => {
    await updateMember(id, patch);
    setMembers(loadMembers());
  };

  const remove = async (id) => {
    const remaining = await removeMember(id);
    const nextList = Array.isArray(remaining) ? remaining : loadMembers();
    setMembers(nextList);
    setMemberId((prevId) => {
      if (prevId !== id) return prevId;
      return nextList.length ? nextList[0].id : null;
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
