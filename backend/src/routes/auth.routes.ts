import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
    try {
        const user = await AuthService.register(req.body);
        res.status(201).json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { user, accessToken, refreshToken } = await AuthService.login(req.body);

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({ user, accessToken });
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
});

router.post('/refresh', async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'Refresh token required' });

    try {
        const { accessToken, refreshToken } = await AuthService.refresh(token);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({ accessToken });
    } catch (error: any) {
        res.status(403).json({ error: 'Invalid refresh token' });
    }
});

export default router;
