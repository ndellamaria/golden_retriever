import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { Content } from '@your-project/shared-types';
import fs from 'fs/promises';
import path from 'path';

config();

const app = express();
const port = process.env.PORT || 8000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api/content', async (req, res) => {
    try {
        const jsonData = await fs.readFile(path.join(process.cwd(), 'data/content.json'), 'utf8');
        const parsedContent: Content = JSON.parse(jsonData);
        res.json(parsedContent);
    } catch (error) {
        res.status(500).json({ message: 'Error reading content.json', error: error });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});