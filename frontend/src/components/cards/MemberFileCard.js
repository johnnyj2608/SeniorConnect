import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as FileIcon } from '../../assets/file.svg';
import { openFile } from '../../utils/fileUtils';
import CardMember from '../layout/CardMember';

const MemberFileCard = ({ data, onEdit }) => {
    const { t } = useTranslation();
    const files = data || [];

    return (
        <CardMember
            title={t('member.files.label')}
            data={files}
            emptyMessage={t('member.files.no_files')}
            onEdit={onEdit}
            editKey="files"
            fullWidth={true}
        >
            <ul className="file-list">
                {files.map(file => (
                    <li key={file.id}>
                        <FileItem file={file} />
                    </li>
                ))}
            </ul>
        </CardMember>
    );
};

export default memo(MemberFileCard);

const FileItem = memo(({ file }) => {
    const handleClick = () => {
        if (file.file) openFile(file.file);
    };

    return (
        <div className="file-item" onClick={handleClick}>
            <FileIcon className="file-icon" />
            <p className="file-name">{file.name}</p>
        </div>
    );
});