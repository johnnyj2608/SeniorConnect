import React from 'react';
import { render, screen } from '@testing-library/react';
import PrivateRoute from './PrivateRoute';
import { AuthContext } from '../../context/AuthContext';
import { Navigate } from 'react-router';

// Mock Loader
jest.mock('../layout/Loader', () => () => <div>Loading...</div>);

// Mock Navigate
jest.mock('react-router', () => {
    const actual = jest.requireActual('react-router');
    return {
        ...actual,
        Navigate: jest.fn(() => null),
    };
});

describe('PrivateRoute', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders Loader when loading is true', () => {
        render(
            <AuthContext.Provider value={{ user: null, loading: true }}>
                <PrivateRoute>
                    <div>Protected Content</div>
                </PrivateRoute>
            </AuthContext.Provider>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders children when user is authenticated', () => {
        render(
            <AuthContext.Provider value={{ user: { id: 1 }, loading: false }}>
                <PrivateRoute>
                    <div>Protected Content</div>
                </PrivateRoute>
            </AuthContext.Provider>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects to /login when user is not authenticated', () => {
        render(
            <AuthContext.Provider value={{ user: null, loading: false }}>
                <PrivateRoute>
                    <div>Protected Content</div>
                </PrivateRoute>
            </AuthContext.Provider>
        );

        expect(Navigate).toHaveBeenCalledWith(
            { to: '/login', replace: true },
            expect.anything()
        );
    });
});