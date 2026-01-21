import { IRTService } from './irt.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const irtService = new IRTService();

export class CATService {
    async selectNextQuestion(assessmentId: string, currentTheta: number, answeredIds: string[]) {
        // 1. Get all candidate questions for this assessment
        const candidates = await prisma.question.findMany({
            where: {
                assessments: { some: { assessmentId } }, // Questions belonging to this assessment
                id: { notIn: answeredIds }               // That haven't been answered yet
            }
        });

        if (candidates.length === 0) {
            return null; // Return null if no questions are left
        }

        // 2. Information Maximization
        // Calculate Fisher Information for each candidate at the current theta
        let bestQuestion = null;
        let maxInfo = -1;

        for (const question of candidates) {
            const info = irtService.calculateInformation(currentTheta, question.irtDifficulty, question.irtDiscrimination);

            if (info > maxInfo) {
                maxInfo = info;
                bestQuestion = question;
            }
        }

        return bestQuestion;
    }
}
