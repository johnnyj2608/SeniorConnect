import React, { memo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import EditButton from '../buttons/EditButton';
import MemberDetail from '../layout/MemberDetail';
import { formatDate } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const MemberGiftedCard = ({ id, onEdit }) => {
    const { t } = useTranslation();
    const [gifts, setGifts] = useState([]);

    useEffect(() => {
        const fetchGifts = async () => {
            try {
                const response = await fetchWithRefresh(`/tenant/gifts/active/${id}/`);
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
        try {
            const response = await fetchWithRefresh(`/core/gifteds/member/${id}/`);
            if (!response.ok) return;
            const giftedData = await response.json();

            const normalizedGifts = gifts.map(gift => ({
                ...gift,
                id: 'new',
                gift: gift.id,
                member: id,
                received: false,
                note: ''
            }));

            const updatedGifts = [...normalizedGifts, ...giftedData];
            onEdit('gifteds', updatedGifts);
        } catch (error) {
            console.error(error);
        }
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