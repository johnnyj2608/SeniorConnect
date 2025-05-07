import React from 'react'

const SettingsPage = () => {
  return (
    <>
        <div className="page-header">
            <div className="page-title-row">
                <h2 className="page-title">&#9782; Settings</h2>
            </div>
        </div>

        <div className="settings-content">
            <h3 className="section-title">General</h3>
            <ul className="settings-list">
                <li>Notifications</li>
                <li>Dark Mode</li>
                <li>Localization</li>
            </ul>
        </div>

        <div className="settings-content">
            <h3 className="section-title">Snapshots</h3>
            <ul className="settings-list">
                <li>Archived Reports (X frequency)</li>
            </ul>
        </div>

        <div className="settings-content">
            <h3 className="section-title">Support</h3>
            <ul className="settings-list">
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
                <li>Support</li>
            </ul>
        </div>

        <div className="settings-content">
            <h3 className="section-title">Account</h3>
            <ul className="settings-list">
                <li>Log out</li>
            </ul>
        </div>
    </>
  )
}

export default SettingsPage