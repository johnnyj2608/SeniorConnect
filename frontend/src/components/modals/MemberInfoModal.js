import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPhoto } from '../../utils/formatUtils';
import getCroppedImg from '../../utils/getCroppedImage';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const MemberInfoModal = ({ data, handleChange }) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="modal-header">
                <h3>{t('general.edit')}{t('member.info.label')}</h3>
            </div>

            <div className="member-detail">
                <label>{t('member.info.sadc_member_id')} *</label>
                <input
                    type="number"
                    value={data.sadc_member_id || ''}
                    onChange={handleChange('sadc_member_id')}
                    placeholder={t('general.required')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.last_name')} *</label>
                <input
                    type="text"
                    value={data.last_name || ''}
                    onChange={handleChange('last_name')}
                    placeholder={t('general.required')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.first_name')} *</label>
                <input
                    type="text"
                    value={data.first_name || ''}
                    onChange={handleChange('first_name')}
                    placeholder={t('general.required')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.alt_name')}</label>
                <input
                    type="text"
                    value={data.alt_name || ''}
                    onChange={handleChange('alt_name')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.phone')}</label>
                <input
                    type="number"
                    value={data.phone || ''}
                    onChange={handleChange('phone')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.address')}</label>
                <input
                    type="text"
                    value={data.address || ''}
                    onChange={handleChange('address')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.email')}</label>
                <input
                    type="text"
                    value={data.email || ''}
                    onChange={handleChange('email')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.medicaid')}</label>
                <input
                    type="text"
                    value={data.medicaid?.toUpperCase() || ''}
                    onChange={handleChange('medicaid')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.ssn')}</label>
                <input
                    type="number"
                    value={data.ssn || ''}
                    onChange={handleChange('ssn')}
                    autoComplete="off"
                />
            </div>

            <div className="member-detail">
                <label>{t('member.info.enrollment')}</label>
                <input
                    type="date"
                    value={data.enrollment_date || ''}
                    onChange={handleChange('enrollment_date')}
                />
            </div>

            <div className="member-detail">
                <label>{t('general.note')}</label>
                <input
                    type="text"
                    value={data.note || ''}
                    onChange={handleChange('note')}
                    autoComplete="off"
                />
            </div>
        </>
    );
};

const MemberInfoSideModal = ({ data, handleChange, languages }) => {
    const { t } = useTranslation();
    const [crop, setCrop] = useState();

    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleChange('preview_photo')({ target: { value: file } });
            handleChange('photo')({ target: { value: file } });
        }
    };

    const imgRef = useRef(null);
    const onCropComplete = async (pixelCrop) => {
        if (imgRef.current && pixelCrop?.width && pixelCrop?.height) {
            const croppedBlob = await getCroppedImg(imgRef.current, pixelCrop);
            const croppedFile = new File([croppedBlob], 'cropped.jpg', { type: 'image/jpeg' });
            handleChange('photo')({ target: { value: croppedFile } });
        }
    };

    return (
        <>
            <div className="photo-container">
                {data.photo ? (
                    <ReactCrop 
                        crop={crop} 
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => onCropComplete(c)}
                    >
                        <img
                            ref={imgRef}
                            src={formatPhoto(data.preview_photo)}
                            alt={data.first_name ? `${data.first_name} ${data.last_name}` : t('member.info.label')}
                            className="preview-photo"
                            crossOrigin="anonymous"
                            onError={(e) => (e.target.src = "/default-profile.jpg")}
                        />
                    </ReactCrop>
                ) : (
                    <img
                        src="/default-profile.jpg"
                        alt={t('member.info.label')}
                        className="preview-photo"
                    />
                )}
                {data.photo ? (
                    <button
                        type="button"
                        className="action-button thin destructive"
                        onClick={() => {
                            handleChange('photo')({ target: { value: '' } });
                            handleChange('preview_photo')({ target: { value: '' } });
                        }}
                    >
                        {t('general.buttons.remove_photo')}
                    </button>
                ) : (
                    <>
                        <label htmlFor="image-upload" className="action-button thin">
                            {t('general.buttons.choose_photo')}
                        </label>
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            style={{ display: 'none' }}
                        />
                    </>
                )}
            </div>

            <div className="member-detail stack">
                <label>{t('member.info.birth_date')} *</label>
                <input
                    type="date"
                    value={data.birth_date || ''}
                    onChange={handleChange('birth_date')}
                />
            </div>

            <div className="member-detail stack">
                <label>{t('member.info.gender')} *</label>
                <div className="radio-group">
                    <label>{t('general.male')}
                        <input
                            type="radio"
                            name="gender"
                            value="M"
                            checked={data.gender === 'M'}
                            onChange={handleChange('gender')}
                        />
                    </label>
                    <label>{t('general.female')}
                        <input
                            type="radio"
                            name="gender"
                            value="F"
                            checked={data.gender === 'F'}
                            onChange={handleChange('gender')}
                        />
                    </label>
                </div>
            </div>

            <div className="member-detail stack">
                <label>{t('member.info.language')}</label>
                <select
                    required
                    value={data?.language || ''}
                    onChange={handleChange('language')}
                >
                    <option value="">{t('general.select_an_option')}</option>
                    {Array.isArray(languages) &&
                        languages.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                </select>
            </div>
        </>
    );
};

export { MemberInfoModal, MemberInfoSideModal };