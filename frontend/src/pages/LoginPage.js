import React, { useState, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import PasswordField from '../components/inputs/PasswordField'
import { AuthContext } from '../context/AuthContext'
import Loader from '../components/layout/Loader'

const LoginPage = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const { user, setUser, loading } = useContext(AuthContext)

    const pathParts = location.pathname.split('/')
    const isSetPassword = pathParts[2] === 'set-password'
    const uid = isSetPassword ? pathParts[3] : null
    const token = isSetPassword ? pathParts[4] : null

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        if (!loading && user && !location.hash.startsWith('#/login')) {
            navigate('/')
        }
    }, [loading, user, navigate, location.hash])

    const handleChange = (field) => (event) => {
        const { value } = event.target
        if (field === 'email') setEmail(value)
        else if (field === 'password') setPassword(value)
        else if (field === 'confirmPassword') setConfirmPassword(value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (isSetPassword && password !== confirmPassword) {
            alert('Passwords do not match')
            return
        }

        try {
            const endpoint = isSetPassword 
                ? `/user/auth/set-password/${uid}/${token}/`
                : '/user/auth/login/'

            const body = isSetPassword 
                ? { password } 
                : { email, password }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                throw new Error('Request failed')
            }

            const data = await response.json()
            if (!isSetPassword) setUser(data.user)
            navigate('/')
        } catch (error) {
            console.error(error)
            alert('Invalid credentials')
        }
    }

    if (loading) return <Loader />

    return (
        <div className="login-container">
            <h1>Senior Connect</h1>
            <form onSubmit={handleSubmit}>
                {!isSetPassword && (
                    <input
                        type="email"
                        placeholder={t('general.email')}
                        value={email}
                        onChange={handleChange('email')}
                        required
                    />
                )}

                <PasswordField
                    value={password}
                    onChange={handleChange('password')}
                    isConfirm={false}
                />

                {isSetPassword && (
                    <PasswordField
                        value={confirmPassword}
                        onChange={handleChange('confirmPassword')}
                        isConfirm={true}
                    />
                )}

                <button className="login-submit" type="submit">
                    {isSetPassword ? t('general.set_password') : t('general.log_in')}
                </button>
            </form>
        </div>
    )
}

export default LoginPage