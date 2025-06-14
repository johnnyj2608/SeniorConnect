import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const MembersAttendanceModal = ({ data, handleChange, mltcOptions }) => {
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState('mltc');

    const attendanceLabels = [
        { key: 'mltc', label: t('members.mltc') },
        { key: 'individual', label: t('members.individual') }
    ];

    return (
        <>
            <div className="modal-header">
                <h3>{t('general.buttons.attendance_sheets')}</h3>
            </div>
            <div className="member-box">
                <label className="member-box-label">{t('general.month.label')}</label>
                <div className="member-box-list">
                    <input
                        type="month"
                    />
                </div>
            </div>
            <div className="member-box">
                <div className="member-box-label">
                    {attendanceLabels.map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setActiveTab(key)}
                            className={`member-box-tab ${activeTab === key ? 'active' : ''}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="member-box-list">
                {activeTab === 'mltc' ? (
                    <div className="checkbox-container">
                        {mltcOptions.map(({ id, name }) => (
                            <label key={id}>
                                <input
                                    type="checkbox"
                                    value={id}
                                />
                                {name}
                            </label>
                        ))}
                    </div>
                ) : (
                    <p>Individual</p>
                )}
                </div>
            </div>
        </>
    );
};

export default MembersAttendanceModal;