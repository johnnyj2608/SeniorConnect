import React, { useState, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router'
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
    const [code, setCode] = useState('')
    const [verifyCode, setVerifyCode] = useState(false)
    const [forgotPassword, setForgotPassword] = useState(false)

    useEffect(() => {
        if (!loading && user && !isSetPassword) {
            navigate('/')
        }
    }, [loading, user, navigate, isSetPassword])

    const handleChange = (field) => (event) => {
        const { value } = event.target
        if (field === 'email') setEmail(value)
        else if (field === 'password') setPassword(value)
        else if (field === 'confirmPassword') setConfirmPassword(value)
        else if (field === 'code') setCode(value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            // 1. Set new password
            if (isSetPassword) {
                if (password !== confirmPassword) {
                    alert('Passwords do not match')
                    return
                }

                const response = await fetch(`/user/auth/set-password/${uid}/${token}/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ password }),
                })
                if (!response.ok) throw new Error('Request failed')
                setPassword('')
                setConfirmPassword('')
                navigate('/login')
                return
            }

            // 2. Forgot password
            if (forgotPassword) {
                if (!email) {
                    alert('Please enter your email')
                    return
                }
                await fetch('/user/auth/reset-password/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email }),
                })
                alert('If this email exists, a reset link has been sent.')
                return
            }

            // 3. Login / 2FA
            if (!verifyCode) {
                // Step 1: send email to get code
                const response = await fetch('/user/auth/login/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, password }),
                })
                if (!response.ok) throw new Error('Request failed')
                setVerifyCode(true)
                alert('Check your email for the verification code.')
            } else {
                // Step 2: verify code
                const response = await fetch('/user/auth/login/verify/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, code }),
                })
                if (!response.ok) throw new Error('Invalid code')
                const data = await response.json()
                setUser(data.user)
                navigate('/')
            }
        } catch (error) {
            console.error(error)
            alert(error.message)
        }
    }

    if (loading) return <Loader />

    return (
        <div className="login-container">
            {(forgotPassword || isSetPassword || verifyCode) && (
                <button
                    className="support-back-button"
                    onClick={() => {
                        setForgotPassword(false)
                        setPassword('')
                        setConfirmPassword('')
                        setCode('')
                        setVerifyCode(false)
                        if (isSetPassword) navigate('/login')
                    }}
                >
                    ← {t('general.buttons.back')}
                </button>
            )}
            <h1>Senior Connect</h1>
            <form onSubmit={handleSubmit}>
                {!isSetPassword && !verifyCode && (
                    <input
                        type="email"
                        placeholder={t('general.email')}
                        value={email}
                        onChange={handleChange('email')}
                        required
                    />
                )}

                {!forgotPassword && !verifyCode && !isSetPassword && (
                    <div>
                        <PasswordField
                            value={password}
                            onChange={handleChange('password')}
                        />
                        <p onClick={() => setForgotPassword(true)}>
                            {t('general.forgot_password')}
                        </p>
                    </div>
                )}

                {verifyCode && (
                    <input
                        type="text"
                        placeholder={t('general.enter_verification_code')}
                        value={code}
                        onChange={handleChange('code')}
                        required
                    />
                )}

                {isSetPassword && (
                    <>
                        <PasswordField
                            value={password}
                            onChange={handleChange('password')}
                        />
                        <PasswordField
                            value={confirmPassword}
                            onChange={handleChange('confirmPassword')}
                            isConfirm
                        />
                    </>
                )}

                <button className="login-submit" type="submit">
                    {isSetPassword
                        ? t('general.set_password')
                        : forgotPassword
                        ? t('general.forgot_password')
                        : verifyCode
                        ? t('general.verify_code')
                        : t('general.log_in')}
                </button>
            </form>
        </div>
    )
}

export default LoginPage