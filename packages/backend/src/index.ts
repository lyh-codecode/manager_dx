import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { equipmentRouter } from './routes/equipment.js';
import { maintenanceRouter } from './routes/maintenance.js';
import { workshopRouter } from './routes/workshop.js';
import { statisticsRouter } from './routes/statistics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载 .env 文件，从 src 目录向上两级到 backend 目录
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 路由
app.use('/api/equipment', equipmentRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/workshop', workshopRouter);
app.use('/api/statistics', statisticsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '工业设备台账管理系统 API' });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
});

