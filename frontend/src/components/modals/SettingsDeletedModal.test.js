import React from 'react';
import { render, screen } from '@testing-library/react';
import SettingsDeletedModal from './SettingsDeletedModal';

jest.mock('../cards/MemberPhotoCard', () => ({ data, small }) => (
    <div>
        MemberPhotoCard: {data?.first_name || ''} {small && '(small)'}
    </div>
));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

describe('SettingsDeletedModal', () => {
    const sampleData = [
        { id: 1, first_name: 'John', last_name: 'Doe', birth_date: '1990-01-01', deleted: true },
        { id: 2, first_name: 'Jane', last_name: 'Smith', birth_date: '1985-06-15', deleted: false },
    ];

    it('renders modal header', () => {
        render(<SettingsDeletedModal data={sampleData} activeTab={0} />);
        expect(screen.getByText('settings.data.restore_deleted')).toBeInTheDocument();
    });

    it('renders MemberPhotoCard and formatted birth date for active deleted tab', () => {
        render(<SettingsDeletedModal data={sampleData} activeTab={0} />);
        expect(screen.getByText(/MemberPhotoCard: John/)).toBeInTheDocument();

        const formattedDate = new Date(sampleData[0].birth_date).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            timeZone: 'UTC',
        });
        expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });

    it('renders no_deleted message when no deleted tabs exist', () => {
        // All items deleted => no non-deleted items
        const allDeleted = [
            { id: 1, first_name: 'John', deleted: true },
            { id: 2, first_name: 'Jane', deleted: true },
        ];

        render(<SettingsDeletedModal data={allDeleted} activeTab={0} />);
        expect(screen.getByText('settings.data.no_deleted')).toBeInTheDocument();
    });


    it('handles out-of-range activeTab gracefully', () => {
        render(<SettingsDeletedModal data={sampleData} activeTab={5} />);

        expect(screen.getByText(/MemberPhotoCard:/)).toBeInTheDocument();

        const birthDateElement = screen.getByRole('heading', { level: 2 });
        expect(birthDateElement).toBeEmptyDOMElement();
    });
});
