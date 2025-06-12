import React from 'react'
import { useTranslation } from 'react-i18next'

const Loader = () => {
    const { t } = useTranslation()

    return (
        <div className="loading-container" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <h2>{t('general.loading')}...</h2>
        </div>
    )
}

export default Loader