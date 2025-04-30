import React, { useState, useEffect } from 'react';
import { ReactComponent as ArrowLeft } from '../../assets/arrow-left.svg'
import { ReactComponent as ArrowRight } from '../../assets/arrow-right.svg'
import { ReactComponent as Eye } from '../../assets/eye.svg'
import { ReactComponent as Trash } from '../../assets/trash.svg'
import { ReactComponent as Add } from '../../assets/add.svg'
import viewFile from '../../utils/viewFile';

const MemberFilesModal = ({ data, handleChange, activeTab }) => {
    const current = data[activeTab] || {};
    const versions = current.versions || [];

    const [versionIndex, setVersionIndex] = useState(0);
    const currentVersion = versions[versionIndex] || {};

    const disabled = data.filter(tab => !tab.deleted).length <= 0;
    const disabledVersions = disabled || versions.length == 0;

    const handlePrev = () => {
        setVersionIndex((prev) => (prev > 0 ? prev - 1 : prev));
    };

    const handleNext = () => {
        setVersionIndex((prev) => (prev < versions.length - 1 ? prev + 1 : prev));
    };

    const handleAdd = () => {
        const newVersion = {
            file: '',
            completion_date: '',
            expiration_date: '',
            edited: true,
        };
        const updatedVersions = [...versions, newVersion];

        const fakeEvent = {
            target: { value: updatedVersions }
        };
    
        handleChange('versions')(fakeEvent);
        setVersionIndex(0);
    };

    const handleDelete = () => {
        console.log('delete version')
    }

    useEffect(() => {
        setVersionIndex(0);
    }, [activeTab]);

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
                    <span className="uploaded-file-name">
                        {currentVersion.file?.split('/').pop() || 'No file chosen'}
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
            <div className="file-nav">
                {versionIndex === 0 ? (
                    <button 
                        className="arrow-btn add-btn tooltip" 
                        onClick={handleAdd}
                        data-tooltip="Add new version"
                    >
                        <Add />
                    </button>
                ) : (
                    <button 
                        className="arrow-btn tooltip" 
                        onClick={handlePrev}
                        data-tooltip="Previous version"
                    >
                        <ArrowLeft />
                    </button>
                )}
                <div className="file-buttons">
                    <button 
                        className="arrow-btn tooltip"
                        onClick={() => viewFile(currentVersion.file)}
                        disabled={!currentVersion.file}
                        data-tooltip="View version"
                    >
                        <Eye />
                    </button>
                    <button 
                        className="arrow-btn tooltip"
                        onClick={handleDelete}
                        disabled={!currentVersion.file}
                        data-tooltip="Delete version"
                    >
                        <Trash />
                    </button>
                </div>
                <button
                    className="arrow-btn tooltip"
                    onClick={handleNext}
                    disabled={versionIndex >= versions.length - 1}
                    data-tooltip="Next version"
                >
                    <ArrowRight />
                </button>
            </div>
        </>
    )
}

export default MemberFilesModal