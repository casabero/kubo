import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import logger from './logger';
import { z } from 'zod';
import * as math from 'mathjs';
import authRoutes from './routes/auth.routes';

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.url} from ${req.headers.origin || 'no-origin'}`);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());
app.use(cookieParser());

// Auth routes
app.use('/auth', authRoutes);

// Identify backend
app.get('/', (req: Request, res: Response) => {
    res.send('Kubo API Backend - Online');
});

// Healthcheck endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Example route using mathjs and zod
app.post('/calculate', (req: Request, res: Response) => {
    const schema = z.object({
        expression: z.string(),
    });

    try {
        const { expression } = schema.parse(req.body);
        const result = math.evaluate(expression);
        logger.info(`Calculation: ${expression} = ${result}`);
        res.json({ result });
    } catch (error) {
        logger.error(`Error processing calculation: ${error}`);
        res.status(400).json({ error: 'Invalid expression or request body' });
    }
});

app.listen(Number(port), '0.0.0.0', () => {
    logger.info(`Backend server running at http://0.0.0.0:${port}`);
});
