import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import EditButton from '../buttons/EditButton';
import FileItem from '../items/FileItem';

const MemberFilesCard = ({ data, onEdit }) => {
    const { t } = useTranslation();
    const files = data || [];

    const handleEdit = () => {
        onEdit('files', files);
    };

    return (
        <div className="card-full">
            <h2>{t('member.files.label')}</h2>
            <div className="card-container">
                <EditButton onClick={handleEdit} />
                {files.length > 0 ? (
                    <ul className="file-list">
                        {files.map((file, index) => (
                            <li><FileItem key={index} file={file} /></li>
                        ))}
                    </ul>
                ) : (
                    <p>{t('member.files.no_files')}</p>
                )}
            </div>
        </div>
    );
};

export default memo(MemberFilesCard);