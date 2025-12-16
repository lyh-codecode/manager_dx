import express, { Router } from 'express';
import pool from '../config/database.js';
import { z } from 'zod';

const router: Router = express.Router();

// 维修记录验证 schema
const maintenanceSchema = z.object({
  maintenance_id: z.string().min(1, '维修单号不能为空'),
  equipment_id: z.string().min(1, '设备编号不能为空'),
  maintenance_time: z.string(),
  fault_description: z.string().min(1, '故障描述不能为空'),
  fault_type: z.string().optional(),
  maintenance_cost: z.number().nonnegative('维修费用必须为非负数'),
});

// 获取所有维修记录（支持多条件筛选）
router.get('/', async (req, res) => {
  try {
    const { equipment_id, maintenance_time_start, maintenance_time_end, fault_type, workshop_id } = req.query;
    let sql = `
      SELECT m.*, e.model, e.workshop_id, w.workshop_name 
      FROM maintenance m 
      LEFT JOIN equipment e ON m.equipment_id = e.equipment_id 
      LEFT JOIN workshop w ON e.workshop_id = w.workshop_id 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (equipment_id) {
      sql += ' AND m.equipment_id = ?';
      params.push(equipment_id);
    }
    if (maintenance_time_start) {
      sql += ' AND m.maintenance_time >= ?';
      params.push(maintenance_time_start);
    }
    if (maintenance_time_end) {
      sql += ' AND m.maintenance_time <= ?';
      params.push(maintenance_time_end);
    }
    if (fault_type) {
      sql += ' AND m.fault_type = ?';
      params.push(fault_type);
    }
    if (workshop_id) {
      sql += ' AND e.workshop_id = ?';
      params.push(workshop_id);
    }

    sql += ' ORDER BY m.maintenance_time DESC';

    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个设备的完整维修历史
router.get('/equipment/:equipment_id', async (req, res) => {
  try {
    const { equipment_id } = req.params;
    const [rows] = await pool.execute(
      `SELECT m.*, e.model, w.workshop_name 
       FROM maintenance m 
       LEFT JOIN equipment e ON m.equipment_id = e.equipment_id 
       LEFT JOIN workshop w ON e.workshop_id = w.workshop_id 
       WHERE m.equipment_id = ? 
       ORDER BY m.maintenance_time DESC`,
      [equipment_id]
    );
    res.json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 新增维修记录
router.post('/', async (req, res) => {
  try {
    const data = maintenanceSchema.parse(req.body);

    // 检查设备是否存在
    const [equipment]: any = await pool.execute('SELECT * FROM equipment WHERE equipment_id = ?', [data.equipment_id]);
    if (equipment.length === 0) {
      return res.status(400).json({ success: false, error: '设备不存在' });
    }

    const [result]: any = await pool.execute(
      'INSERT INTO maintenance (maintenance_id, equipment_id, maintenance_time, fault_description, fault_type, maintenance_cost) VALUES (?, ?, ?, ?, ?, ?)',
      [
        data.maintenance_id,
        data.equipment_id,
        data.maintenance_time,
        data.fault_description,
        data.fault_type || null,
        data.maintenance_cost,
      ]
    );
    res.json({ success: true, data: { id: result.insertId, maintenance_id: data.maintenance_id } });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: '维修单号已存在' });
    }
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: error.errors[0].message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// 修改维修记录
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 创建更新 schema，所有字段都是可选的
    const updateSchema = z.object({
      maintenance_id: z.string().min(1).optional(),
      equipment_id: z.string().min(1).optional(),
      maintenance_time: z.string().optional(),
      fault_description: z.string().min(1).optional(),
      fault_type: z.string().optional().nullable(),
      maintenance_cost: z.number().nonnegative().optional(),
    });

    // 清理请求数据：移除空字符串和 null
    const cleanedData: any = {};
    Object.entries(req.body).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanedData[key] = value;
      } else if (key === 'fault_type' && (value === '' || value === null)) {
        // fault_type 允许设置为 null（清空故障类型）
        cleanedData[key] = null;
      }
    });

    const data = updateSchema.parse(cleanedData);

    // 检查维修记录是否存在
    const [existing]: any = await pool.execute('SELECT * FROM maintenance WHERE maintenance_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: '维修记录不存在' });
    }

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: '没有要更新的字段' });
    }

    values.push(id);
    await pool.execute(`UPDATE maintenance SET ${fields.join(', ')} WHERE maintenance_id = ?`, values);

    res.json({ success: true, message: '更新成功' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: error.errors[0].message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除维修记录
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM maintenance WHERE maintenance_id = ?', [id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as maintenanceRouter };

