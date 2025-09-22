import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import MemberDetail from '../layout/MemberDetail';
import { formatDate, formatTime, formatStatus } from '../../utils/formatUtils';
import { openFile } from '../../utils/fileUtils';
import CardMember from '../layout/CardMember';

const MemberAbsenceCard = ({ data, onEdit }) => {
    const { t } = useTranslation();
    const absences = data || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeAbsences = absences
        .filter(abs => !abs.end_date || new Date(abs.end_date) >= today)
        .reverse();

    return (
        <CardMember
            title={t('member.absences.label')}
            data={activeAbsences}
            emptyMessage={t('member.absences.no_absences')}
            onEdit={onEdit}
            editKey="absences"
        >
            <ul className="card-list">
                {activeAbsences.map((abs, idx) => {
                    const isAssessment = abs.absence_type === 'assessment';
                    return (
                        <li key={idx} className="card-list-item">
                            <MemberDetail
                                label={t('member.absences.label')}
                                value={t(`member.absences.${abs.absence_type}`, abs.absence_type)}
                            />
                            <MemberDetail
                                label={isAssessment ? t('member.absences.date') : t('member.absences.start_date')}
                                value={formatDate(abs.start_date)}
                            />
                            {isAssessment ? (
                                <>
                                    <MemberDetail label={t('member.absences.time')} value={formatTime(abs.time)} />
                                    <MemberDetail label={t('member.absences.user')} value={abs.user_name} />
                                </>
                            ) : (
                                <>
                                    <MemberDetail label={t('member.absences.end_date')} value={formatDate(abs.end_date)} />
                                    <MemberDetail
                                        label={t('member.absences.status')}
                                        value={t(`member.absences.${formatStatus(abs.start_date, abs.end_date)}`)}
                                    />
                                </>
                            )}
                            <MemberDetail label={t('general.note')} value={abs.note} />
                            {abs.file && (
                                <button className="action-button thin lg" onClick={() => openFile(abs.file)}>
                                    {t('general.buttons.view_file')}
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </CardMember>
    );
};

export default memo(MemberAbsenceCard);