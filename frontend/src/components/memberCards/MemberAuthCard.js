import React, { useState, useEffect } from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';
import { formatDate, formatSchedule } from '../../utils/formatUtils';
import DetailRow from '../members/MemberDetail';

const MemberAuthCard = ({ id, onEdit }) => {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        const getActiveAuthByMember = async () => {
            const response = await fetch(`/core/members/${id}/auth/`);
            const data = await response.json();
            setAuth(data);
        };

        if (id !== 'new') {
            getActiveAuthByMember();
        }
        
    }, [id]);

    const handleEdit = () => {
        const getAuthsByMember = async () => {
            const response = await fetch(`/core/auths/member/${id}`);
            const data = await response.json();
            onEdit('authorizations', data, setAuth);
        };
        getAuthsByMember();
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

export default MemberAuthCard;