import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ListDetail from '../layout/ListDetail';
import NameDisplay from '../layout/NameDisplay';
import mergeSortedArrays from '../../utils/mergeSortedArrays';

const MembersAttendanceModal = ({ members, onMonthChange, addQueue, addMltcQueue }) => {
    const { t } = useTranslation();
    const [selectedMltc, setSelectedMltc] = useState('all');
    const [selectedMember, setSelectedMember] = useState();

    const displayedMltcs = Object.keys(members)
        .filter(mltcName => members[mltcName].length > 0);

    const sortedArrays = Object.values(members);
    const displayedMembers = selectedMltc === 'all'
        ? mergeSortedArrays(sortedArrays, m => Number(m.sadc_member_id))
        : members[selectedMltc] || [];

    const handleAddQueue = () => {
        if (selectedMember) {
            addQueue(selectedMember, selectedMember.mltc_name);
        } else if (selectedMltc === 'all') {
            displayedMltcs.forEach((mltcName) => {
                addMltcQueue(mltcName);
            });
        } else {
            addMltcQueue(selectedMltc);
        }
        setSelectedMember(undefined);
    };

    return (
        <>
            <div className="modal-header">
                <h3>{t('general.buttons.attendance_sheets')}</h3>
            </div>

            <ListDetail 
                label={t('general.month.label')}
                value={
                    <input 
                        type="month" 
                        defaultValue={new Date().toISOString().slice(0, 7)} 
                        onChange={(e) => onMonthChange(e.target.value)}
                    />
                }
            />

            <div className="member-box-list-container">
                <div className="member-box-list">
                    <div className="member-box-list-label">{t('model.mltc')}</div>
                    <ul className="member-box-list-items">
                        {displayedMltcs.length > 0 && (
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
                        )}
                        {displayedMltcs.map((mltcName) => (
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
                   
                </div>
            </div>
            <div className="member-row">
                <button 
                    className="action-button thin md"
                    disabled={displayedMltcs.length === 0}
                    onClick={handleAddQueue}
                >
                    {selectedMember
                        ? t('general.buttons.add_member')
                        : selectedMltc === 'all'
                        ? t('general.buttons.add_all')
                        : t('general.buttons.add_mltc')}
                </button>
            </div>
        </>
    );
};

export default MembersAttendanceModal;