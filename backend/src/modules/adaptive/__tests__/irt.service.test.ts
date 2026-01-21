import { IRTService } from '../irt.service';

describe('IRTService', () => {
    let irtService: IRTService;

    beforeEach(() => {
        irtService = new IRTService();
    });

    test('calculateProbability should return expected probability', () => {
        // Difficulty 0, Discrimination 1, Theta 0 => Prob 0.5
        expect(irtService.calculateProbability(0, 0, 1)).toBeCloseTo(0.5);
    });

    test('estimateAbility should converge correctly after correct answers', () => {
        const responses = [
            { question: { irtDifficulty: -1, irtDiscrimination: 1 }, isCorrect: true },
            { question: { irtDifficulty: 0, irtDiscrimination: 1 }, isCorrect: true },
            { question: { irtDifficulty: 1, irtDiscrimination: 1 }, isCorrect: true }
        ];
        const theta = irtService.estimateAbility(responses);
        expect(theta).toBeGreaterThan(0.5); // Should imply higher ability
    });

    test('estimateAbility should converge correctly after wrong answers', () => {
        const responses = [
            { question: { irtDifficulty: -1, irtDiscrimination: 1 }, isCorrect: false },
            { question: { irtDifficulty: 0, irtDiscrimination: 1 }, isCorrect: false },
            { question: { irtDifficulty: 1, irtDiscrimination: 1 }, isCorrect: false }
        ];
        const theta = irtService.estimateAbility(responses);
        expect(theta).toBeLessThan(-0.5); // Should imply lower ability
    });

    test('estimateAbility should clamp values between -4 and 4', () => {
        const responses = [
            { question: { irtDifficulty: 5, irtDiscrimination: 2 }, isCorrect: true }, // Extremely hard
            { question: { irtDifficulty: 5, irtDiscrimination: 2 }, isCorrect: true },
            { question: { irtDifficulty: 5, irtDiscrimination: 2 }, isCorrect: true },
            { question: { irtDifficulty: 5, irtDiscrimination: 2 }, isCorrect: true }
        ];
        // Even with extreme performance, it should not exceed limit immediately or go to Infinity
        const theta = irtService.estimateAbility(responses);
        expect(theta).toBeLessThanOrEqual(4);
        expect(theta).toBeGreaterThanOrEqual(-4);
    });
});
