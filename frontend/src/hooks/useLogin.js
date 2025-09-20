import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { AuthContext } from '../context/AuthContext';

const useLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, setUser, loading } = useContext(AuthContext);

    const pathParts = location.pathname.split('/');
    const isSetPassword = pathParts[2] === 'set-password';
    const uid = isSetPassword ? pathParts[3] : null;
    const token = isSetPassword ? pathParts[4] : null;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [code, setCode] = useState('');
    const [verifyCode, setVerifyCode] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);

    useEffect(() => {
        if (!loading && user && !isSetPassword) {
            navigate('/');
        }
    }, [loading, user, navigate, isSetPassword]);

    const handleChange = (field) => (e) => {
        const { value } = e.target;
        switch (field) {
            case 'email':
                setEmail(value);
                break;
            case 'password':
                setPassword(value);
                break;
            case 'confirmPassword':
                setConfirmPassword(value);
                break;
            case 'code':
                setCode(value);
                break;
            default:
                break;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isSetPassword) {
                if (password !== confirmPassword) {
                    alert('Passwords do not match');
                    return;
                }
                const response = await fetch(`/user/auth/set-password/${uid}/${token}/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ password }),
                });
                if (!response.ok) throw new Error('Request failed');
                setPassword('');
                setConfirmPassword('');
                navigate('/login');
                return;
            }

            if (forgotPassword) {
                if (!email) {
                    alert('Please enter your email');
                    return;
                }
                await fetch('/user/auth/reset-password/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email }),
                });
                alert('If this email exists, a reset link has been sent.');
                return;
            }

            if (!verifyCode) {
                const response = await fetch('/user/auth/login/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, password }),
                });
                if (!response.ok) throw new Error('Request failed');
                setVerifyCode(true);
                alert('Check your email for the verification code.');
            } else {
                const response = await fetch('/user/auth/login/verify/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, code }),
                });
                if (!response.ok) throw new Error('Invalid code');
                const data = await response.json();
                setUser(data.user);
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const handleBack = () => {
        setForgotPassword(false);
        setPassword('');
        setConfirmPassword('');
        setCode('');
        setVerifyCode(false);
        if (isSetPassword) navigate('/login');
    };

    return {
        email,
        password,
        confirmPassword,
        code,
        verifyCode,
        forgotPassword,
        isSetPassword,
        loading,
        handleChange,
        handleSubmit,
        handleBack,
        setForgotPassword,
    };
};

export default useLogin;
