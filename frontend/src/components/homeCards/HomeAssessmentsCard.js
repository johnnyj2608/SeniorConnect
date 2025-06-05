import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AssessmentItem from '../items/AssessmentItem';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

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
            console.log(error);
        }
        };

        getAssessments();
    }, []);

    return (
        <div className="card-full">
            <h2>{t('snapshots.assessments')}</h2>
            <div className="card-container">
                {assessments.length === 0 ? (
            <p>{t('home.no_upcoming_assessments')}</p>
            ) : (
            <ul>
                {assessments.map(assessment => (
                    <AssessmentItem key={assessment.id} assessment={assessment} />
                ))}
            </ul>
            )}
            </div>
        </div>
    );
};

export default HomeAssessmentCard;