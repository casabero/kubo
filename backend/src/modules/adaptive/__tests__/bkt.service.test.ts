import { BKTService } from '../bkt.service';

describe('BKTService', () => {
    let bktService: BKTService;

    beforeEach(() => {
        bktService = new BKTService();
    });

    test('updateMastery should increase mastery after correct response', () => {
        const initialMastery = 0.5;
        const newMastery = bktService.updateMastery(initialMastery, true);
        expect(newMastery).toBeGreaterThan(initialMastery);
    });

    test('updateMastery should decrease mastery after incorrect response', () => {
        const initialMastery = 0.5;
        const newMastery = bktService.updateMastery(initialMastery, false);
        expect(newMastery).toBeLessThan(initialMastery);
    });

    test('updateMastery should never exceed 1 or go below 0', () => {
        expect(bktService.updateMastery(0.99, true)).toBeLessThanOrEqual(1);
        expect(bktService.updateMastery(0.01, false)).toBeGreaterThanOrEqual(0);
    });
});
