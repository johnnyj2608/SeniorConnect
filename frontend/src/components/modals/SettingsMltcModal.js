import React from 'react';

const SettingsMltcModal = ({ data, handleChange, activeTab }) => {
    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;

    const updateDxCodes = (newCodes) => {
        handleChange('dx_codes')({ target: { value: newCodes } });
    };

    const handleDxCodeChange = (index) => (e) => {
        const newCodes = [...current.dx_codes];
        newCodes[index] = e.target.value;
        updateDxCodes(newCodes);
    };

    const addDxCode = () => {
        updateDxCodes([...current.dx_codes, '']);
    };

    const removeDxCode = (index) => () => {
        const newCodes = current.dx_codes.filter((_, i) => i !== index);
        updateDxCodes(newCodes);
    };

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

            <div className="member-detail">
                <label>DX Codes</label>
                <div className="dx-container">
                    <div className="codes-container">
                        {current.dx_codes?.map((code, index) => (
                            <div key={index}>
                                <input key={index}
                                    type="text"
                                    value={code}
                                    onChange={handleDxCodeChange(index)}
                                    disabled={disabled}
                                />
                                <button type="button" onClick={removeDxCode(index)} disabled={disabled}>—</button>
                            </div>
                        ))}
                    </div>
                    {!disabled && (
                        <span onClick={addDxCode}>Click to add more</span>
                    )}
                </div>
            </div>
        </>
    );
};

export default SettingsMltcModal;