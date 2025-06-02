import React, { useState, useEffect } from 'react';
import { sortSchedule } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const daysOfWeek = [
    "Monday",
    "Thursday",
    "Tuesday",
    "Friday",
    "Wednesday",
    "Saturday",
    "Sunday"
];

const MemberAuthModal = ({ data, handleChange, activeTab, handleActiveToggle }) => {
    const [mltcOptions, setMltcOptions] = useState([]);
    const current = data[activeTab] || {};

    useEffect(() => {
        const getMltcOptions = async () => {
            try {
                const response = await fetchWithRefresh('/core/mltcs/');
                if (!response.ok) return;

                const data = await response.json();
                setMltcOptions(data);
            } catch (error) {
                console.error('Failed to fetch MLTC options:', error);
            }
        };

        getMltcOptions();
    }, []);

    const selectedMltc = mltcOptions.find(mltc => mltc.name === current.mltc);
    const dx_codes = selectedMltc?.dx_codes || [];

    const handleScheduleChange = (day) => (event) => {
        const { checked } = event.target;
        const currentSchedule = current.schedule || [];

        const newSchedule = checked
            ? [...currentSchedule, day]
            : currentSchedule.filter(d => d !== day);
        const sortedSchedule = sortSchedule(newSchedule);

        handleChange('schedule')({ target: { value: sortedSchedule } });
    };

    const disabled = data.filter(tab => !tab.deleted).length <= 0

    return (
        <>
            <div className="modal-header">
            <h3>Edit Authorization</h3>
                <label>
                    <input
                        type="checkbox"
                        checked={disabled ? false : current.active === true }
                        onChange={(e) => handleActiveToggle(e.target.checked)}
                        disabled={disabled}
                    />
                Active
                </label>
            </div>
            <div className="member-detail">
                <label>Member ID *</label>
                <input
                    type="text"
                    value={disabled ? '' : current.mltc_member_id || ''}
                    onChange={handleChange('mltc_member_id')}
                    placeholder="Required"
                    autoComplete="off"
                    disabled={disabled}
                />
            </div>
            <div className="member-detail">
                <label>MLTC *</label>
                <select 
                    required
                    value={disabled ? '' : current.mltc || ''} 
                    onChange={(e) => {
                        handleChange('mltc')(e);
                        handleChange('dx_code')({target: { value: '' }});
                    }}
                    disabled={disabled}
                >
                    <option value="">Select an option</option>
                    {mltcOptions.map((option) => (
                        <option key={option.name} value={option.name}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="member-detail">
                <label>Auth ID *</label>
                <input
                    type="text"
                    value={disabled ? '' : current.mltc_auth_id || ''}
                    onChange={handleChange('mltc_auth_id')}
                    placeholder="Required"
                    autoComplete="off"
                    disabled={disabled}
                />
            </div>
            <div className="member-detail">
                <label>Schedule</label>
                <div className="schedule-container">
                    {daysOfWeek.map(day => (
                    <label key={day}>
                        <input
                            type="checkbox"
                            value={day}
                            checked={disabled ? false : current.schedule?.includes(day) || false}
                            onChange={handleScheduleChange(day)}
                            disabled={disabled}
                        />
                        {day}
                    </label>
                ))}
                </div>
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
                <label>End Date *</label>
                <input
                    type="date"
                    value={disabled ? '' : current.end_date || ''}
                    onChange={handleChange('end_date')}
                    disabled={disabled}
                />
            </div>
            <div className="member-detail">
                <label>DX Code</label>
                <select 
                    required 
                    value={!disabled && dx_codes?.includes(current.dx_code) ? current.dx_code : 0 || ''}
                    onChange={handleChange('dx_code')}
                    disabled={disabled}
                >
                    <option value="">Select an option</option>
                    {dx_codes.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
            <div className="member-detail">
                <label>SDC Code</label>
                <input
                    type="text"
                    value={disabled ? '' : current.sdc_code || ''}
                    onChange={handleChange('sdc_code')}
                    autoComplete="off"
                    disabled={disabled}
                />
            </div>
            <div className="member-detail">
                <label>Trans Code</label>
                <input
                    type="text"
                    value={disabled ? '' : current.trans_code || ''}
                    onChange={handleChange('trans_code')}
                    autoComplete="off"
                    disabled={disabled}
                />
            </div>
        </>
    );
};

export default MemberAuthModal;