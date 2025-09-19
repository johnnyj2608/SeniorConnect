import React, { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { formatDate, formatTime } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import CardHome from '../layout/CardHome';
import NameDisplay from '../layout/NameDisplay';

const HomeAssessmentCard = () => {
    const { t } = useTranslation();
    const [assessments, setAssessments] = useState([]);

    useEffect(() => {
        const getAssessments = async () => {
            try {
                const response = await fetchWithRefresh('/core/assessments/upcoming/');
                if (!response.ok) return;

                const data = await response.json();
                setAssessments(data);
            } catch (error) {
                console.error(error);
            }
        };

        getAssessments();
    }, []);

    return (
        <CardHome
            title={t('home.assessments')}
            data={assessments}
            emptyMessage={t('home.no_upcoming_assessments')}
        >
            <ul>
                {assessments.map(assessment => (
                    <AssessmentItem key={assessment.id} assessment={assessment} />
                ))}
            </ul>
        </CardHome>
    );
};

export default HomeAssessmentCard;

const AssessmentItem = memo(({ assessment }) => {
    return (
        <li>
            <Link to={`/members/${assessment.member}`} className="home-item">
                <span className="home-item-primary">
                    <p>
                        <NameDisplay
                            sadcId={assessment.sadc_member_id}
                            memberName={assessment.member_name}
                            altName={assessment.alt_name}
                        />
                    </p>
                    <p>— {assessment.user_name}</p>
                </span>
                <span className="home-item-secondary">
                    <p>{formatDate(assessment.start_date)}</p>
                    <p>{formatTime(assessment.time)}</p>
                </span>
            </Link>
        </li>
    );
});