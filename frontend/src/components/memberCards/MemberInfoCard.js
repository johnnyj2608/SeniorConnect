import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import EditButton from '../buttons/EditButton';
import DetailRow from '../layout/MemberDetail';
import { formatDate, formatGender, formatPhone, formatSSN } from '../../utils/formatUtils';

const MemberInfoCard = ({ data, onEdit }) => {
	const { t } = useTranslation();
	const info = data || [];

	const handleEdit = () => {
		onEdit('info', info);
	};

	return (
		<div className="card-400">
		<h2>{t('member.info.label')}</h2>
			<div className="card-container">
			<EditButton onClick={handleEdit} />
				{Object.keys(info).length === 0 ? (
					<p>{t('member.info.no_info')}</p>
				) : (
				<>
					<DetailRow label={t('member.info.sadc_member_id')} value={info.sadc_member_id} />
					<DetailRow label={t('member.info.last_name')} value={info.last_name} />
					<DetailRow label={t('member.info.first_name')} value={info.first_name} />
					<DetailRow label={t('member.info.alt_name')} value={info.alt_name} />
					<DetailRow label={t('member.info.birth_date')} value={formatDate(info.birth_date)} />
					<DetailRow label={t('member.info.gender')} value={formatGender(info.gender)} />
					<DetailRow label={t('member.info.phone')} value={formatPhone(info.phone)} />
					<DetailRow label={t('member.info.address')} value={info.address} />
					<DetailRow label={t('member.info.email')} value={info.email} />
					<DetailRow label={t('member.info.medicaid')} value={info.medicaid?.toUpperCase()} />
					<DetailRow label={t('member.info.ssn')} value={formatSSN(info.ssn)} />
					<DetailRow label={t('member.info.language')} value={info.language_name} />
					<DetailRow label={t('member.info.enrollment')} value={formatDate(info.enrollment_date)} />
					<DetailRow label={t('general.note')} value={info.note} />
				</>
				)}
			</div>
		</div>
	);
};

export default memo(MemberInfoCard);
