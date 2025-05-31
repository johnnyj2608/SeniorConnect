import React from 'react'
import SettingsItem from '../items/SettingsItem'

const SettingsSnapshots = () => {
  return (
    <>
      <h3 className="section-title">Snapshots</h3>
      <div className="section-main">
        <SettingsItem label="Members" onClick={()=>console.log("Members")} />
        <SettingsItem label="Birthdays" onClick={()=>console.log("Birthdays")} />
        <SettingsItem label="Absences" onClick={()=>console.log("Absences")} />
        <SettingsItem label="Enrollment" onClick={()=>console.log("Enrollment")} />
          {/* Dropdown to show year, then month */}
      </div>
    </>
  )
}

export default SettingsSnapshots
