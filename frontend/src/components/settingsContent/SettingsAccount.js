import React, { useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const SettingsAccount = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      const response = await fetchWithRefresh('/user/auth/logout/', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Logout failed');

      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed. Please try again.');
    }
  }, [setUser, navigate]);

  const handleResetPassword = () => {
    alert('Password reset instructions was sent to your email');
  };

  return (
    <>
      <h3 className="section-title">Account</h3>
      <div className="section-main">
        <button className="action-button" onClick={handleResetPassword}>
          Reset Password
        </button>

        <button className="action-button destructive" onClick={handleLogout}>
            Log Out
        </button>
      </div>
    </>
  );
};

export default SettingsAccount;