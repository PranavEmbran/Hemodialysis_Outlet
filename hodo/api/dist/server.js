import 'dotenv/config';
import express from 'express';
import dataRoutes from './routes/dataRoutes.js';
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
app.use('/api/data', dataRoutes);
app.get('/', (req, res) => {
    res.send('Dialysis Mock Backend Running');
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
