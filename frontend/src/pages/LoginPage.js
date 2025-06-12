import React, { useState, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import PasswordField from '../components/inputs/PasswordField'
import { AuthContext } from '../context/AuthContext'
import Loader from '../components/layout/Loader'

const LoginPage = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user, setUser, loading } = useContext(AuthContext)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        if (!loading && user) {
            navigate('/')
        }
    }, [loading, user, navigate])

    const handleChange = (field) => (event) => {
        const { value } = event.target
            if (field === 'email') {
            setEmail(value)
        } else if (field === 'password') {
            setPassword(value)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch('/user/auth/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            })

            if (!response.ok) {
                throw new Error('Login failed')
            }

            const data = await response.json()
            setUser(data.user)
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
                <input
                    type="email"
                    placeholder={t('general.email')}
                    value={email}
                    onChange={handleChange('email')}
                    required
                />
                <PasswordField
                    value={password}
                    onChange={handleChange('password')}
                />
                <button className="login-submit" type="submit">
                    {t('general.log_in')}
                </button>
            </form>
        </div>
    )
}

export default LoginPage