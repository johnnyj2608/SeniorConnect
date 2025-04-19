import React from 'react';
import { absence_types } from '../../utils/mapUtils';
import Dropdown from '../Dropdown';

const MemberAbsencesModal = ({ data, handleChange, activeTab }) => {
    const current = data[activeTab] || {};
 
    const disabled = data.filter(tab => !tab.deleted).length <= 0;

    return (
        <>
            <h3>Edit Absences</h3>
            <div className="member-detail">
                <label>Absence Type *</label>
                <Dropdown 
                    display={disabled ? '' : absence_types[current.absence_type]}
                    onChange={handleChange('absence_type')}
                    options={absence_types}
                    disabled={disabled}
                />
            </div>

            <div className="member-detail">
                <label>Start Date *</label>
                <input
                    type="date"
                    name="start_date"
                    value={disabled ? '' : current.start_date}
                    onChange={handleChange('start_date')}
                    disabled={disabled}
                />
            </div>

            <div className="member-detail">
                <label>End Date</label>
                <input
                    type="date"
                    name="end_date"
                    value={disabled ? '' : current.end_date}
                    onChange={handleChange('end_date')}
                    disabled={disabled}
                />
            </div>

            <div className="member-detail">
                <label>Note</label>
                <input
                    type="text"
                    value={disabled ? '' : current.note}
                    onChange={handleChange('note')}
                    autoComplete="off"
                    disabled={disabled}
                />
            </div>
        </>
    );
};

export default MemberAbsencesModal;