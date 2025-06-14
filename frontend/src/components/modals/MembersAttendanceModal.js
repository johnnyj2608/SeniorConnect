import React from 'react';
import { useTranslation } from 'react-i18next';
import CheckboxInput from '../inputs/CheckboxInput';
import ListDetail from '../layout/ListDetail';

const MembersAttendanceModal = ({ data, handleChange, mltcOptions }) => {
    const { t } = useTranslation();

    const attendanceLabels = [
        { key: 'mltc', label: t('members.mltc') },
        { key: 'individual', label: t('members.individual') }
    ];

    const tabContent = {
        mltc: (
            <CheckboxInput
                options={mltcOptions}
            />
        ),
        individual: <p>Individual</p>,
    };

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

            <ListDetail
                tabs={attendanceLabels}
                tabContent={tabContent}
            />
        </>
    );
};

export default MembersAttendanceModal;