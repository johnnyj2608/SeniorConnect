import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import ListDetail from './ListDetail';

describe('ListDetail', () => {
    it('renders label and value when no tabs are provided', () => {
        render(<ListDetail label="Test Label" value="Test Value" />);
        expect(screen.getByText('Test Label')).toBeInTheDocument();
        expect(screen.getByText('Test Value')).toBeInTheDocument();
    });

    it('renders nothing if no tabs and value is null', () => {
        const { container } = render(<ListDetail label="Label" value={null} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders tabs and default active content', () => {
        const tabs = [
            { key: 'tab1', label: 'Tab 1' },
            { key: 'tab2', label: 'Tab 2' },
        ];
        const tabContent = {
            tab1: <div>Content 1</div>,
            tab2: <div>Content 2</div>,
        };

        render(<ListDetail tabs={tabs} tabContent={tabContent} />);

        expect(screen.getByText('Tab 1')).toBeInTheDocument();
        expect(screen.getByText('Tab 2')).toBeInTheDocument();

        expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('changes active tab content when a tab is clicked', () => {
        const tabs = [
            { key: 'tab1', label: 'Tab 1' },
            { key: 'tab2', label: 'Tab 2' },
        ];
        const tabContent = {
            tab1: <div>Content 1</div>,
            tab2: <div>Content 2</div>,
        };

        render(<ListDetail tabs={tabs} tabContent={tabContent} />);

        fireEvent.click(screen.getByText('Tab 2'));
        expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('disables tabs when disabled prop is true', () => {
        const tabs = [{ key: 'tab1', label: 'Tab 1' }];
        const tabContent = { tab1: <div>Content 1</div> };

        render(<ListDetail tabs={tabs} tabContent={tabContent} disabled />);

        expect(screen.getByText('Tab 1')).toBeDisabled();
    });
});