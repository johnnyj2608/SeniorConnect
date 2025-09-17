import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import fetchWithRefresh from '../utils/fetchWithRefresh';
import { useNavigate } from 'react-router-dom';

const useMembers = (id, setMemberData) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loadingRef = useRef(false);

  const handleDelete = useCallback(async () => {
    if (!id || loadingRef.current) return;
    loadingRef.current = true;

    const action = t('general.buttons.delete');
    const isConfirmed = window.confirm(t('member.confirm_update', { action: action.toLowerCase() }));
    if (!isConfirmed) {
      loadingRef.current = false;
      return;
    }

    try {
      const response = await fetchWithRefresh(`/core/members/${id}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setMemberData(null);
        navigate('/members');
      }
    } catch (error) {
      console.error(error);
    } finally {
      loadingRef.current = false;
    }
  }, [id, navigate, t, setMemberData]);

  const handleStatus = useCallback(async () => {
    if (!id || loadingRef.current) return;
    loadingRef.current = true;

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
    } finally {
      loadingRef.current = false;
    }
  }, [id, setMemberData]);

  return { handleDelete, handleStatus };
};

export default useMembers;