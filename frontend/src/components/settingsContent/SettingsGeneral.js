import React from 'react'
import SettingsItem from '../items/SettingsItem'

const SettingsGeneral = () => {
  return (
    <>
      <h3 className="section-title">General</h3>
      <div className="section-main">
        <SettingsItem label="Notification" onClick={()=>console.log("Notification")} />
        <SettingsItem label="Dark Mode" onClick={()=>console.log("Dark Mode")} />
        <SettingsItem label="Language" onClick={()=>console.log("Language")} />
      </div>
    </>
  )
}

export default SettingsGeneral
