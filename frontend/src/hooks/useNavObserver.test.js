import { renderHook } from '@testing-library/react';
import useNavObserver from './useNavObserver';

describe('useNavObserver', () => {
    let observeMock;
    let disconnectMock;

    beforeEach(() => {
        observeMock = jest.fn();
        disconnectMock = jest.fn();

        global.IntersectionObserver = jest.fn(function(callback, options) {
            this.observe = observeMock;
            this.disconnect = disconnectMock;
            this.trigger = (entries) => callback(entries); 
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('observes all provided section elements', () => {
        document.body.innerHTML = `
            <div id="section1"></div>
            <div id="section2"></div>
        `;

        const sections = [{ id: 'section1' }, { id: 'section2' }];
        const setActiveSection = jest.fn();

        renderHook(() => useNavObserver(sections, setActiveSection));

        expect(observeMock).toHaveBeenCalledTimes(2);
    });

    it('calls setActiveSection when a section intersects', () => {
        document.body.innerHTML = `<div id="section1"></div>`;
        const sections = [{ id: 'section1' }];
        const setActiveSection = jest.fn();

        const { result } = renderHook(() => useNavObserver(sections, setActiveSection));

        // simulate intersection
        global.IntersectionObserver.mock.instances[0].trigger([
            { target: document.getElementById('section1'), isIntersecting: true }
        ]);

        expect(setActiveSection).toHaveBeenCalledWith('section1');
    });

    it('disconnects observer on cleanup', () => {
        const sections = [{ id: 'section1' }];
        const setActiveSection = jest.fn();

        const { unmount } = renderHook(() => useNavObserver(sections, setActiveSection));

        unmount();

        expect(disconnectMock).toHaveBeenCalled();
    });
});