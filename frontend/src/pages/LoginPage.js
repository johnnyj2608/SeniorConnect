import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import PasswordField from '../components/inputs/PasswordField'

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleChange = (field) => (event) => {
        const { value } = event.target;
      
        if (field === 'email') {
          setEmail(value);
        } else if (field === 'password') {
          setPassword(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/user/auth/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
              });
          
              if (!response.ok) {
                throw new Error('Login failed');
              }
          
              console.log('Logged in successfully');
              navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            alert('Invalid credentials');
        }
    };

    return (
        <div className="login-container">
            <h1>Senior Connect</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={handleChange('email')}
                    required
                />
                <PasswordField
                    value={password}
                    onChange={handleChange('password')}
                />
                <button className="login-submit" type="submit">Log In</button>
            </form>
        </div>  
    )
    }

export default LoginPage
