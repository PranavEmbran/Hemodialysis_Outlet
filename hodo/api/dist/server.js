import 'dotenv/config';
import express from 'express';
import dataRoutes from './routes/dataRoutes.js';
const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());
app.use('/api/data', dataRoutes);
app.get('/', (req, res) => {
    res.send('Dialysis Mock Backend Running');
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
