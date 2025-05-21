import React, { useState, useEffect } from 'react'

const LoginPage = () => {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Email:', email);
        console.log('Password:', password);
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
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={handleChange('password')}
                    required
                />
                <button type="submit">Log In</button>
            </form>
        </div>  
    )
    }

export default LoginPage
