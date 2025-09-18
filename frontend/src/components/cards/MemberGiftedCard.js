import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import MemberDetail from '../layout/MemberDetail';
import { formatDate } from '../../utils/formatUtils';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import CardMember from '../layout/CardMember';

const MemberGiftedCard = ({ id, data, onEdit }) => {
    const { t } = useTranslation();
    const gifts = data || [];

    const handleEdit = () => {
        if (!gifts.length) return;
        onEdit('gifteds', {
            fetchData: async () => {
                try {
                    const response = await fetchWithRefresh(`/core/gifteds/member/${id}/`);
                    if (!response.ok) return [];

                    const giftedData = await response.json();

                    const normalizedGifts = gifts.map(gift => ({
                        ...gift,
                        id: 'new',
                        gift_id: gift.gift_id,
                        name: gift.name,
                        member: id,
                        received: false,
                        note: ''
                    }));

                    return [...normalizedGifts, ...giftedData];
                } catch (error) {
                    console.error(error);
                    return [];
                }
            }
        });
    };

    return (
        <CardMember
            title={t('member.gifts.label')}
            data={gifts}
            emptyMessage={t('member.gifts.no_gifts')}
            onEdit={handleEdit}
        >
            <ul className="card-list">
                {gifts.map((gift, idx) => (
                    <li key={idx} className="card-list-item">
                        <MemberDetail label={t('member.gifts.name')} value={gift.name} />
                        <MemberDetail label={t('member.gifts.expires_at')} value={formatDate(gift.expires_at)} />
                    </li>
                ))}
            </ul>
        </CardMember>
    );
};

export default memo(MemberGiftedCard);