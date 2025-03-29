import React, { useState, useEffect } from 'react';
import MltcDropdown from '../MltcDropdown';

const MemberAuthModal = ({ data, handleChange }) => {
    const [mltcOptions, setMltcOptions] = useState([]);

    useEffect(() => {
        getMltcOptions()
    }, [])

    const getMltcOptions = async () => {
        const response = await fetch('/core/mltc/');
        const data = await response.json();
        setMltcOptions(data);
    }

    return (
        <>
            <h3>Edit Authorization</h3>
            <div className="member-detail">
                <label>Member ID</label>
                <input
                    type="text"
                    name="mltc_member_id"
                    value={data.mltc_member_id || ''}
                    onChange={handleChange('mltc_member_id')}
                />
            </div>
            <div className="member-detail">
                <label>MLTC:</label>
                <MltcDropdown value={data.mltc_id} onChange={handleChange('mltc_id')} options={mltcOptions} />
            </div>
        </>
    );
};

export default MemberAuthModal;
