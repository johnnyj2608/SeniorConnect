import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MemberPhotoCard from './MemberPhotoCard';
import usePreferences from '../../hooks/usePreferences';
import { formatPhoto } from '../../utils/formatUtils';

jest.mock('../../hooks/usePreferences', () => jest.fn());
jest.mock('../../utils/formatUtils', () => ({
    formatPhoto: jest.fn(),
}));

describe('MemberPhotoCard', () => {
    const defaultData = {
        first_name: 'John',
        last_name: 'Doe',
        alt_name: 'Johnny',
        photo: 'photo.jpg',
        active: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        usePreferences.mockReturnValue(false);
        formatPhoto.mockImplementation(async (path) => `signed-${path}`);
    });

    it('renders photo and names correctly with default preferences', async () => {
        render(<MemberPhotoCard data={defaultData} />);

        await waitFor(() => {
            expect(screen.getByRole('img')).toHaveAttribute('src', 'signed-photo.jpg');
        });

        expect(screen.getByText('Doe, John')).toBeInTheDocument();
        expect(screen.getByText('Johnny')).toBeInTheDocument();
    });

    it('renders primary name as alt_name when preference is true', async () => {
        usePreferences.mockReturnValue(true);

        render(<MemberPhotoCard data={defaultData} />);

        await waitFor(() => {
            expect(screen.getByRole('img')).toHaveAttribute('src', 'signed-photo.jpg');
        });

        expect(screen.getByText('Johnny')).toBeInTheDocument();
        expect(screen.getByText('Doe, John')).toBeInTheDocument();
    });

    it('renders small class when small prop is true', async () => {
        render(<MemberPhotoCard data={defaultData} small={true} />);

        const img = await screen.findByRole('img');
        expect(img).toHaveClass('member-photo small');
    });

    it('adds inactive class if member is inactive', async () => {
        render(<MemberPhotoCard data={{ ...defaultData, active: false }} />);

        const img = await screen.findByRole('img');
        expect(img).toHaveClass('member-photo inactive');
    });

    it('uses provided photo prop if given', async () => {
        render(<MemberPhotoCard data={defaultData} photo="custom.jpg" />);

        const img = await screen.findByRole('img');
        expect(img).toHaveAttribute('src', 'custom.jpg');
        expect(formatPhoto).not.toHaveBeenCalled();
    });

    it('refreshes photo on error', async () => {
        render(<MemberPhotoCard data={defaultData} />);

        const img = await screen.findByRole('img');

        fireEvent.error(img);

        await waitFor(() => {
            expect(formatPhoto).toHaveBeenCalledWith('photo.jpg');
        });
    });

    it('renders nothing if no data', () => {
        const { container } = render(<MemberPhotoCard data={null} />);
        expect(container).toBeEmptyDOMElement();
    });
});