import mergeSortedArrays from './mergeSortedArrays';

describe('mergeSortedArrays', () => {
    it('merges two sorted arrays of numbers', () => {
        const arr1 = [1, 4, 7];
        const arr2 = [2, 3, 6, 8];
        const result = mergeSortedArrays([arr1, arr2], x => x);
        expect(result).toEqual([1, 2, 3, 4, 6, 7, 8]);
    });

    it('merges multiple sorted arrays', () => {
        const arr1 = [1, 5];
        const arr2 = [2, 6];
        const arr3 = [0, 3, 4];
        const result = mergeSortedArrays([arr1, arr2, arr3], x => x);
        expect(result).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });

    it('returns empty array if all input arrays are empty', () => {
        expect(mergeSortedArrays([[], [], []], x => x)).toEqual([]);
    });

    it('handles arrays with different lengths', () => {
        const arr1 = [1];
        const arr2 = [0, 2, 4];
        const result = mergeSortedArrays([arr1, arr2], x => x);
        expect(result).toEqual([0, 1, 2, 4]);
    });

    it('works with objects and a key function', () => {
        const arr1 = [{ id: 2 }, { id: 5 }];
        const arr2 = [{ id: 1 }, { id: 3 }];
        const result = mergeSortedArrays([arr1, arr2], obj => obj.id);
        expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 5 }]);
    });

    it('handles empty array list', () => {
        expect(mergeSortedArrays([], x => x)).toEqual([]);
    });

    it('handles arrays with duplicate keys', () => {
        const arr1 = [1, 3, 5];
        const arr2 = [1, 2, 3];
        const result = mergeSortedArrays([arr1, arr2], x => x);
        expect(result).toEqual([1, 1, 2, 3, 3, 5]);
    });
});