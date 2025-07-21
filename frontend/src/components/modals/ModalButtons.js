import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as InfoIcon } from '../../assets/info.svg';

const CancelButton = ({ onClose }) => {
    const { t } = useTranslation();
    
    return (
        <button className="action-button" onClick={() => onClose()}>
            {t('general.buttons.cancel')}
        </button>
    );
};

const DeleteButton = ({ type, showDeleteButton, onDelete, onClearQueue }) => {
    const { t } = useTranslation();
    
    if (!showDeleteButton) return null;
    
    if (type === 'gifteds') {
        return (
            <button 
                className="icon-button tooltip"
                data-tooltip={t('member.gifts.modal_tooltip')}
            >
                <InfoIcon />
            </button>
        );
    }
    
    return (
        <button
            className={`action-button ${type === 'deleted' ? '' : 'destructive'}`}
            onClick={() => {
                if (type === 'attendance') {
                    onClearQueue();
                } else {
                    onDelete();
                }
            }}
        >
            {type === 'deleted'
                ? t('general.buttons.restore')
                : type === 'attendance'
                ? t('general.buttons.clear')
                : t('general.buttons.delete')}
        </button>
    );
};

const SaveButton = ({ type, hasQueuedMembers, inputLimitExceeded, onSave, onGenerate }) => {
    const { t } = useTranslation();
    
    return (
        <button
            className="action-button"
            onClick={() => {
                if (type === 'attendance') {
                    onGenerate();
                } else {
                    onSave();
                }
            }}
            disabled={(type === 'attendance' && !hasQueuedMembers) || inputLimitExceeded}
        >
            {type === 'attendance' ? t('general.buttons.generate') : t('general.buttons.save')}
        </button>
    );
};

export { CancelButton, DeleteButton, SaveButton };