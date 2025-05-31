import React from 'react';

const SettingsUserModal = ({ data, handleChange, activeTab }) => {
    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;
    const adminUser = current.is_org_admin;

    return (
        <>
            <div className="modal-header">
                <h3>Edit Users</h3>
                {!adminUser && (
                    <label>
                        <input
                            type="checkbox"
                            checked={disabled ? false : current.is_active === true}
                            onChange={(e) => handleChange('is_active')({ target: { value: e.target.checked } })}
                            disabled={disabled}
                        />
                        Active
                    </label>
                )}
            </div>
            <div className="member-detail">
                <label>Name *</label>
                <input
                    type="text"
                    value={disabled ? '' : current.name || ''}
                    onChange={handleChange('name')}
                    autoComplete="off"
                    disabled={disabled}
                />
            </div>
            <div className="member-detail">
                <label>Email *</label>
                <input
                    type="email"
                    value={disabled ? '' : current.email || ''}
                    onChange={handleChange('email')}
                    autoComplete="off"
                    disabled={disabled || adminUser}
                />
            </div>
        </>
    );
};

export default SettingsUserModal;