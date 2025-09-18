import React, { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import DropdownButton from '../buttons/DropdownButton';
import { colorStats } from '../../utils/colorUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import CardHome from '../layout/CardHome';

const HomeStatsCard = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [change, setChange] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const getStats = async () => {
            try {
                const response = await fetchWithRefresh('/core/members/stats/');
                if (!response.ok) return;
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error(error);
            }
        };

        const getChange = async () => {
            try {
                const response = await fetchWithRefresh('/audit/enrollments/stats/');
                if (!response.ok) return;
                const data = await response.json();
                setChange(data);
            } catch (error) {
                console.error(error);
            }
        };

        getStats();
        getChange();
    }, []);

    const toggleDetails = () => {
        setShowDetails(prev => !prev);
    };

    return (
        <CardHome
            title={t('snapshots.members')}
            data={stats ? [stats] : []}
            emptyMessage={t('home.no_available_stats')}
        >
            <div className="stats-container">
                <h3 className="stats-count">{stats ? stats.active_count : '...'}</h3>
                <p className="stats-change">
                    {colorStats(stats?.active_count, change?.Overall ?? 0)}
                </p>
                <DropdownButton
                    showDetails={showDetails}
                    toggleDetails={toggleDetails}
                />
                {showDetails && stats?.mltc_count && (
                    <div className="stats-mltcs">
                        {stats.mltc_count.map(item => (
                            <StatsItem
                                key={item.name || 'unknown'}
                                item={item}
                                change={change}
                            />
                        ))}
                    </div>
                )}
            </div>
        </CardHome>
    );
};

export default HomeStatsCard;

const StatsItem = memo(({ item, change }) => {
    const netChange = change ? change[item.name] ?? 0 : 0;

    return (
        <div className="stats-mltc">
            <h4>{item.name}</h4>
            <p>{item.count}</p>
            <p>{colorStats(item.count, netChange)}</p>
        </div>
    );
});