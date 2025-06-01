import React, { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext';
import SettingsItem from '../items/SettingsItem'
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const SettingsGeneral = () => {
  const { user, setUser } = useContext(AuthContext);

  const toggleDarkMode = async () => {
    const updatedDarkMode = !user.preferences?.dark_mode;
    const updatedPreferences = {
      ...user.preferences,
      dark_mode: updatedDarkMode,
    };
    
    try {
      const response = await fetchWithRefresh(`/user/users/${user.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: updatedPreferences }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem("dark_mode", updatedDarkMode);
      } else {
        console.error("Failed to update preferences", await response.text());
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
    }
  };
  
  return (
    <>
      <h3 className="section-title">General</h3>
      <div className="section-main">
        <SettingsItem label="Notification" onClick={()=>console.log("Notification")} />
        <SettingsItem label="Dark Mode" onClick={toggleDarkMode} />
        <SettingsItem label="Language" onClick={()=>console.log("Language")} />
      </div>
    </>
  )
}

export default SettingsGeneral
