import React, { memo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import EditButton from '../buttons/EditButton';
import MemberDetail from '../layout/MemberDetail';
import { formatDate } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const MemberGiftedCard = ({ birthDate, mltc, onEdit }) => {
    const { t } = useTranslation();
    const [gifts, setGifts] = useState([]);

    useEffect(() => {
        const fetchGifts = async () => {
            const params = new URLSearchParams({ birthdate: birthDate, mltc: mltc });
            try {
                const response = await fetchWithRefresh(`/tenant/gifts/active/?${params.toString()}`);
                if (!response.ok) return;
                const data = await response.json();
                setGifts(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchGifts();
    }, []);

    const handleEdit = async () => {
        // Append gifted as inactive
    };

    return (
        <div className="card-400">
            <h2>{t('member.gifts.label')}</h2>
            <div className="card-container">
                <EditButton onClick={handleEdit} />
                {Object.keys(gifts).length === 0 ? (
                    <p>{t('member.gifts.no_gifts')}</p>
                ) : (
                    <ul className="card-list">
                        {gifts.map((gift, idx) => (
                            <li key={idx} className="card-list-item">
                                <MemberDetail label={t('member.gifts.name')} value={gift.name} />
                                <MemberDetail label={t('member.gifts.expires_at')} value={formatDate(gift.expires_at)} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default memo(MemberGiftedCard);