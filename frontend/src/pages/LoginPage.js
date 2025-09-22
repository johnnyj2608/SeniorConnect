import React from 'react';
import { useTranslation } from 'react-i18next';
import PasswordField from '../components/inputs/PasswordField';
import Loader from '../components/layout/Loader';
import useLogin from '../hooks/useLogin';

const LoginPage = () => {
    const { t } = useTranslation();
    const {
        email, password, confirmPassword, code,
        verifyCode, forgotPassword, isSetPassword, loading,
        handleChange, handleSubmit, handleBack, setForgotPassword,
    } = useLogin();

    if (loading) return <Loader />;

    return (
        <div className="login-container">
            {(forgotPassword || isSetPassword || verifyCode) && (
                <button className="support-back-button" onClick={handleBack}>
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
    );
};

export default LoginPage;