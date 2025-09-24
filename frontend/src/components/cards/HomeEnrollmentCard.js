import React, { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import NameDisplay from '../layout/NameDisplay';
import { formatDate } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import CardHome from '../layout/CardHome';

const HomeEnrollmentCard = () => {
    const { t } = useTranslation();
    const [enrollments, setEnrollments] = useState([]);

    useEffect(() => {
        const getEnrollments = async () => {
            try {
                const response = await fetchWithRefresh('/audit/enrollments/recent/');
                if (!response.ok) return;

                const data = await response.json();
                setEnrollments(data);
            } catch (error) {
                console.error(error);
            }
        };

        getEnrollments();
    }, []);

    return (
        <CardHome
            title={t('snapshots.enrollments')}
            data={enrollments}
            emptyMessage={t('home.no_recent_enrollments')}
        >
            <ul>
                {enrollments.map(enrollment => (
                    <EnrollmentItem key={enrollment.id} enrollment={enrollment} />
                ))}
            </ul>
        </CardHome>
    );
};

export default HomeEnrollmentCard;

const EnrollmentItem = memo(({ enrollment }) => {
    const { t } = useTranslation();

    const renderEnrollmentMessage = (old_mltc, new_mltc) => {
        if (old_mltc && new_mltc) return `${old_mltc} → ${new_mltc}`;
        if (new_mltc) return new_mltc;
        if (old_mltc) return old_mltc;
        return '';
    };

    return (
        <li>
            <Link to={`/members/${enrollment.member_id}`} className="home-item">
                <span className="home-item-primary">
                    <p>
                        <NameDisplay
                            memberName={enrollment.member_name}
                            altName={enrollment.member_alt_name}
                        />
                    </p>
                    <p>— {formatDate(enrollment.change_date)}</p>
                </span>
                <span className="home-item-secondary">
                    <p>{t(`registry.enrollments.${enrollment.change_type}`)}</p>
                    <p>{renderEnrollmentMessage(enrollment.old_mltc, enrollment.new_mltc)}</p>
                </span>
            </Link>
        </li>
    );
});