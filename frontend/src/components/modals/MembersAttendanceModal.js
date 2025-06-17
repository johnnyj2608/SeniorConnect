import React from 'react';
import { useTranslation } from 'react-i18next';
import ListDetail from '../layout/ListDetail';

const MembersAttendanceModal = ({ data, handleChange, mltcOptions }) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="modal-header">
                <h3>{t('general.buttons.attendance_sheets')}</h3>
            </div>

            <div className="member-box">
                <label className="member-box-label">{t('general.month.label')}</label>
                <div className="member-box-content">
                    <input
                        type="month"
                    />
                </div>
            </div>

            <ListDetail
                label={t('general.members')}
                value={
                    <div className="member-box-list-container">
                        <div className="member-box-list">
                            <div className="member-box-list-label">{t('model.mltc')}</div>
                            <ul className="member-box-list-items">
                                <li key="all-mltc">{t('members.all_mltcs')}</li>
                                {mltcOptions.map((mltc) => (
                                    <li key={mltc.id}>{mltc.name}</li>
                                ))}
                            </ul>
                            <button className="action-button thin">{t('general.buttons.add_mltc')}</button>
                        </div>
                        <div className="member-box-list">
                            <div className="member-box-list-label">{t('model.member')}</div>
                            <div className="member-box-list-items">

                            </div>
                            <button className="action-button thin">{t('general.buttons.add_member')}</button>
                        </div>
                    </div>
                }
            />
        </>
    );
};

export default MembersAttendanceModal;