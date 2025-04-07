import React, { useState, useEffect } from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';
import { formatDate, formatSchedule } from '../../utils/formatUtils';
import getActiveAuthIndex from '../../utils/getActiveAuthIndex';

const MemberAuthCard = ({ id, onEdit }) => {
    const [auths, setAuths] = useState([]);
    const [activeAuth, setActiveAuth] = useState(null);

    const getAuthsByMember = async () => {
        if (id === 'new') return
    
        const response = await fetch(`/core/auths/member/${id}`);
        const data = await response.json();
        setAuths(data);
    };

    useEffect(() => {
        getAuthsByMember();
    }, [id]);

    useEffect(() => {
        if (auths.length > 0) {
          const activeAuthIndex = getActiveAuthIndex(auths);
          setActiveAuth(auths[activeAuthIndex]);
        }
    }, [auths]);

    const handleEdit = () => {
        onEdit('authorization', auths, setAuths);
    };

    return (
        <div className="member-half-card">
        <h2>Authorization</h2>
        <div className="member-container">
            <Pencil className="edit-icon" onClick={handleEdit} />
            
            <div className="member-detail">
            <label>Member ID:</label>
            <span>{activeAuth?.mltc_member_id || 'N/A'}</span>
            </div>
            
            <div className="member-detail">
            <label>MLTC:</label>
            <span>{activeAuth?.mltc || 'N/A'}</span>
            </div>

            <div className="member-detail">
            <label>Auth ID:</label>
            <span>{activeAuth?.mltc_auth_id || 'N/A'}</span>
            </div>

            <div className="member-detail">
            <label>Schedule:</label>
            <span>{formatSchedule(activeAuth?.schedule) || 'N/A'}</span>
            </div>

            <div className="member-detail">
            <label>Start Date:</label>
            <span>{formatDate(activeAuth?.start_date) || 'N/A'}</span>
            </div>

            <div className="member-detail">
            <label>End Date:</label>
            <span>{formatDate(activeAuth?.end_date) || 'N/A'}</span>
            </div>

            <div className="member-detail">
            <label>DX Code:</label>
            <span>{activeAuth?.dx_code || 'N/A'}</span>
            </div>

            <div className="member-detail">
            <label>SDC Code:</label>
            <span>{activeAuth?.sdc_code || 'N/A'}</span>
            </div>

            <div className="member-detail">
            <label>Trans Code:</label>
            <span>{activeAuth?.trans_code || 'N/A'}</span>
            </div>
        </div>
        </div>
    );
};

export default MemberAuthCard;