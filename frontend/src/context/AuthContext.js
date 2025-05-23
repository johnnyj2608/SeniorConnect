import React, { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchUser = async (retry = true) => {
        try {
            const res = await fetch('/user/auth/me/', {
                credentials: 'include',
            })

            if (res.ok) {
                const data = await res.json()
                setUser(data)
            } else if (res.status === 401 && retry) {
                const refreshRes = await fetch('/user/auth/refresh/', {
                    method: 'POST',
                    credentials: 'include',
                })

                if (refreshRes.ok) {
                    return fetchUser(false)
                } else {
                    setUser(null)
                }
            } else {
                setUser(null)
            }
        } catch (err) {
            console.error('Failed to fetch auth user:', err)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    )
}