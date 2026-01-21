import { PrismaClient, Role, AssessmentType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seeding...');

    // 1. Clean up relevant tables (Optional, be careful in prod)
    // await prisma.response.deleteMany({});
    // await prisma.assessmentSession.deleteMany({});
    // await prisma.question.deleteMany({});
    // await prisma.assessment.deleteMany({});
    // await prisma.user.deleteMany({});

    // 2. Create Users
    const password = await bcrypt.hash('123456', 10);

    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@kubo.com' },
        update: {},
        create: {
            email: 'teacher@kubo.com',
            password,
            role: Role.TEACHER,
            firstName: 'Mr.',
            lastName: 'Teacher'
        }
    });

    const student = await prisma.user.upsert({
        where: { email: 'student@kubo.com' },
        update: {},
        create: {
            email: 'student@kubo.com',
            password,
            role: Role.STUDENT,
            firstName: 'Pepito',
            lastName: 'Student'
        }
    });

    console.log(`👤 Users created: ${teacher.email}, ${student.email}`);

    // 3. Create Course & Group
    const course = await prisma.course.create({
        data: {
            name: 'Física Fundamental',
            description: 'Curso introductorio de física y movimiento.',
            teacherId: teacher.id,
            groups: {
                create: {
                    name: 'Grupo A',
                    enrollments: {
                        create: { studentId: student.id }
                    }
                }
            }
        }
    });

    console.log(`📚 Course created: ${course.name}`);

    // 4. Create Skill
    const skill = await prisma.skill.create({
        data: {
            name: 'Cinemática Básica',
            description: 'Conceptos de velocidad, distancia y tiempo.'
        }
    });

    // 5. Create Adaptive Assessment
    const assessment = await prisma.assessment.create({
        data: {
            name: 'Examen Diagnóstico Cinemática',
            type: AssessmentType.QUIZ,
            isAdaptive: true
        }
    });

    console.log(`📝 Assessment created: ${assessment.name} (ID: ${assessment.id})`);

    // 6. Create Questions (Varying Difficulty)
    const questionsData = [
        {
            content: 'Si un coche viaja a 60 km/h durante 2 horas, ¿qué distancia recorre?',
            options: ["100 km", "120 km", "60 km", "30 km"],
            correctAnswer: "120 km",
            irtDifficulty: -2.0, // Very Easy
            irtDiscrimination: 1.0
        },
        {
            content: '¿Cuál es la unidad del SI para la velocidad?',
            options: ["km/h", "m/s²", "m/s", "mph"],
            correctAnswer: "m/s",
            irtDifficulty: -1.0, // Easy
            irtDiscrimination: 1.2
        },
        {
            content: 'Un objeto cae libremente. ¿Cuál es su aceleración aproximada?',
            options: ["9.8 m/s", "9.8 m/s²", "10 km/h", "0"],
            correctAnswer: "9.8 m/s²",
            irtDifficulty: 0.0, // Medium
            irtDiscrimination: 1.5
        },
        {
            content: 'Si la velocidad es constante, ¿cuál es la aceleración?',
            options: ["Constante positiva", "Cero", "Variable", "Infinita"],
            correctAnswer: "Cero",
            irtDifficulty: 1.0, // Hard
            irtDiscrimination: 1.8
        },
        {
            content: 'Calcula el tiempo para recorrer 500m a 20m/s con aceleración constante de 2m/s² partiendo del reposo.',
            options: ["10s", "15.8s", "25s", "50s"], // d = 0.5*a*t^2 => 500 = 1*t^2 => t = sqrt(500) ≈ 22.36 (Wait, options need to be better designed mathematically, but strictly for example)
            // Let's fix math: d = 1/2 a t^2. 500 = 0.5 * 2 * t^2. 500 = t^2. t = sqrt(500) = 22.36s.
            // Let's calculate simple: d = v*t (if const).
            // Let's use simple HARD question:
            // "Un coche acelera de 0 a 100 km/h en 5 segundos. ¿Cuál es su aceleración media?"
            // 100 km/h = 27.77 m/s. a = 27.77 / 5 = 5.55 m/s².
            content: 'Un coche acelera de 0 a 27.7 m/s (100 km/h) en 5 segundos. ¿Cuál es su aceleración media?',
            options: ["5.54 m/s²", "9.8 m/s²", "20 m/s²", "2.5 m/s²"],
            correctAnswer: "5.54 m/s²",
            irtDifficulty: 2.0, // Very Hard
            irtDiscrimination: 2.0
        }
    ];

    for (const q of questionsData) {
        await prisma.question.create({
            data: {
                content: q.content,
                type: 'MULTIPLE_CHOICE',
                options: JSON.stringify(q.options), // Storing as JSON string per schema expectation checks
                correctAnswer: q.correctAnswer,
                irtDifficulty: q.irtDifficulty,
                irtDiscrimination: q.irtDiscrimination,
                skillId: skill.id,
                assessments: {
                    create: {
                        assessmentId: assessment.id
                    }
                }
            }
        });
    }

    console.log('✅ Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
