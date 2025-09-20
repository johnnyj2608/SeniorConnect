import React, { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import CardHome from '../layout/CardHome';
import NameDisplay from '../layout/NameDisplay';

const HomeAbsenceCard = () => {
    const { t } = useTranslation();
    const [leaving, setLeaving] = useState([]);
    const [returning, setReturning] = useState([]);

    useEffect(() => {
        const getAbsences = async () => {
            try {
                const response = await fetchWithRefresh('/core/absences/upcoming/');
                if (!response.ok) return;

                const data = await response.json();
                setLeaving(data.leaving);
                setReturning(data.returning);
            } catch (error) {
                console.error(error);
            }
        };

        getAbsences();
    }, []);

    const allAbsences = [...leaving, ...returning];

    return (
        <CardHome
            title={t('snapshots.absences')}
            data={allAbsences}
            emptyMessage={t('home.no_upcoming_absences')}
        >
            <div className="card-list-container">
                <div className="card-list">
                    <h3>{t('home.leaving_soon')}</h3>
                    <ul>
                        {leaving.map(absence => (
                            <AbsenceItem key={absence.member} absence={absence} />
                        ))}
                    </ul>
                </div>
                <div className="card-list">
                    <h3>{t('home.returning_soon')}</h3>
                    <ul>
                        {returning.map(absence => (
                            <AbsenceItem key={absence.member} absence={absence} />
                        ))}
                    </ul>
                </div>
            </div>
        </CardHome>
    );
};

export default HomeAbsenceCard;

const AbsenceItem = memo(({ absence }) => {
    const { t } = useTranslation();

    const renderDaysUntil = (days) => {
        if (days === 0) return t('home.today');
        if (days === 1) return t('home.tomorrow');
        return t('home.days', { count: days });
    };

    return (
        <li>
            <Link to={`/members/${absence.member}`} className="home-item">
                <span className="home-item-primary">
                    <p>
                        <NameDisplay
                            sadcId={absence.sadc_member_id}
                            memberName={absence.member_name}
                            altName={absence.alt_name}
                        />
                    </p>
                    <p>— {t(`member.absences.${absence.absence_type}`)}</p>
                </span>
                <span className="home-item-secondary">
                    <p className="nowrap">{renderDaysUntil(absence.days_until)}</p>
                </span>
            </Link>
        </li>
    );
});