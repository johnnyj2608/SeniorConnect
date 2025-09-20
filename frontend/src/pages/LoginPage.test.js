import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from './LoginPage';
import useLogin from '../hooks/useLogin';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../components/inputs/PasswordField', () => ({ value, onChange, isConfirm }) => (
    <input
        type="password"
        data-testid={isConfirm ? 'confirm-password' : 'password'}
        value={value}
        onChange={onChange}
    />
));

jest.mock('../components/layout/Loader', () => () => <div>Loader</div>);

jest.mock('../hooks/useLogin');

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderPage = (hookValues = {}) => {
        useLogin.mockReturnValue({
            email: '',
            password: '',
            confirmPassword: '',
            code: '',
            verifyCode: false,
            forgotPassword: false,
            isSetPassword: false,
            loading: false,
            handleChange: jest.fn(),
            handleSubmit: jest.fn(),
            handleBack: jest.fn(),
            setForgotPassword: jest.fn(),
            ...hookValues,
        });
        return render(<LoginPage />);
    };

    it('renders Loader when loading', () => {
        renderPage({ loading: true });
        expect(screen.getByText('Loader')).toBeInTheDocument();
    });

    it('renders email and password inputs on normal login', () => {
        renderPage();
        expect(screen.getByPlaceholderText('general.email')).toBeInTheDocument();
        expect(screen.getByTestId('password')).toBeInTheDocument();
        expect(screen.getByText('general.forgot_password')).toBeInTheDocument();
    });

    it('renders set password fields when isSetPassword is true', () => {
        renderPage({ isSetPassword: true });
        expect(screen.getByTestId('password')).toBeInTheDocument();
        expect(screen.getByTestId('confirm-password')).toBeInTheDocument();
    });

    it('renders verification code input when verifyCode is true', () => {
        renderPage({ verifyCode: true });
        expect(screen.getByPlaceholderText('general.enter_verification_code')).toBeInTheDocument();
    });

    it('calls handleSubmit when form is submitted', () => {
        const handleSubmit = jest.fn();
        const { container } = renderPage({ handleSubmit });

        const form = container.querySelector('form');
        fireEvent.submit(form);

        expect(handleSubmit).toHaveBeenCalled();
    });

    it('calls handleBack when back button is clicked', () => {
        const handleBack = jest.fn();
        renderPage({ isSetPassword: true, handleBack });
        fireEvent.click(screen.getByText(/← general.buttons.back/));
        expect(handleBack).toHaveBeenCalled();
    });

    it('calls setForgotPassword when forgot password is clicked', () => {
        const setForgotPassword = jest.fn();
        renderPage({ setForgotPassword });
        fireEvent.click(screen.getByText('general.forgot_password'));
        expect(setForgotPassword).toHaveBeenCalledWith(true);
    });
});