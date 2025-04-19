import React, { useState, useEffect } from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';
import { formatDate, formatSchedule } from '../../utils/formatUtils';
import getActiveAuthIndex from '../../utils/getActiveAuthIndex';
import DetailRow from '../MemberDetail';

const MemberAuthCard = ({ id, onEdit }) => {
    const [auths, setAuths] = useState([]);
    const [activeAuth, setActiveAuth] = useState(null);

    useEffect(() => {
        const getAuthsByMember = async () => {
            const response = await fetch(`/core/auths/member/${id}`);
            const data = await response.json();
            setAuths(data);
        };

        if (id !== 'new') {
            getAuthsByMember();
        }
        
    }, [id]);

    useEffect(() => {
        if (auths.length > 0) {
          const activeAuthIndex = getActiveAuthIndex(auths);
          setActiveAuth(auths[activeAuthIndex]);
        } else {
            setActiveAuth(null);
        }
    }, [auths]);

    const handleEdit = () => {
        onEdit('authorizations', auths, setAuths);
    };

    return (
        <div className="member-half-card">
            <h2>Authorization</h2>
            <div className="member-container">
                <Pencil className="edit-icon" onClick={handleEdit} />
                <DetailRow label="Member ID" value={activeAuth?.mltc_member_id} />
                <DetailRow label="MLTC" value={activeAuth?.mltc} />
                <DetailRow label="Auth ID" value={activeAuth?.mltc_auth_id} />
                <DetailRow label="Schedule" value={formatSchedule(activeAuth?.schedule)} />
                <DetailRow label="Start Date" value={formatDate(activeAuth?.start_date)} />
                <DetailRow label="End Date" value={formatDate(activeAuth?.end_date)} />
                <DetailRow label="DX Code" value={activeAuth?.dx_code} />
                <DetailRow label="SDC Code" value={activeAuth?.sdc_code} />
                <DetailRow label="Trans Code" value={activeAuth?.trans_code} />
            </div>
        </div>
    );
};

export default MemberAuthCard;