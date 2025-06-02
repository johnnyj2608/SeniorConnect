import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

const PrivateRoute = ({ children }) => {
  const { t } = useTranslation()
  const { user, loading } = useContext(AuthContext)

  if (loading) 
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h2>{t('general.loading')}...</h2>
      </div>
    )

  return user ? children : <Navigate to="/login" replace />
}

export default PrivateRoute
