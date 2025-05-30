import React from 'react';
import { ReactComponent as Upload } from '../../assets/upload.svg';
import viewFile from '../../utils/viewFile';
import useDragAndDrop from '../../hooks/useDragDrop';

const MemberFilesModal = ({ data, handleChange, activeTab }) => {
    const current = data[activeTab] || {};
    const disabled = data.filter(tab => !tab.deleted).length <= 0;

    const onDropFile = (file) => {
        const fakeEvent = { target: { files: [file] } };
        handleChange('file')(fakeEvent);
    };

    const { isDragging, dragProps } = useDragAndDrop(onDropFile);

    return (
        <div className={`file-drop ${isDragging ? 'drag-over' : ''}`} {...dragProps}>
            <div className={`file-content ${isDragging ? 'dimmed' : ''}`}>
                <div className="member-detail">
                    <label>Name *</label>
                    <input
                        type="text"
                        value={disabled ? '' : current.name || ''}
                        onChange={handleChange('name')}
                        autoComplete="off"
                        disabled={disabled}
                    />
                </div>

                <div className="member-detail">
                    <label>Upload File *</label>
                    <div className="file-container">
                        <button
                            className="action-button thin"
                            onClick={() => document.getElementById('hiddenFileInput').click()}
                            disabled={disabled}
                        >
                            Choose File
                        </button>
                        {!disabled && (
                            <span className={`uploaded-file-name ${!current.file ? 'file-expired' : ''}`}>
                                {current.file ? 'File chosen' : 'No file chosen'}
                            </span>
                        )}
                        <input
                            id="hiddenFileInput"
                            type="file"
                            accept="*/*"
                            onChange={handleChange('file')}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                <div className="member-detail">
                    <label>Completed</label>
                    <input
                        type="date"
                        value={disabled ? '' : current.completion_date || ''}
                        onChange={handleChange('completion_date')}
                        disabled={disabled}
                    />
                </div>

                <div className="member-detail">
                    <label>Expiration</label>
                    <input
                        type="date"
                        value={disabled ? '' : current.expiration_date || ''}
                        onChange={handleChange('expiration_date')}
                        disabled={disabled}
                    />
                </div>

                <div className="file-footer">
                    <button
                        className="action-button thin"
                        onClick={() => viewFile(current.file)}
                        disabled={disabled || !current.file}
                    >
                        View File
                    </button>
                </div>
            </div>

            {isDragging && (
                <div className="upload-overlay">
                    <Upload className="upload-icon pulse" />
                    <p>Drop file to upload</p>
                </div>
            )}
        </div>
    );
};

export default MemberFilesModal;