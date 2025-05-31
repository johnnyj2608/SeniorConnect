import React from 'react';

const SettingsMltcModal = ({ data, handleChange, activeTab }) => {
    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;

    return (
        <>
            <div className="modal-header">
                <h3>Edit Mltcs</h3>
                <label>
                    <input
                        type="checkbox"
                        checked={disabled ? false : current.active === true}
                        onChange={(e) => handleChange('active')({ target: { value: e.target.checked } })}
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
        </>
    );
};

export default SettingsMltcModal;