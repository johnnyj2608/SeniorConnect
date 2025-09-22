import React, { useContext } from 'react'
import { Navigate } from 'react-router'
import { AuthContext } from '../../context/AuthContext'
import Loader from '../layout/Loader'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext)

  if (loading) return <Loader />

  return user ? children : <Navigate to="/login" replace />
}

export default PrivateRoute
