import React from 'react';
import { render } from '@testing-library/react';
import ScrollUp from './ScrollUp';
import { useLocation } from 'react-router';

jest.mock('react-router', () => ({
    useLocation: jest.fn(),
}));

describe('ScrollUp', () => {
    const scrollToMock = jest.fn();

    beforeAll(() => {
        Object.defineProperty(window, 'scrollTo', {
            value: scrollToMock,
            writable: true,
        });
    });

    beforeEach(() => {
        scrollToMock.mockClear();
    });

    it('calls window.scrollTo on mount', () => {
        useLocation.mockReturnValue({ pathname: '/test' });

        render(<ScrollUp />);

        expect(scrollToMock).toHaveBeenCalledWith(0, 0);
    });

    it('calls window.scrollTo when pathname changes', () => {
        useLocation.mockReturnValue({ pathname: '/first-path' });
        const { rerender } = render(<ScrollUp />);

        useLocation.mockReturnValue({ pathname: '/new-path' });
        rerender(<ScrollUp />);

        expect(scrollToMock).toHaveBeenCalledWith(0, 0);
    });
});