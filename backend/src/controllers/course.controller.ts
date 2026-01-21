import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export class CourseController {
    // Create a new course
    static async create(req: AuthRequest, res: Response) {
        try {
            const { name, description } = req.body;
            const teacherId = req.user.userId;

            const course = await prisma.course.create({
                data: {
                    name,
                    description,
                    teacherId
                }
            });

            res.status(201).json(course);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Get all courses for the logged-in teacher
    static async getMyCourses(req: AuthRequest, res: Response) {
        try {
            const teacherId = req.user.userId;
            const courses = await prisma.course.findMany({
                where: { teacherId },
                include: { groups: true }
            });
            res.json(courses);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get a specific course
    static async getById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const course = await prisma.course.findUnique({
                where: { id },
                include: { groups: true }
            });

            if (!course) return res.status(404).json({ error: 'Course not found' });

            // Optional: Check if the requesting teacher owns the course
            // if (course.teacherId !== req.user.userId) return res.status(403)...

            res.json(course);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
