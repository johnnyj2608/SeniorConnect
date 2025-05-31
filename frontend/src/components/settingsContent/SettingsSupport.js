import React from 'react'
import SettingsItem from '../items/SettingsItem'

const SettingsSupport = () => {
  return (
    <>
      <h3 className="section-title">Support</h3>
      <div className="section-main">
        <SettingsItem label="Terms of Service" onClick={()=>console.log("Terms of Service")} />
        <SettingsItem label="Privacy Policy" onClick={()=>console.log("Privacy Policy")} />
        <SettingsItem label="Help Center" onClick={()=>console.log("Help Center")} />
      </div>
    </>
  )
}

export default SettingsSupport