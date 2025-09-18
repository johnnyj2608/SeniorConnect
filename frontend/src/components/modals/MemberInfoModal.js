import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPhoto } from '../../utils/formatUtils';
import TextInput from '../inputs/TextInput';
import getCroppedImg from '../../utils/getCroppedImage';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const MemberInfoModal = ({ data, handleChange, handleLimit }) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="modal-header">
                <h3>{t('general.edit')}{t('member.info.label')}</h3>
            </div>

            <TextInput
                label={t('member.info.sadc_member_id')}
                type="number"
                value={data.sadc_member_id}
                onChange={handleChange('sadc_member_id')}
                required
            />

            <TextInput
                label={t('member.info.last_name')}
                value={data.last_name}
                onChange={handleChange('last_name')}
                onLimitExceeded={handleLimit('last_name')}
                required
            />

            <TextInput
                label={t('member.info.first_name')}
                value={data.first_name}
                onChange={handleChange('first_name')}
                onLimitExceeded={handleLimit('first_name')}
                required
            />

            <TextInput
                label={t('member.info.alt_name')}
                value={data.alt_name}
                onChange={handleChange('alt_name')}
                onLimitExceeded={handleLimit('alt_name')}
            />

            <TextInput
                label={t('member.info.phone')}
                type="number"
                value={data.phone}
                onChange={handleChange('phone')}
                onLimitExceeded={handleLimit('phone')}
                maxLength={10}
            />

            <TextInput
                label={t('member.info.address')}
                value={data.address}
                onChange={handleChange('address')}
                onLimitExceeded={handleLimit('address')}
                maxLength={220}
            />

            <TextInput
                label={t('member.info.email')}
                type="email"
                value={data.email}
                onChange={handleChange('email')}
                onLimitExceeded={handleLimit('email')}
                maxLength={220}
            />

            <TextInput
                label={t('member.info.medicaid')}
                value={data.medicaid?.toUpperCase()}
                onChange={handleChange('medicaid')}
                onLimitExceeded={handleLimit('medicaid')}
                maxLength={8}
            />

            <TextInput
                label={t('member.info.ssn')}
                type="number"
                value={data.ssn}
                onChange={handleChange('ssn')}
                onLimitExceeded={handleLimit('ssn')}
                maxLength={9}
            />

            <TextInput
                label={t('member.info.enrollment')}
                type="date"
                value={data.enrollment_date}
                onChange={handleChange('enrollment_date')}
            />

            <TextInput
                label={t('general.note')}
                value={data.note}
                onChange={handleChange('note')}
                onLimitExceeded={handleLimit('note')}
                maxLength={220}
            />
        </>
    );
};

const MemberInfoSideModal = ({ data, handleChange, languages }) => {
    const { t } = useTranslation();
    const [crop, setCrop] = useState();
    const [previewPhoto, setPreviewPhoto] = useState("/default-profile.jpg");

    useEffect(() => {
        async function loadPhoto() {
            if (!data.photo) return;
            const result = await formatPhoto(data.photo);
            setPreviewPhoto(result); 
        }
        loadPhoto();
    }, [data.photo])

    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setCrop(undefined);
            setPreviewPhoto(URL.createObjectURL(file));
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
                            src={previewPhoto}
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