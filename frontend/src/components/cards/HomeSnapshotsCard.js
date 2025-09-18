import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import { openFile } from '../../utils/fileUtils';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import CardHome from '../layout/CardHome';

const HomeSnapshotCard = () => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [snapshots, setSnapshots] = useState([]);

    useEffect(() => {
        if (!user.view_snapshots && !user.is_org_admin) return;

        const getSnapshots = async () => {
            try {
                const response = await fetchWithRefresh('/tenant/snapshots/recent/');
                if (!response.ok) return;

                const data = await response.json();
                setSnapshots(data);
            } catch (error) {
                console.error(error);
            }
        };

        getSnapshots();
    }, [user]);

    if (!user.view_snapshots && !user.is_org_admin) return null;

    const now = new Date();
    const monthIndex = now.getMonth();

    return (
        <CardHome
            title={t('snapshots.label')}
            data={snapshots}
            emptyMessage={
                <div 
                    className="home-item"
                    onClick={() => navigate('/registry?type=snapshots')}
                >
                    {t('snapshots.see_archived')}
                </div>
            }
        >
            <p>{t('snapshots.month_snapshot_ready', { month: t(`general.month.${monthIndex}`) })}</p>
            <ul className="snapshot-group">
                {snapshots.map(snapshot => {
                    const label = t(`snapshots.${snapshot.type}`);
                    if (snapshot.type === 'birthdays') {
                        const birthdayMonth = monthIndex + 1;
                        return (
                            <li 
                                key={snapshot.id}
                                className="home-item"
                                onClick={() => openFile(snapshot.file)}
                            >
                                {t(`general.month.${birthdayMonth}`)} {label}
                            </li>
                        );
                    }

                    return (
                        <li 
                            key={snapshot.id}
                            className="home-item"
                            onClick={() => openFile(snapshot.file)}
                        >
                            {label}
                        </li>
                    );
                })}
            </ul>
            <div 
                className="home-item"
                onClick={() => navigate('/registry?type=snapshots')}
            >
                {t('snapshots.see_archived')}
            </div>
        </CardHome>
    );
};

export default HomeSnapshotCard;