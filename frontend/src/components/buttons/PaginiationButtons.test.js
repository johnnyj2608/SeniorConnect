import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaginationButtons from './PaginationButtons';

describe('PaginationButtons', () => {
    const totalPages = 5;
    let currentPage;
    let setCurrentPage;

    const renderComponent = () => {
        render(
            <PaginationButtons
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
            />
        );
    };

    beforeEach(() => {
        setCurrentPage = jest.fn();
    });

    it('renders prev/next buttons and input', () => {
        currentPage = 2;
        renderComponent();

        const prevButton = screen.getByRole('button', { name: /previous page/i });
        const nextButton = screen.getByRole('button', { name: /next page/i });
        const input = screen.getByRole('spinbutton', { name: /current page/i });

        expect(prevButton).toBeInTheDocument();
        expect(nextButton).toBeInTheDocument();
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue(currentPage);
    });

    it('disables prev button on first page', () => {
        currentPage = 1;
        renderComponent();

        const prevButton = screen.getByRole('button', { name: /previous page/i });
        expect(prevButton).toBeDisabled();
    });

    it('disables next button on last page', () => {
        currentPage = totalPages;
        renderComponent();

        const nextButton = screen.getByRole('button', { name: /next page/i });
        expect(nextButton).toBeDisabled();
    });

    it('clicking prev/next buttons calls setCurrentPage correctly', async () => {
        currentPage = 3;
        renderComponent();

        const prevButton = screen.getByRole('button', { name: /previous page/i });
        const nextButton = screen.getByRole('button', { name: /next page/i });

        await userEvent.click(prevButton);
        expect(setCurrentPage).toHaveBeenCalledWith(currentPage - 1);

        await userEvent.click(nextButton);
        expect(setCurrentPage).toHaveBeenCalledWith(currentPage + 1);
    });

    it('updates input and calls setCurrentPage on blur with valid input', async () => {
        currentPage = 2;
        renderComponent();

        const input = screen.getByRole('spinbutton', { name: /current page/i });

        await userEvent.clear(input);
        await userEvent.type(input, '4');
        fireEvent.blur(input);

        expect(setCurrentPage).toHaveBeenCalledWith(4);
        expect(input).toHaveValue(4);
    });

    it('resets input if number is invalid on blur', async () => {
        currentPage = 2;
        renderComponent();

        const input = screen.getByRole('spinbutton', { name: /current page/i });

        await userEvent.clear(input);
        await userEvent.type(input, '999');
        fireEvent.blur(input);

        expect(setCurrentPage).not.toHaveBeenCalled();
        expect(input).toHaveValue(currentPage);
    });

    it('triggers blur handler when pressing Enter in input', async () => {
        currentPage = 2;
        renderComponent();

        const input = screen.getByRole('spinbutton', { name: /current page/i });

        await userEvent.clear(input);
        await userEvent.type(input, '3{enter}');

        expect(setCurrentPage).toHaveBeenCalledWith(3);
        expect(input).toHaveValue(3);
    });
});
