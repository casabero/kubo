export class IRTService {
    // Probabilidad 2PL: P(θ) = 1 / (1 + e^(-a(θ - b)))
    calculateProbability(theta: number, difficulty: number, discrimination: number): number {
        const exponent = -discrimination * (theta - difficulty);
        return 1 / (1 + Math.exp(exponent));
    }

    // Estimación Newton-Raphson con Clamping (Seguridad Numérica)
    estimateAbility(responses: { question: { irtDifficulty: number, irtDiscrimination: number }, isCorrect: boolean }[]): number {
        let theta = 0; // Inicio neutral
        const maxIterations = 20;
        const tolerance = 0.001;

        for (let i = 0; i < maxIterations; i++) {
            let derivative = 0;
            let secondDerivative = 0;

            for (const r of responses) {
                const { irtDifficulty: b, irtDiscrimination: a } = r.question;
                const p = this.calculateProbability(theta, b, a);
                const q = 1 - p;
                const y = r.isCorrect ? 1 : 0;

                derivative += a * (y - p);
                secondDerivative -= a * a * p * q;
            }

            if (Math.abs(secondDerivative) < 1e-5) break; // Evitar división por cero
            const change = derivative / secondDerivative;
            theta = theta - change;

            // CLAMPING: Evitar valores extremos irreales
            theta = Math.max(-4, Math.min(4, theta));

            if (Math.abs(change) < tolerance) return theta;
        }
        return theta;
    }

    calculateInformation(theta: number, difficulty: number, discrimination: number): number {
        const p = this.calculateProbability(theta, difficulty, discrimination);
        return discrimination * discrimination * p * (1 - p);
    }
}
