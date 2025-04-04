import React, { useState, useEffect } from 'react';
import Dropdown from '../Dropdown';

const MemberAuthModal = ({ data, handleChange, activeTab }) => {
    const [mltcOptions, setMltcOptions] = useState([]);
    const [dxCodes, setDxCodes] = useState([]);

    useEffect(() => {
        getMltcOptions()
    }, []);

    const getMltcOptions = async () => {
        const response = await fetch('/core/mltcs/');
        const data = await response.json();
        setMltcOptions(data);
    };

    const handleMltcChange = async (mltcName) => {
        const selectedMltc = mltcOptions.find(mltc => mltc.name === mltcName);
        if (selectedMltc) {
            setDxCodes(selectedMltc.dx_codes);
        } else {
            setDxCodes([]);
        }
    };

    useEffect(() => {
        if (data[activeTab]?.mltc) {
            handleMltcChange(data[activeTab].mltc);
        }
    }, [mltcOptions]);

    const daysOfWeek = [
        { label: "Monday", value: "monday" },
        { label: "Thursday", value: "thursday" },
        { label: "Tuesday", value: "tuesday" },
        { label: "Friday", value: "friday" },
        { label: "Wednesday", value: "wednesday" },
        { label: "Saturday", value: "saturday" },
        { label: "Sunday", value: "sunday" },
    ];

    return (
        <>
            <h3>Edit Authorization</h3>
            <div className="member-detail">
                <label>Member ID *</label>
                <input
                    type="text"
                    name="mltc_member_id"
                    value={data[activeTab]?.mltc_member_id || ''}
                    onChange={handleChange('mltc_member_id')}
                    placeholder="Required"
                />
            </div>
            <div className="member-detail">
                <label>MLTC *</label>
                <Dropdown 
                    value={data[activeTab]?.mltc || 0} 
                    onChange={(e) => {
                        handleChange('mltc')(e);
                        handleMltcChange(e.target.value);
                    }}
                    options={mltcOptions} 
                />
            </div>
            <div className="member-detail">
                <label>Auth ID *</label>
                <input
                    type="text"
                    name="mltc_auth_id"
                    value={data[activeTab]?.mltc_auth_id || ''}
                    onChange={handleChange('mltc_auth_id')}
                    placeholder="Required"
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
                                checked={data[activeTab]?.schedule?.includes(day.value) || false}
                                onChange={handleChange('schedule')}
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
                    value={data[activeTab]?.start_date || ''}
                    onChange={handleChange('start_date')}
                />
            </div>
            <div className="member-detail">
                <label>End Date *</label>
                <input
                    type="date"
                    name="end_date"
                    value={data[activeTab]?.end_date || ''}
                    onChange={handleChange('end_date')}
                />
            </div>
            <div className="member-detail">
                <label>DX Code</label>
                <Dropdown 
                    value={data[activeTab]?.dx_code || 0} 
                    onChange={handleChange('dx_code')}
                    options={dxCodes}
                    disabled={dxCodes.length === 0}
                />
            </div>
            <div className="member-detail">
                <label>SDC Code</label>
                <input
                    type="text"
                    name="sdc_code"
                    value={data[activeTab]?.sdc_code || ''}
                    onChange={handleChange('sdc_code')}
                />
            </div>
            <div className="member-detail">
                <label>Trans Code</label>
                <input
                    type="text"
                    name="trans_code"
                    value={data[activeTab]?.trans_code || ''}
                    onChange={handleChange('trans_code')}
                />
            </div>
        </>
    );
};

export default MemberAuthModal;
