import getCroppedImg from './getCroppedImage';

describe('getCroppedImg', () => {
    let mockImage;
    let mockCanvas;
    let mockCtx;
    let originalCreateElement;

    beforeEach(() => {
        // Mock HTMLCanvasElement and context
        mockCtx = {
            drawImage: jest.fn(),
        };
        mockCanvas = {
            width: 0,
            height: 0,
            getContext: jest.fn(() => mockCtx),
            toBlob: jest.fn((cb) => cb('mockBlob')),
        };

        // Mock document.createElement
        originalCreateElement = document.createElement;
        document.createElement = jest.fn(() => mockCanvas);

        // Mock image
        mockImage = {
            width: 200,
            height: 100,
            naturalWidth: 400,
            naturalHeight: 200,
        };
    });

    afterEach(() => {
        document.createElement = originalCreateElement;
        jest.clearAllMocks();
    });

    it('creates a canvas with crop dimensions', async () => {
        const crop = { x: 10, y: 5, width: 50, height: 25 };
        await getCroppedImg(mockImage, crop);

        expect(mockCanvas.width).toBe(crop.width);
        expect(mockCanvas.height).toBe(crop.height);
    });

    it('calls drawImage with scaled crop coordinates', async () => {
        const crop = { x: 10, y: 5, width: 50, height: 25 };
        await getCroppedImg(mockImage, crop);

        expect(mockCtx.drawImage).toHaveBeenCalledWith(
            mockImage,
            crop.x * 2,  // scaleX = 400/200
            crop.y * 2,  // scaleY = 200/100
            crop.width * 2,
            crop.height * 2,
            0,
            0,
            crop.width,
            crop.height
        );
    });

    it('resolves with a blob', async () => {
        const crop = { x: 0, y: 0, width: 100, height: 50 };
        const blob = await getCroppedImg(mockImage, crop);

        expect(blob).toBe('mockBlob');
        expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg');
    });
});