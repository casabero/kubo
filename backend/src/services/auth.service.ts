import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils';

const prisma = new PrismaClient();

export class AuthService {
    static async register(data: any) {
        const { email, password, role } = data;
        const hashedPassword = await bcrypt.hash(password, 10);

        return prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role as Role,
            },
        });
    }

    static async login(data: any) {
        const { email, password } = data;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid credentials');
        }

        const accessToken = generateAccessToken({ userId: user.id, role: user.role });
        const refreshToken = generateRefreshToken({ userId: user.id });

        return { user, accessToken, refreshToken };
    }

    static async refresh(token: string) {
        // Logic to verify refresh token and generate new tokens
        // In a real app, you'd check a whitelist/blacklist of refresh tokens
        return { accessToken: generateAccessToken({}), refreshToken: generateRefreshToken({}) };
    }
}
