export class BKTService {
    private params = { L0: 0.1, T: 0.1, G: 0.25, S: 0.1 }; // Configuración conservadora

    updateMastery(currentMastery: number, isCorrect: boolean): number {
        const { T, G, S } = this.params;
        const pLearend = currentMastery;
        const pCorrectGivenLearned = 1 - S;
        const pCorrectGivenNotLearned = G;

        const pCorrect = pLearend * pCorrectGivenLearned + (1 - pLearend) * pCorrectGivenNotLearned;
        let pLearnedGivenResult = 0;

        if (isCorrect) {
            pLearnedGivenResult = (pLearend * pCorrectGivenLearned) / pCorrect;
        } else {
            pLearnedGivenResult = (pLearend * S) / (1 - pCorrect);
        }

        // Probabilidad de transición (aprender tras el intento)
        const newMastery = pLearnedGivenResult + (1 - pLearnedGivenResult) * T;
        return Math.max(0, Math.min(1, newMastery));
    }
}
