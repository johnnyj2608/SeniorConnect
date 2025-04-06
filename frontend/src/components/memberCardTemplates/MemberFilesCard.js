import React from 'react';
import { ReactComponent as Pencil } from '../../assets/pencil.svg';

const MemberFilesCard = ({ files, onEdit }) => {
    return (
        <div className="member-full-card">
        <h2>Files</h2>
        <div className="member-container">
            <Pencil className="edit-icon" onClick={onEdit} />
            {/* Files gallery and upload UI can go here */}
            {/* Add logic to display file previews or thumbnails */}
            {/* You can also implement click behavior to open PDFs or images in a new tab */}
        </div>
        </div>
    );
};

export default MemberFilesCard;