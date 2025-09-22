import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsItem from './SettingsItem';

describe('SettingsItem', () => {
    it('renders the label correctly', () => {
        render(<SettingsItem label="Profile" />);
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('applies classes correctly when nav, active, and clickable', () => {
        const handleClick = jest.fn();
        render(<SettingsItem label="Profile" isNav isActive onClick={handleClick} />);
        const item = screen.getByText('Profile').closest('div');
        expect(item).toHaveClass('settings-item nav active clickable');
    });

    it('calls onClick when clicked', () => {
        const handleClick = jest.fn();
        render(<SettingsItem label="Profile" onClick={handleClick} />);
        const item = screen.getByText('Profile').closest('div');
        fireEvent.click(item);
        expect(handleClick).toHaveBeenCalled();
    });
});