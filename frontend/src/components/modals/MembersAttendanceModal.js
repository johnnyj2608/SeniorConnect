import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ListDetail from '../layout/ListDetail';
import NameDisplay from '../layout/NameDisplay';

const MembersAttendanceModal = ({ members, addQueue }) => {
    const { t } = useTranslation();
    const [selectedMltc, setSelectedMltc] = useState('all');
    const [selectedMember, setSelectedMember] = useState();

    const displayedMembers = selectedMltc === 'all'
        ? Object.values(members).flat()
        : members[selectedMltc] || [];

    return (
        <>
            <div className="modal-header">
                <h3>{t('general.buttons.attendance_sheets')}</h3>
            </div>

            <ListDetail 
                label={t('general.month.label')}
                value={<input type="month" />}
            />

            <div className="member-box-list-container">
                <div className="member-box-list">
                    <div className="member-box-list-label">{t('model.mltc')}</div>
                    <ul className="member-box-list-items">
                        <li
                            key="all-mltc"
                            className={selectedMltc === 'all' ? 'selected' : ''}
                            onClick={() => {
                                if (selectedMltc !== 'all') {
                                    setSelectedMltc('all');
                                    setSelectedMember(undefined);
                                }
                            }}
                        >
                            {t('members.all_mltcs')}
                        </li>
                        {Object.keys(members).map((mltcName) => (
                            <li
                                key={mltcName}
                                className={selectedMltc === mltcName ? 'selected' : ''}
                                onClick={() => {
                                    if (selectedMltc !== mltcName) {
                                        setSelectedMltc(mltcName);
                                        setSelectedMember(undefined);
                                    }
                                }}
                            >
                                {mltcName}
                            </li>
                        ))}
                    </ul>
                    <button className="action-button thin">
                        {t('general.buttons.add_mltc')}
                    </button>
                </div>
                <div className="member-box-list">
                    <div className="member-box-list-label">{t('model.member')}</div>
                    <ul className="member-box-list-items">
                        {displayedMembers.map((member) => (
                            <li
                                key={member.id}
                                className={selectedMember?.id === member.id ? 'selected' : ''}
                                onClick={() => setSelectedMember(member)}
                            >
                                <NameDisplay
                                    sadcId={member.sadc_member_id}
                                    memberName={`${member.last_name}, ${member.first_name}`}
                                    altName={member.alt_name}
                                />
                            </li>
                        ))}
                    </ul>
                    <button className="action-button thin">
                        {t('general.buttons.add_member')}
                    </button>
                </div>
            </div>
        </>
    );
};

export default MembersAttendanceModal;