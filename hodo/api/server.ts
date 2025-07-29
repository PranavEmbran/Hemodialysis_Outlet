import 'dotenv/config';
import express from 'express';
import dataRoutes from './routes/dataRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import type { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use('/api/data', dataRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req: Request, res: Response) => {
  res.send('Dialysis Mock Backend Running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 