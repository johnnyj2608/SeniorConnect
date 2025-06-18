import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NameDisplay from '../layout/NameDisplay';

const ModalQueue = ({ members, removeQueue, clearMltcQueue }) => {
    const { t } = useTranslation();
    const [openTabs, setOpenTabs] = useState({});

    useEffect(() => {
        const defaultOpenTabs = {};
        Object.entries(members).forEach(([mltc, list]) => {
            if (list.length > 0 && list.length < 5) {
                defaultOpenTabs[mltc] = true;
            }
        });
        setOpenTabs(defaultOpenTabs);
    }, [members]);

    const displayedMltcs = Object.keys(members)
        .filter(mltcName => members[mltcName].length > 0);

    const toggleTab = (mltc) => {
        setOpenTabs((prev) => ({
            ...prev,
            [mltc]: !prev[mltc],
        }));
    };

    return (
        <>
            {displayedMltcs.length === 0 ? (
                <div className="modal-tabs-placeholder">
                    {t('members.no_members')}
                </div>
            ) : (
                displayedMltcs.map((mltc) => (
                    <div
                        className={`tab-button-container${openTabs[mltc] ? ' opened' : ''}`}
                        key={mltc}
                    >
                        <button
                            className={`tab-button${openTabs[mltc] ? ' opened' : ''}`}
                            onClick={() => toggleTab(mltc)}
                        >
                            <div>
                                <div className="tab-heading">{mltc}</div>
                                <div className="tab-subheading">
                                    {t('general.members')}: {members[mltc].length}
                                </div>
                            </div>
                        </button>

                        {openTabs[mltc] && (
                            <ul className="tab-button-list">
                                {members[mltc].map((member) => (
                                    <li
                                        key={member.id}
                                        onClick={() => removeQueue(member.id, mltc)}
                                    >
                                        <NameDisplay
                                            sadcId={member.sadc_member_id}
                                            memberName={`${member.last_name}, ${member.first_name}`}
                                            altName={member.alt_name}
                                        />
                                    </li>
                                ))}
								<li onClick={() => clearMltcQueue(mltc)}>
									{t('general.buttons.clear_mltc')}
								</li>
                            </ul>
                        )}
                    </div>
                ))
            )}
        </>
    );
};

export default ModalQueue;