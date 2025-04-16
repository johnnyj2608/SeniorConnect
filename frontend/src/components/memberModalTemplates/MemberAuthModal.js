import React, { useState, useEffect } from 'react';
import Dropdown from '../Dropdown';

const MemberAuthModal = ({ data, handleChange, activeTab }) => {
    const [mltcOptions, setMltcOptions] = useState([]);
    const current = data[activeTab] || {};

    useEffect(() => {
        const getMltcOptions = async () => {
            const response = await fetch('/core/mltcs/');
            const data = await response.json();
            setMltcOptions(data);
        };
        
        getMltcOptions()
    }, []);

    const selectedMltc = mltcOptions.find(mltc => mltc.name === current.mltc);
    const dx_codes = selectedMltc?.dx_codes

    const daysOfWeek = [
        { label: "Monday", value: "Monday" },
        { label: "Thursday", value: "Thursday" },
        { label: "Tuesday", value: "Tuesday" },
        { label: "Friday", value: "Friday" },
        { label: "Wednesday", value: "Wednesday" },
        { label: "Saturday", value: "Saturday" },
        { label: "Sunday", value: "Sunday" },
    ];

    const disabled = data.filter(tab => !tab.deleted).length <= 0

    return (
        <>
            <div className="member-detail modal-auth-heading">
            <h3>Edit Authorization</h3>
                <label>
                    <input
                        type="checkbox"
                        name="active"
                        checked={current.active === true}
                        onChange={(e) => handleChange('active')({ target: { value: e.target.checked } })}
                        disabled={disabled}
                    />
                Active
                </label>
            </div>
            <div className="member-detail">
                <label>Member ID *</label>
                <input
                    type="text"
                    name="mltc_member_id"
                    value={current.mltc_member_id || ''}
                    onChange={handleChange('mltc_member_id')}
                    placeholder="Required"
                    disabled={disabled}
                />
            </div>
            <div className="member-detail">
                <label>MLTC *</label>
                <Dropdown 
                    display={current.mltc || 0} 
                    onChange={handleChange('mltc')}
                    options={mltcOptions}
                    disabled={disabled}
                />
            </div>
            <div className="member-detail">
                <label>Auth ID *</label>
                <input
                    type="text"
                    name="mltc_auth_id"
                    value={current.mltc_auth_id || ''}
                    onChange={handleChange('mltc_auth_id')}
                    placeholder="Required"
                    disabled={disabled}
                />
            </div>
            <div className="member-detail">
                <label>Schedule</label>
                <div className="schedule-container">
                    {daysOfWeek.map(day => (
                        <label key={day.value}>
                            <input
                                type="checkbox"
                                name="schedule"
                                value={day.value}
                                checked={current.schedule?.includes(day.value) || false}
                                onChange={handleChange('schedule')}
                                disabled={disabled}
                            />
                            {day.label}
                        </label>
                    ))}
                </div>
            </div>
            <div className="member-detail">
                <label>Start Date *</label>
                <input
                    type="date"
                    name="start_date"
                    value={current.start_date || ''}
                    onChange={handleChange('start_date')}
                    disabled={disabled}
                />
            </div>
            <div className="member-detail">
                <label>End Date *</label>
                <input
                    type="date"
                    name="end_date"
                    value={current.end_date || ''}
                    onChange={handleChange('end_date')}
                    disabled={disabled}
                />
            </div>
            <div className="member-detail">
                <label>DX Code</label>
                <Dropdown 
                    display={dx_codes?.includes(current.dx_code) 
                        ? current.dx_code 
                        : 0}
                    onChange={handleChange('dx_code')}
                    options={dx_codes}
                    disabled={disabled}
                />
            </div>
            <div className="member-detail">
                <label>SDC Code</label>
                <input
                    type="text"
                    name="sdc_code"
                    value={current.sdc_code || ''}
                    onChange={handleChange('sdc_code')}
                    disabled={disabled}
                />
            </div>
            <div className="member-detail">
                <label>Trans Code</label>
                <input
                    type="text"
                    name="trans_code"
                    value={current.trans_code || ''}
                    onChange={handleChange('trans_code')}
                    disabled={disabled}
                />
            </div>
        </>
    );
};

export default MemberAuthModal;
