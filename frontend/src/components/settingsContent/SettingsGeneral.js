import React, { useState, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext';
import SettingsItem from '../items/SettingsItem'

const SettingsGeneral = () => {
  const { user } = useContext(AuthContext);
  const [preferences, setPreferences] = useState(user?.preferences || {});

  const toggleDarkMode = async () => {
    const newPreferences = { ...preferences, dark_mode: !preferences.dark_mode };
    setPreferences(newPreferences);
    
    // update backend, update context, etc.
  };
  console.log(preferences)
  
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
