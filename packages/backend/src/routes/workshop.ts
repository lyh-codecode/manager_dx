import express, { Router } from 'express';
import pool from '../config/database.js';
import { z } from 'zod';

const router: Router = express.Router();

const workshopSchema = z.object({
  workshop_id: z.string().min(1, '车间编号不能为空'),
  workshop_name: z.string().min(1, '车间名称不能为空'),
});

// 获取所有车间
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM workshop ORDER BY workshop_id');
    res.json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 新增车间
router.post('/', async (req, res) => {
  try {
    const data = workshopSchema.parse(req.body);
    const [result]: any = await pool.execute(
      'INSERT INTO workshop (workshop_id, workshop_name) VALUES (?, ?)',
      [data.workshop_id, data.workshop_name]
    );
    res.json({ success: true, data: { id: result.insertId, workshop_id: data.workshop_id } });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: '车间编号已存在' });
    }
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: error.errors[0].message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as workshopRouter };

