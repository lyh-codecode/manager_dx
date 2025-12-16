import express, { Router } from 'express';
import pool from '../config/database.js';

const router: Router = express.Router();

// 车间设备统计
router.get('/workshop', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        w.workshop_id,
        w.workshop_name,
        COUNT(e.equipment_id) as total_equipment,
        SUM(CASE WHEN e.status = '在用' THEN 1 ELSE 0 END) as in_use_count,
        COUNT(m.maintenance_id) as total_maintenance_times
      FROM workshop w
      LEFT JOIN equipment e ON w.workshop_id = e.workshop_id
      LEFT JOIN maintenance m ON e.equipment_id = m.equipment_id
      GROUP BY w.workshop_id, w.workshop_name
      ORDER BY w.workshop_id
    `);
    res.json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 维修趋势统计（按月统计）
router.get('/maintenance-trend', async (req, res) => {
  try {
    const { equipment_id, workshop_id, start_month, end_month } = req.query;
    let sql = `
      SELECT 
        DATE_FORMAT(maintenance_time, '%Y-%m') as month,
        COUNT(*) as maintenance_count,
        SUM(maintenance_cost) as total_cost
      FROM maintenance m
      LEFT JOIN equipment e ON m.equipment_id = e.equipment_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (equipment_id) {
      sql += ' AND m.equipment_id = ?';
      params.push(equipment_id);
    }
    if (workshop_id) {
      sql += ' AND e.workshop_id = ?';
      params.push(workshop_id);
    }
    if (start_month) {
      sql += ' AND DATE_FORMAT(maintenance_time, "%Y-%m") >= ?';
      params.push(start_month);
    }
    if (end_month) {
      sql += ' AND DATE_FORMAT(maintenance_time, "%Y-%m") <= ?';
      params.push(end_month);
    }

    sql += ' GROUP BY DATE_FORMAT(maintenance_time, "%Y-%m") ORDER BY month';

    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 设备状态统计
router.get('/equipment-status', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM equipment
      GROUP BY status
    `);
    res.json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as statisticsRouter };

