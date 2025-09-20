import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsGiftModal from './SettingsGiftModal';

// Mock i18n
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

// Mock TextInput
jest.mock('../inputs/TextInput', () => (props) => (
    <label>
        {props.label}
        <input {...props} readOnly={props.disabled || props.showDisabled} />
    </label>
));

// Mock fetchWithRefresh
jest.mock('../../utils/fetchWithRefresh', () => jest.fn(() => Promise.resolve({
    ok: true,
    blob: () => Promise.resolve(new Blob()),
})));

const noop = () => {};

const mltcs = [{ name: 'MLTC1' }, { name: 'MLTC2' }];

const sampleData = [
    {
        id: 1,
        name: 'Gift 1',
        received: true,
        created_at: '1970-01-20T11:13:00Z',
        note: 'Test note',
    },
];

describe('SettingsGiftModal', () => {
    it('renders TextInput and checkbox for gifteds', () => {
        render(
            <SettingsGiftModal
                type="gifteds"
                data={sampleData}
                handleChange={noop}
                activeTab={0}
                mltcs={mltcs}
                handleLimit={noop}
            />
        );

        // The received checkbox (role="checkbox")
        const receivedCheckbox = screen.getByRole('checkbox', { name: 'settings.admin.gifts.received' });
        expect(receivedCheckbox).toBeInTheDocument();

        // Name input
        expect(screen.getByLabelText('settings.admin.gifts.name')).toBeInTheDocument();

        // Received timestamp input (read-only)
        const receivedTextInput = screen.getAllByLabelText('settings.admin.gifts.received').find(
            (el) => el.tagName.toLowerCase() === 'input' && el.readOnly
        );
        expect(receivedTextInput).toBeInTheDocument();

        // Note input
        expect(screen.getByLabelText('general.note')).toBeInTheDocument();
    });

    it('calls handleChange when received checkbox is clicked', () => {
        const handleChange = jest.fn(() => noop);

        render(
            <SettingsGiftModal
                type="gifteds"
                data={sampleData}
                handleChange={handleChange}
                activeTab={0}
                mltcs={mltcs}
                handleLimit={noop}
            />
        );

        const checkbox = screen.getByRole('checkbox', { name: 'settings.admin.gifts.received' });
        fireEvent.click(checkbox);

        expect(handleChange).toHaveBeenCalledWith('received');
    });

    it('renders MLTC and birth month selects for gifts type', () => {
        render(
            <SettingsGiftModal
                type="gifts"
                data={sampleData}
                handleChange={noop}
                activeTab={0}
                mltcs={mltcs}
                handleLimit={noop}
            />
        );

        // MLTC select
        expect(screen.getByLabelText('settings.admin.gifts.mltc')).toBeInTheDocument();

        // Birth month select
        expect(screen.getByLabelText('settings.admin.gifts.birth_month')).toBeInTheDocument();
    });

    it('calls fetchGiftedData buttons without crashing', () => {
        render(
            <SettingsGiftModal
                type="gifts"
                data={sampleData}
                handleChange={noop}
                activeTab={0}
                mltcs={mltcs}
                handleLimit={noop}
            />
        );

        const buttons = screen.getAllByRole('button');
        buttons.forEach((btn) => {
            fireEvent.click(btn);
        });
    });
});