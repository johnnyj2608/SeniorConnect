import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ListDetail from '../layout/ListDetail';
import NameDisplay from '../layout/NameDisplay';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const MembersAttendanceModal = ({ mltcOptions }) => {
    const { t } = useTranslation();
    const [selectedMltc, setSelectedMltc] = useState(0);
    const [members, setMembers] = useState({});
    const [selectedMember, setSelectedMember] = useState();

    useEffect(() => {
        const getMembers = async () => {
            const params = new URLSearchParams();
            if (selectedMltc) params.append('mltc', selectedMltc);

            try {
                const response = await fetchWithRefresh(`/core/members?${params.toString()}`);
                if (response.ok) {
                    const data = await response.json();
                    setMembers(data);
                }
            } catch (error) {
                console.error(error);
            }
        };

        getMembers();
    }, []);

    useEffect(() => {
        setSelectedMember(null);
    }, [selectedMltc]);

    const getFilteredMembers = () => {
        if (selectedMltc === 0) {
            return Object.entries(members)
                .filter(([key]) => key !== 'unknown')
                .flatMap(([, value]) => value);
        } else {
            const selectedMltcName = mltcOptions.find(m => m.id === selectedMltc)?.name;
            return members[selectedMltcName] || [];
        }
    };

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
                            className={selectedMltc === 0 ? 'selected' : ''}
                            onClick={() => setSelectedMltc(0)}
                        >
                            {t('members.all_mltcs')}
                        </li>
                        {mltcOptions.map((mltc) => (
                            <li
                                key={mltc.id}
                                className={selectedMltc === mltc.id ? 'selected' : ''}
                                onClick={() => setSelectedMltc(mltc.id)}
                            >
                                {mltc.name}
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
                        {getFilteredMembers().map((member) => (
                            <li
                                key={member.id}
                                className={selectedMember === member.id ? 'selected' : ''}
                                onClick={() => setSelectedMember(member.id)}
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