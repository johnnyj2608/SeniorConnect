import { useCallback } from 'react';
import fetchWithRefresh from '../utils/fetchWithRefresh';
import { useNavigate } from 'react-router-dom';

const useMembers = (id, setMemberData, t) => {
  const navigate = useNavigate();

  const handleDelete = useCallback(async () => {
    if (!id) return;

    const action = t('general.buttons.delete');
    const isConfirmed = window.confirm(t('member.confirm_update', { action: action.toLowerCase() }));
    if (!isConfirmed) return;

    try {
      const response = await fetchWithRefresh(`/core/members/${id}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        navigate('/members');
      }
    } catch (error) {
      console.error(error);
    }
  }, [id, navigate, t]);

  const handleStatus = useCallback(async () => {
    if (!id) return;

    try {
      const response = await fetchWithRefresh(`/core/members/${id}/status/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const updated = await response.json();
        setMemberData(prev => ({
          ...prev,
          info: { ...prev.info, active: updated.active },
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }, [id, setMemberData]);

  return { handleDelete, handleStatus };
};

export default useMembers