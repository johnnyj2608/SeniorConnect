import { renderHook, act } from '@testing-library/react';
import useLogin from './useLogin';
import { AuthContext } from '../context/AuthContext';
import { MemoryRouter, Route, Routes } from 'react-router';

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigate,
}));

global.alert = jest.fn();
global.fetch = jest.fn();

const wrapper = ({ children, user = null, loading = false, initialPath = '/login' }) => (
    <AuthContext.Provider value={{ user, setUser: jest.fn(), loading }}>
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route path="*" element={children} />
            </Routes>
        </MemoryRouter>
    </AuthContext.Provider>
);

describe('useLogin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('redirects to / if user is already logged in', () => {
        renderHook(() => useLogin(), {
            wrapper: ({ children }) => wrapper({ children, user: { id: 1 } }),
        });

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('updates state on handleChange', () => {
        const { result } = renderHook(() => useLogin(), { wrapper });

        act(() => {
            result.current.handleChange('email')({ target: { value: 'test@example.com' } });
        });

        expect(result.current.email).toBe('test@example.com');
    });

    it('handles set-password mismatch', async () => {
        const { result } = renderHook(() => useLogin(), {
            wrapper: ({ children }) =>
                wrapper({ children, initialPath: '/user/set-password/123/abc' }),
        });

        act(() => {
            result.current.handleChange('password')({ target: { value: 'pass1' } });
            result.current.handleChange('confirmPassword')({ target: { value: 'pass2' } });
        });

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: jest.fn() });
        });

        expect(global.alert).toHaveBeenCalledWith('Passwords do not match');
        expect(global.fetch).not.toHaveBeenCalled();
    });


    it('handles forgot password flow', async () => {
        global.fetch.mockResolvedValue({ ok: true });

        const { result } = renderHook(() => useLogin(), { wrapper });

        act(() => {
            result.current.setForgotPassword(true);
            result.current.handleChange('email')({ target: { value: 'test@example.com' } });
        });

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: jest.fn() });
        });

        expect(global.fetch).toHaveBeenCalledWith(
            '/user/auth/reset-password/',
            expect.any(Object)
        );
        expect(global.alert).toHaveBeenCalledWith('If this email exists, a reset link has been sent.');
    });

    it('handles login then verify code flow', async () => {
        // first login attempt
        global.fetch.mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ user: { id: 1 } }),
        });

        const setUser = jest.fn();
        const { result } = renderHook(() => useLogin(), {
            wrapper: ({ children }) =>
                <AuthContext.Provider value={{ user: null, setUser, loading: false }}>
                    <MemoryRouter initialEntries={['/login']}>{children}</MemoryRouter>
                </AuthContext.Provider>
        });

        act(() => {
            result.current.handleChange('email')({ target: { value: 'test@example.com' } });
            result.current.handleChange('password')({ target: { value: 'secret' } });
        });

        // first submit: login
        await act(async () => {
            await result.current.handleSubmit({ preventDefault: jest.fn() });
        });

        expect(global.alert).toHaveBeenCalledWith('Check your email for the verification code.');
        expect(result.current.verifyCode).toBe(true);

        // second submit: verify
        act(() => {
            result.current.handleChange('code')({ target: { value: '123456' } });
        });

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: jest.fn() });
        });

        expect(setUser).toHaveBeenCalledWith({ id: 1 });
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('resets state on handleBack', () => {
        const { result } = renderHook(() => useLogin(), { wrapper });

        act(() => {
            result.current.setForgotPassword(true);
            result.current.handleChange('password')({ target: { value: 'pass' } });
            result.current.handleChange('confirmPassword')({ target: { value: 'pass' } });
            result.current.handleChange('code')({ target: { value: '123' } });
        });

        act(() => {
            result.current.handleBack();
        });

        expect(result.current.forgotPassword).toBe(false);
        expect(result.current.password).toBe('');
        expect(result.current.code).toBe('');
    });
});