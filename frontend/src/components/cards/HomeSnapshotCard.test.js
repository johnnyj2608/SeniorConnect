import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import '@testing-library/jest-dom';
import HomeSnapshotCard from './HomeSnapshotCard';
import fetchWithRefresh from '../../utils/fetchWithRefresh';
import { AuthContext } from '../../context/AuthContext';
import { openFile } from '../../utils/fileUtils';
import * as Router from 'react-router';

jest.mock('../../utils/fetchWithRefresh');
jest.mock('../../utils/fileUtils');

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, options) => {
            if (options && options.month !== undefined) return `general.month.${options.month}`;
            return key;
        },
    }),
}));

describe('HomeSnapshotCard', () => {
    const user = { view_snapshots: true, is_org_admin: false };
    const snapshotsData = [
        { id: 1, type: 'birthdays', file: 'birthdays.pdf' },
        { id: 2, type: 'enrollments', file: 'enrollments.pdf' },
    ];

    const renderWithContext = (ui, authUser = user) =>
        render(
            <AuthContext.Provider value={{ user: authUser }}>
                <MemoryRouter>{ui}</MemoryRouter>
            </AuthContext.Provider>
        );

    it('renders snapshots correctly for authorized user', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => snapshotsData,
        });

        renderWithContext(<HomeSnapshotCard />);

        await waitFor(() => {
            expect(screen.getByText('snapshots.label')).toBeInTheDocument();

            snapshotsData.forEach((snapshot) => {
                const snapshotItem = screen.getByText((content) =>
                    content.includes(`snapshots.${snapshot.type}`)
                );
                expect(snapshotItem).toBeInTheDocument();
            });

            expect(screen.getByText('snapshots.see_archived')).toBeInTheDocument();
        });
    });

    it('opens file when snapshot item is clicked', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => snapshotsData,
        });

        renderWithContext(<HomeSnapshotCard />);

        await waitFor(() => {
            const birthdayItem = screen.getByText((content) =>
                content.includes('snapshots.birthdays')
            );
            fireEvent.click(birthdayItem.closest('li') || birthdayItem);
            expect(openFile).toHaveBeenCalledWith('birthdays.pdf');

            const enrollmentItem = screen.getByText((content) =>
                content.includes('snapshots.enrollments')
            );
            fireEvent.click(enrollmentItem.closest('li') || enrollmentItem);
            expect(openFile).toHaveBeenCalledWith('enrollments.pdf');
        });
    });

    it('does not render anything for unauthorized user', () => {
        const unauthorizedUser = { view_snapshots: false, is_org_admin: false };
        renderWithContext(<HomeSnapshotCard />, unauthorizedUser);

        expect(screen.queryByText('snapshots.label')).not.toBeInTheDocument();
    });

    it('navigates when "see archived" is clicked', async () => {
        const navigateMock = jest.fn();
        jest.spyOn(Router, 'useNavigate').mockReturnValue(navigateMock);

        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => snapshotsData,
        });

        renderWithContext(<HomeSnapshotCard />);

        await waitFor(() => {
            const archivedLink = screen.getByText('snapshots.see_archived');
            fireEvent.click(archivedLink);
            expect(navigateMock).toHaveBeenCalledWith('/registry?type=snapshots');
        });

        Router.useNavigate.mockRestore();
    });

    it('renders empty state when no snapshots', async () => {
        fetchWithRefresh.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        renderWithContext(<HomeSnapshotCard />);

        await waitFor(() => {
            const archivedLink = screen.getByText('snapshots.see_archived');
            expect(archivedLink).toBeInTheDocument();
        });
    });

    it('handles fetch failure gracefully', async () => {
        fetchWithRefresh.mockRejectedValueOnce(new Error('Network error'));

        renderWithContext(<HomeSnapshotCard />);

        await waitFor(() => {
            const archivedLink = screen.getByText('snapshots.see_archived');
            expect(archivedLink).toBeInTheDocument();
        });
    });
});