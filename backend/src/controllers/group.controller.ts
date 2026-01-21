import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export class GroupController {
    // Create a group within a course
    static async create(req: AuthRequest, res: Response) {
        try {
            const { name, courseId } = req.body;

            // Verify course ownership logic could go here

            const group = await prisma.group.create({
                data: {
                    name,
                    courseId
                }
            });

            res.status(201).json(group);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Get groups for a course
    static async getByCourse(req: AuthRequest, res: Response) {
        try {
            const { courseId } = req.params;
            const groups = await prisma.group.findMany({
                where: { courseId },
                include: { _count: { select: { enrollments: true } } }
            });
            res.json(groups);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
