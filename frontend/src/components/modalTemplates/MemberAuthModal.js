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

    const tabsData = [
        { id: 'new', label: 'New', data: {} },
        ...Object.values(data)
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
                        value={tabsData[activeTab]?.mltc_member_id || ''}
                        onChange={handleChange('mltc_member_id')}
                    />
                </div>
                <div className="member-detail">
                    <label>MLTC:</label>
                    <MltcDropdown 
                        value={tabsData[activeTab]?.mltc_id} 
                        onChange={handleChange('mltc_id')} 
                        options={mltcOptions} 
                    />
                </div>
                <div className="member-detail">
                    <label>Auth ID</label>
                    <input
                        type="text"
                        name="mltc_auth_id"
                        value={tabsData[activeTab]?.mltc_auth_id || ''}
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
                                    checked={tabsData[activeTab]?.schedule?.includes(day.value) || false}
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
                        value={tabsData[activeTab]?.start_date || ''}
                        onChange={handleChange('start_date')}
                    />
                </div>
                <div className="member-detail">
                    <label>End Date</label>
                    <input
                        type="date"
                        name="end_date"
                        value={tabsData[activeTab]?.end_date || ''}
                        onChange={handleChange('end_date')}
                    />
                </div>
                <div className="member-detail">
                    <label>Diagnosis</label>
                    <input
                        type="text"
                        name="diagnosis"
                        value={tabsData[activeTab]?.diagnosis?.dx_code || ''}
                        onChange={handleChange('diagnosis')}
                    />
                </div>
                <div className="member-detail">
                    <label>SDC Code</label>
                    <input
                        type="text"
                        name="sdc_code"
                        value={tabsData[activeTab]?.sdc_code || ''}
                        onChange={handleChange('sdc_code')}
                    />
                </div>
                <div className="member-detail">
                    <label>Trans Code</label>
                    <input
                        type="text"
                        name="trans_code"
                        value={tabsData[activeTab]?.trans_code || ''}
                        onChange={handleChange('trans_code')}
                    />
                </div>
            </div>
            <div className="modal-tabs-list">
                {tabsData.map((tab, index) => (
                    <button 
                        key={index} 
                        className={`tab-button ${activeTab === index ? 'active' : ''}`} 
                        onClick={() => setActiveTab(index)}
                    >
                        {index === 0 ? 'New' : `Auth ${index}`}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MemberAuthModal;
