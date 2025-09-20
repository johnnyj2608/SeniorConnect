import React from 'react';
import { render, screen } from '@testing-library/react';

import DragOverlay from './DragOverlay';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: key => key }),
}));

jest.mock('../../assets/upload.svg', () => ({
    ReactComponent: () => <svg data-testid="upload-icon" />,
}));

describe('DragOverlay', () => {
    it('renders overlay with icon and text when not disabled', () => {
        render(<DragOverlay disabled={false} />);
        
        expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
        expect(screen.getByText('member.files.drop_to_upload')).toBeInTheDocument();
        expect(screen.getByText('member.files.drop_to_upload').closest('div')).toHaveClass('upload-overlay');
    });

    it('renders nothing when disabled is true', () => {
        const { container } = render(<DragOverlay disabled={true} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when disabled is not provided', () => {
        const { container } = render(<DragOverlay />);
        expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    });
});