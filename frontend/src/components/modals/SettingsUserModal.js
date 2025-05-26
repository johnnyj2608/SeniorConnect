import React from 'react';

const roleTypes = [
    'Admin', 
    'Staff', 
];

const SettingsUserModal = ({ data, handleChange, activeTab }) => {
    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;

    return (
        <>
            <div className="member-detail modal-checkbox-heading">
            <h3>Edit Users</h3>
                <label>
                    <input
                        type="checkbox"
                        checked={disabled ? false : current.is_active === true }
                        onChange={(e) => handleChange('is_active')({ target: { value: e.target.checked } })}
                        disabled={disabled}
                    />
                Active
                </label>
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
                    disabled={disabled}
                />
            </div>
            <div className="member-detail">
                <label>Role Type *</label>
                <select 
                    value={disabled ? '' : current.role_type || ''} 
                    onChange={handleChange('role_type')} 
                    disabled={disabled}>
                <option value="">Select an option</option>
                {roleTypes.map((type) => (
                    <option key={type} value={type}>
                        {type}
                    </option>
                ))}
                </select>
            </div>
        </>
    );
};

export default SettingsUserModal;