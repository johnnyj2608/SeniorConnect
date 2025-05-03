import React, { useState, useEffect } from 'react';
import { ReactComponent as Eye } from '../../assets/eye.svg'
import { ReactComponent as Trash } from '../../assets/trash.svg'
import { ReactComponent as Add } from '../../assets/add.svg'
import viewFile from '../../utils/viewFile';
import { formatDate } from '../../utils/formatUtils';
import Dropdown from '../inputs/Dropdown';

const MemberFilesModal = ({ data, handleChange, activeTab }) => {
    const current = data[activeTab] || {};
    const versions = current.versions.filter(v => !v.deleted) || [];

    const [versionIndex, setVersionIndex] = useState(0);
    const currentVersion = versions[versionIndex] || {};

    const disabled = data.filter(tab => !tab.deleted).length <= 0;
    const disabledVersions = disabled || versions.length <= 0;

    const handleAdd = () => {
        const newVersion = {
            id: 'new',
            tab: current.id,
            file: '',
            completion_date: '',
            expiration_date: '',
            edited: true,
        };
        const updatedVersions = [newVersion, ...current.versions];

        const fakeEvent = {
            target: { value: updatedVersions }
        };
    
        handleChange('versions')(fakeEvent);
        setVersionIndex(0);
    };

    const handleDelete = () => {
        const realIndex = current.versions.findIndex(
            (v) => v === versions[versionIndex]
        );

        const updatedVersions = [...current.versions];
        if (updatedVersions[realIndex].id === 'new') {
            updatedVersions.splice(realIndex, 1);
        } else {
            updatedVersions[realIndex] = {
                ...updatedVersions[realIndex],
                deleted: true,
            };
        }
    
        const fakeEvent = {
            target: { value: updatedVersions }
        };
    
        handleChange('versions')(fakeEvent);
        setVersionIndex(0);
    };

    useEffect(() => {
        setVersionIndex(0);
    }, [activeTab]);

    const versionOptions = versions.map((version, index) => ({
        name: `Version ${versions.length - index} - Uploaded ${formatDate(version.uploaded_at) || 'N/A'}`,
        value: index
    }));

    return (
        <>
            <h3>Edit Files</h3>
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
                        className="custom-file-button"
                        onClick={() => document.getElementById('hiddenFileInput').click()}
                        disabled={disabledVersions}
                    >
                        Choose File
                    </button>
                    <span className={`uploaded-file-name ${!currentVersion.file && !disabledVersions ? 'no-file-chosen' : ''}`}>
                        {currentVersion.file ? 'File chosen' : 'No file chosen'}
                    </span>
                    <input
                        id="hiddenFileInput"
                        type="file"
                        accept="application/pdf"
                        onChange={handleChange('file', true, versionIndex)}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>
            <div className="member-detail">
                <label>Completed</label>
                <input
                    type="date"
                    value={disabled ? '' : currentVersion.completion_date || ''}
                    onChange={handleChange('completion_date', true, versionIndex)}
                    disabled={disabledVersions}
                />
            </div>
            <div className="member-detail">
                <label>Expiration</label>
                <input
                    type="date"
                    value={disabled ? '' : currentVersion.expiration_date || ''}
                    onChange={handleChange('expiration_date', true, versionIndex)}
                    disabled={disabledVersions}
                />
            </div>

            <div className="member-detail">
                <label>Versions</label>
                <Dropdown
                    display={versionOptions[versionIndex]?.name || ''}
                    onChange={(e) => setVersionIndex(Number(e.target.value))}
                    options={versionOptions}
                    disabled={disabledVersions}
                    placeholder={false}
                />
            </div>

            <div className="file-buttons">
                <button 
                    className={`arrow-btn add-btn tooltip ${versions.length === 0 ? 'pulse' : ''}`} 
                    onClick={handleAdd}
                    data-tooltip="Add new version"
                >
                    <Add />
                </button>
                <button 
                    className="arrow-btn tooltip"
                    onClick={() => viewFile(currentVersion.file)}
                    disabled={!currentVersion.file}
                    data-tooltip="View version"
                >
                    <Eye />
                </button>
                <button 
                    className="arrow-btn tooltip trash-can"
                    onClick={handleDelete}
                    disabled={disabledVersions}
                    data-tooltip="Delete version"
                >
                    <Trash />
                </button>
            </div>
            <div className="file-footer">
                {versions.length === 0 ? (
                    <p>No files available. Please add a file.</p>
                ) : (
                    <p>
                        File {versionIndex + 1} of {versions.length}
                    </p>
                )}
            </div>
        </>
    )
}

export default MemberFilesModal