import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { CATService } from '../modules/adaptive/cat.service';
import { IRTService } from '../modules/adaptive/irt.service';
import { BKTService } from '../modules/adaptive/bkt.service';

const prisma = new PrismaClient();
const catService = new CATService();
const irtService = new IRTService();
const bktService = new BKTService();

export class ExamController {

    // Start or Resume an Exam Session
    static async startSession(req: AuthRequest, res: Response) {
        try {
            const { assessmentId } = req.body;
            const studentId = req.user.userId;

            // Check if there is an active incomplete session
            const existingSession = await prisma.assessmentSession.findFirst({
                where: { studentId, assessmentId, isCompleted: false },
                orderBy: { startTime: 'desc' },
                include: { responses: true }
            });

            if (existingSession) {
                // Resume session: Get next question
                const answeredIds = existingSession.responses.map(r => r.questionId);
                const nextQuestion = await catService.selectNextQuestion(assessmentId, existingSession.currentTheta, answeredIds);

                if (!nextQuestion) {
                    // No more questions, complete session
                    await prisma.assessmentSession.update({
                        where: { id: existingSession.id },
                        data: { isCompleted: true, endTime: new Date() }
                    });
                    return res.json({ session: existingSession, completed: true });
                }

                return res.json({ session: existingSession, question: nextQuestion });
            }

            // Create new session
            const newSession = await prisma.assessmentSession.create({
                data: {
                    studentId,
                    assessmentId,
                    currentTheta: 0 // Start neutral
                }
            });

            const nextQuestion = await catService.selectNextQuestion(assessmentId, 0, []);
            res.json({ session: newSession, question: nextQuestion });

        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Submit an Answer
    static async submitAnswer(req: AuthRequest, res: Response) {
        try {
            const { sessionId, questionId, chosenOption, timeSpent, hintsUsed } = req.body;

            // 1. Get context: Session and Question
            const session = await prisma.assessmentSession.findUnique({ where: { id: sessionId }, include: { responses: true } });
            const question = await prisma.question.findUnique({ where: { id: questionId } });

            if (!session || !question) return res.status(404).json({ error: 'Session or Question not found' });
            if (session.isCompleted) return res.status(400).json({ error: 'Session already completed' });

            // 2. Evaluate Correctness
            // Note: In Tarea 3 request 'correctAnswer' was a String field to check against.
            // If options is JSON, we assume logic is simpler or matches 'correctAnswer'.

            // For now, assuming straightforward string comparison if 'correctAnswer' is stored
            const isCorrect = question.correctAnswer === chosenOption;

            // 3. Save Response
            await prisma.response.create({
                data: {
                    sessionId,
                    questionId,
                    isCorrect,
                    timeSpent,
                    hintsUsed: hintsUsed || {}
                }
            });

            // 4. Recalculate Theta (IRT)
            const allResponses = await prisma.response.findMany({
                where: { sessionId },
                include: { question: true }
            });

            const irtResponses = allResponses.map(r => ({
                question: { irtDifficulty: r.question.irtDifficulty, irtDiscrimination: r.question.irtDiscrimination },
                isCorrect: r.isCorrect
            }));

            const newTheta = irtService.estimateAbility(irtResponses);

            // Update Session Theta
            await prisma.assessmentSession.update({
                where: { id: sessionId },
                data: { currentTheta: newTheta }
            });

            // 5. Update Skill Mastery (BKT)
            // Find existing mastery or create default
            const studentId = session.studentId;
            const skillId = question.skillId;

            const masteryRecord = await prisma.studentSkillMastery.findUnique({
                where: { studentId_skillId: { studentId, skillId } }
            });

            const currentMastery = masteryRecord ? masteryRecord.masteryProbability : 0.1; // Default L0
            const newMastery = bktService.updateMastery(currentMastery, isCorrect);

            // Upsert Mastery
            await prisma.studentSkillMastery.upsert({
                where: { studentId_skillId: { studentId, skillId } },
                update: { masteryProbability: newMastery, nextReview: new Date() }, // SM2 simplistic update for now
                create: {
                    studentId,
                    skillId,
                    masteryProbability: newMastery,
                    nextReview: new Date()
                }
            });

            // 6. Next Question or Finish?
            // Simple stopping rule: 10 questions max or high precision (Standard Error < X - todo)
            const MAX_QUESTIONS = 10;
            if (allResponses.length >= MAX_QUESTIONS) {
                await prisma.assessmentSession.update({
                    where: { id: sessionId },
                    data: { isCompleted: true, endTime: new Date() }
                });
                return res.json({ completed: true, theta: newTheta, mastery: newMastery });
            }

            // Get next question
            const answeredIds = allResponses.map(r => r.questionId);
            const nextQuestion = await catService.selectNextQuestion(session.assessmentId, newTheta, answeredIds);

            if (!nextQuestion) {
                await prisma.assessmentSession.update({
                    where: { id: sessionId },
                    data: { isCompleted: true, endTime: new Date() }
                });
                return res.json({ completed: true, theta: newTheta, mastery: newMastery });
            }

            res.json({
                correct: isCorrect,
                newTheta,
                newMastery,
                nextQuestion,
                completed: false
            });

        } catch (error: any) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
}
