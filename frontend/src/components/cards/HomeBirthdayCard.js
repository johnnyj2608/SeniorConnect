import React, { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import NameDisplay from '../layout/NameDisplay';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import CardHome from '../layout/CardHome';

const HomeBirthdayCard = () => {
    const { t } = useTranslation();
    const [birthdays, setBirthdays] = useState([]);

    useEffect(() => {
        const getBirthdays = async () => {
            try {
                const response = await fetchWithRefresh('/core/members/birthdays/');
                if (!response.ok) return;
                const data = await response.json();
                setBirthdays(data);
            } catch (error) {
                console.error(error);
            }
        };

        getBirthdays();
    }, []);

    return (
        <CardHome
            title={t('snapshots.birthdays')}
            data={birthdays}
            emptyMessage={t('home.no_upcoming_birthdays')}
        >
            <ul>
                {birthdays.map(birthday => (
                    <BirthdayItem key={birthday.id} birthday={birthday} />
                ))}
            </ul>
        </CardHome>
    );
};

export default HomeBirthdayCard;

const BirthdayItem = memo(({ birthday }) => {
    const { t } = useTranslation();

    const renderBirthdayMessage = (daysUntil) => {
        if (daysUntil === 0) return t('home.today') + '!';
        if (daysUntil === 1) return t('home.tomorrow');
        return t('home.days', { count: daysUntil });
    };

    return (
        <li>
            <Link to={`/members/${birthday.id}`} className="home-item">
                <span className="home-item-primary">
                    <p>
                        <NameDisplay
                            sadcId={birthday.sadc_member_id}
                            memberName={`${birthday.last_name}, ${birthday.first_name}`}
                            altName={birthday.alt_name}
                        />
                    </p>
                    <p>— {t('home.turning_years_old', { count: birthday.age_turning })}</p>
                </span>
                <span className="home-item-secondary">
                    <p className="nowrap">{renderBirthdayMessage(birthday.days_until)}</p>
                </span>
            </Link>
        </li>
    );
});