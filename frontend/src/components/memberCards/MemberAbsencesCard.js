import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import EditButton from '../buttons/EditButton';
import DetailRow from '../layout/MemberDetail';
import { formatDate, formatStatus } from '../../utils/formatUtils';

const MemberAbsencesCard = ({ data, onEdit }) => {
	const { t } = useTranslation();
	const absences = data || [];

	const handleEdit = () => {
		onEdit('absences', absences);
	};

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const activeAbsences = absences.filter(abs => {
		if (!abs.end_date) return true;
		const [year, month, day] = abs.end_date.split('-');
		const endDate = new Date(year, month - 1, day);
		return endDate >= today;
	});

  	return (
		<div className="half-card">
			<h2>{t('member.absences.label')}</h2>
			<div className="card-container">
				<EditButton onClick={handleEdit} />
				{activeAbsences.length > 0 ? (
				<ul className="absence-list">
					{activeAbsences.map((abs, idx) => (
					<li key={idx} className="absence-item">
						<DetailRow
							label={t('member.absences.label')}
							value={t(`member.absences.${abs.absence_type}`, abs.absence_type)}
						/>
						<DetailRow
							label={t('member.absences.start_date')}
							value={formatDate(abs.start_date)}
						/>
						<DetailRow
							label={t('member.absences.end_date')}
							value={formatDate(abs.end_date)}
						/>
						<DetailRow
							label={t('member.absences.status')}
							value={t(`member.absences.${formatStatus(abs.start_date, abs.end_date)}`)}
						/>
						{abs.note && <DetailRow label={t('general.note')} value={abs.note} />}
					</li>
					))}
				</ul>
				) : (
				<p>{t('member.absences.no_absences')}</p>
				)}
			</div>
		</div>
	);
};

export default memo(MemberAbsencesCard);