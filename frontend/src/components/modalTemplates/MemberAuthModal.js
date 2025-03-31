import React, { useState, useEffect } from 'react';
import MltcDropdown from '../MltcDropdown';

const MemberAuthModal = ({ data, handleChange }) => {
    const [mltcOptions, setMltcOptions] = useState([]);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        getMltcOptions()
    }, []);

    const getMltcOptions = async () => {
        const response = await fetch('/core/mltc/');
        const data = await response.json();
        setMltcOptions(data);
    };

    const daysOfWeek = [
        { label: "Sunday", value: "sunday" },
        { label: "Monday", value: "monday" },
        { label: "Tuesday", value: "tuesday" },
        { label: "Wednesday", value: "wednesday" },
        { label: "Thursday", value: "thursday" },
        { label: "Friday", value: "friday" },
        { label: "Saturday", value: "saturday" }
    ];

    return (
        <div className="modal-tabs">
            <div className="modal-content">
                <h3>Edit Authorization</h3>
                <div className="member-detail">
                    <label>Member ID</label>
                    <input
                        type="text"
                        name="mltc_member_id"
                        value={data[activeTab]?.mltc_member_id || ''}
                        onChange={handleChange('mltc_member_id')}
                    />
                </div>
                <div className="member-detail">
                    <label>MLTC:</label>
                    <MltcDropdown 
                        value={data[activeTab]?.mltc_id} 
                        onChange={handleChange('mltc_id')} 
                        options={mltcOptions} 
                    />
                </div>
                <div className="member-detail">
                    <label>Auth ID</label>
                    <input
                        type="text"
                        name="mltc_auth_id"
                        value={data[activeTab]?.mltc_auth_id || ''}
                        onChange={handleChange('mltc_auth_id')}
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
                    <label>Start Date</label>
                    <input
                        type="date"
                        name="start_date"
                        value={data[activeTab]?.start_date || ''}
                        onChange={handleChange('start_date')}
                    />
                </div>
                <div className="member-detail">
                    <label>End Date</label>
                    <input
                        type="date"
                        name="end_date"
                        value={data[activeTab]?.end_date || ''}
                        onChange={handleChange('end_date')}
                    />
                </div>
                <div className="member-detail">
                    <label>Diagnosis</label>
                    <input
                        type="text"
                        name="diagnosis"
                        value={data[activeTab]?.diagnosis?.dx_code || ''}
                        onChange={handleChange('diagnosis')}
                    />
                </div>
                <div className="member-detail">
                    <label>SDC Code</label>
                    <input
                        type="text"
                        name="social_day_care_code"
                        value={data[activeTab]?.social_day_care_code || ''}
                        onChange={handleChange('social_day_care_code')}
                    />
                </div>
                <div className="member-detail">
                    <label>Trans Code</label>
                    <input
                        type="text"
                        name="transportation_code"
                        value={data[activeTab]?.transportation_code || ''}
                        onChange={handleChange('transportation_code')}
                    />
                </div>
            </div>
            <div className="modal-tabs-list">
                {Object.values(data).map((auth, index) => (
                    <button 
                        key={index} 
                        className={`tab-button ${activeTab === index ? 'active' : ''}`} 
                        onClick={() => setActiveTab(index)}
                    >
                        Auth {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MemberAuthModal;
