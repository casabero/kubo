import express, { Request, Response } from 'express';
import logger from './logger';
import { z } from 'zod';
import * as math from 'mathjs';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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

app.listen(port, () => {
    logger.info(`Backend server running at http://localhost:${port}`);
});
