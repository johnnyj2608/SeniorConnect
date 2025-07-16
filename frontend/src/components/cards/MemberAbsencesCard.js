import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import EditButton from '../buttons/EditButton';
import MemberDetail from '../layout/MemberDetail';
import { formatDate, formatStatus, formatTime } from '../../utils/formatUtils';
import { openFile } from '../../utils/fileUtils';

const MemberAbsencesCard = ({ data, onEdit }) => {
	const { t } = useTranslation();
	const absences = data || [];

	const handleEdit = () => {
		onEdit('absences', absences);
	};

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	let activeAbsences = absences.filter(abs => {
		if (!abs.end_date) return true;
		const [year, month, day] = abs.end_date.split('-');
		const endDate = new Date(year, month - 1, day);
		return endDate >= today;
	});
	activeAbsences = activeAbsences.reverse();

  	return (
		<div className="card-400">
			<h2>{t('member.absences.label')}</h2>
			<div className="card-container">
				<EditButton onClick={handleEdit} />
				{activeAbsences.length === 0 ? (
					<p>{t('member.absences.no_absences')}</p>
				) : (
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
									label={
										isAssessment
											? t('member.absences.date')
											: t('member.absences.start_date')
									}
									value={formatDate(abs.start_date)}
								/>
								{isAssessment ? (
									<>
										<MemberDetail
											label={t('member.absences.time')}
											value={formatTime(abs.time)}
										/>
										<MemberDetail
											label={t('member.absences.user')}
											value={abs.user_name}
										/>
									</>
								) : (
									<>
										<MemberDetail
											label={t('member.absences.end_date')}
											value={formatDate(abs.end_date)}
										/>
										<MemberDetail
											label={t('member.absences.status')}
											value={t(`member.absences.${formatStatus(abs.start_date, abs.end_date)}`)}
										/>
									</>
								)}
								<MemberDetail label={t('general.note')} value={abs.note} />
								{abs.file && (
									<button 
										className="action-button thin lg"
										onClick={() => openFile(abs.file)}
									>
										{t('general.buttons.view_file')}
									</button>
								)}
							</li>
						)
					})}
				</ul>
				)}
			</div>
		</div>
	);
};

export default memo(MemberAbsencesCard);