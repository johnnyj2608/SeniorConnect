import React, { memo } from 'react';
import EditButton from '../buttons/EditButton';

const CardMember = ({ title, data, emptyMessage, onEdit, editKey, children, fullWidth = false }) => {
    const hasData = data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);

    const handleEdit = () => {
        if (onEdit && editKey) onEdit(editKey, { data });
    };

    const cardClass = fullWidth ? 'card-full' : 'card-400';

    return (
        <div className={cardClass}>
            <h2>{title}</h2>
            <div className="card-container">
                {onEdit && editKey && <EditButton onClick={handleEdit} />}
                {hasData ? children : <p>{emptyMessage}</p>}
            </div>
        </div>
    );
};

export default memo(CardMember);