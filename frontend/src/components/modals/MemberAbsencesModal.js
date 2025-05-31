import React from 'react';

const absenceTypes = [
    'Vacation', 
    'Hospital', 
    'Personal', 
    'Other'
];

const MemberAbsencesModal = ({ data, handleChange, activeTab }) => {
    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;

    return (
        <>
            <div className="modal-header">
            <h3>Edit Absences</h3>
                <label>
                    <input
                       type="checkbox"
                            checked={disabled ? false : current.called === true}
                            onChange={(e) => handleChange('called')({ target: { value: e.target.checked } })}
                            disabled={disabled}
                    />
                Called
                </label>
            </div>
            <div className="member-detail">
                <label>Absence Type *</label>
                <select 
                    value={disabled ? '' : current.absence_type || ''} 
                    onChange={handleChange('absence_type')} 
                    disabled={disabled}>
                <option value="">Select an option</option>
                {absenceTypes.map((type) => (
                    <option key={type} value={type}>
                        {type}
                    </option>
                ))}
                </select>
            </div>

            <div className="member-detail">
                <label>Start Date *</label>
                <input
                    type="date"
                    value={disabled ? '' : current.start_date || ''}
                    onChange={handleChange('start_date')}
                    disabled={disabled}
                />
            </div>

            <div className="member-detail">
                <label>End Date</label>
                <input
                    type="date"
                    value={disabled ? '' : current.end_date || ''}
                    onChange={handleChange('end_date')}
                    disabled={disabled}
                />
            </div>

            <div className="member-detail">
                <label>Note</label>
                <input
                    type="text"
                    value={disabled ? '' : current.note || ''}
                    onChange={handleChange('note')}
                    autoComplete="off"
                    disabled={disabled}
                />
            </div>
        </>
    );
};

export default MemberAbsencesModal;