import 'dotenv/config';
import express from 'express';
import dataRoutes from './routes/dataRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import type { Request, Response } from 'express';
import cors from 'cors';

const app = express();
// const PORT = process.env.PORT || 3000;
const PORT = Number(process.env.PORT) || 3000;

// const corsOptions = {
//   origin: [
//     `http://localhost:${PORT}`,  // Your Vite dev server
//     `http://192.168.50.73:${PORT}`,  // Your local IP if accessing via IP
//     `https://nfmxngzc-${PORT}.inc1.devtunnels.ms`  // Your dev tunnel
//   ],
//   credentials: true
// };


app.use(express.json());
app.use(cors());
// app.use(cors(corsOptions));
app.use('/api/data', dataRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req: Request, res: Response) => {
  res.send('Dialysis Mock Backend Running');
});



// app.listen(PORT, () => {
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}); 