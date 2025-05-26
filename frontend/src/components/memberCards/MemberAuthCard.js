import React, { useState, useEffect, memo } from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';
import { formatDate, formatSchedule } from '../../utils/formatUtils';
import DetailRow from '../members/MemberDetail';
import fetchWithRefresh from '../../utils/fetchWithRefresh';

const MemberAuthCard = ({ id, onEdit }) => {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
			if (id === 'new') return;

			const getActiveAuthByMember = async () => {
				try {
					const response = await fetchWithRefresh(`/core/members/${id}/auth/`);
					if (!response.ok) return;
						const data = await response.json();
						setAuth(data);
					} catch (error) {
						console.error('Failed to fetch active auth by member:', error);
					}
			};

			getActiveAuthByMember();
		}, [id]);

    const handleEdit = async () => {
        try {
            const response = await fetchWithRefresh(`/core/auths/member/${id}`);
            if (!response.ok) return;

            const data = await response.json();
            onEdit('authorizations', data, setAuth);
        } catch (error) {
            console.error('Failed to fetch auths for edit:', error);
        }
    };

    return (
        <div className="half-card">
            <h2>Authorization</h2>
            <div className="card-container">
                <Pencil className="edit-icon" onClick={handleEdit} />
                <DetailRow label="Member ID" value={auth?.mltc_member_id} />
                <DetailRow label="MLTC" value={auth?.mltc} />
                <DetailRow label="Auth ID" value={auth?.mltc_auth_id} />
                <DetailRow label="Schedule" value={formatSchedule(auth?.schedule)} />
                <DetailRow label="Start Date" value={formatDate(auth?.start_date)} />
                <DetailRow label="End Date" value={formatDate(auth?.end_date)} />
                <DetailRow label="DX Code" value={auth?.dx_code} />
                <DetailRow label="SDC Code" value={auth?.sdc_code} />
                <DetailRow label="Trans Code" value={auth?.trans_code} />
            </div>
        </div>
    );
};

export default memo(MemberAuthCard);