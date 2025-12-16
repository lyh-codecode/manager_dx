import express, { Router } from 'express';
import pool from '../config/database.js';
import { z } from 'zod';

const router: Router = express.Router();

// 设备信息验证 schema
const equipmentSchema = z.object({
  equipment_id: z.string().min(1, '设备编号不能为空'),
  model: z.string().min(1, '型号不能为空'),
  factory_date: z.string().optional().or(z.literal('')),
  purchase_price: z.number().nonnegative('采购价格必须为非负数'),
  workshop_id: z.string().min(1, '车间编号不能为空'),
  responsible_person: z.string().min(1, '负责人不能为空'),
  status: z.enum(['在用', '维修', '报废'], {
    errorMap: () => ({ message: '设备状态必须是：在用、维修或报废' }),
  }),
});

// 获取所有设备（支持查询和筛选）
router.get('/', async (req, res) => {
  try {
    const { equipment_id, model, workshop_id, status, keyword } = req.query;
    let sql = 'SELECT e.*, w.workshop_name FROM equipment e LEFT JOIN workshop w ON e.workshop_id = w.workshop_id WHERE 1=1';
    const params: any[] = [];

    if (equipment_id) {
      sql += ' AND e.equipment_id = ?';
      params.push(equipment_id);
    }
    if (model) {
      sql += ' AND e.model LIKE ?';
      params.push(`%${model}%`);
    }
    if (workshop_id) {
      sql += ' AND e.workshop_id = ?';
      params.push(workshop_id);
    }
    if (status) {
      sql += ' AND e.status = ?';
      params.push(status);
    }
    if (keyword) {
      sql += ' AND (e.equipment_id LIKE ? OR e.model LIKE ? OR w.workshop_name LIKE ?)';
      const keywordPattern = `%${keyword}%`;
      params.push(keywordPattern, keywordPattern, keywordPattern);
    }

    sql += ' ORDER BY e.equipment_id';

    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个设备详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.execute(
      'SELECT e.*, w.workshop_name FROM equipment e LEFT JOIN workshop w ON e.workshop_id = w.workshop_id WHERE e.equipment_id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: '设备不存在' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 新增设备
router.post('/', async (req, res) => {
  try {
    const data = equipmentSchema.parse(req.body);
    const [result]: any = await pool.execute(
      'INSERT INTO equipment (equipment_id, model, factory_date, purchase_price, workshop_id, responsible_person, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        data.equipment_id,
        data.model,
        data.factory_date,
        data.purchase_price,
        data.workshop_id,
        data.responsible_person,
        data.status,
      ]
    );
    res.json({ success: true, data: { id: result.insertId, equipment_id: data.equipment_id } });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: '设备编号已存在' });
    }
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: error.errors[0].message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// 修改设备信息
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 创建更新 schema，所有字段都是可选的，但如果有值需要符合验证规则
    const updateSchema = z.object({
      equipment_id: z.string().min(1).optional(),
      model: z.string().min(1).optional(),
      factory_date: z.string().optional().or(z.literal('')).nullable(),
      purchase_price: z.number().nonnegative().optional(),
      workshop_id: z.string().min(1).optional(),
      responsible_person: z.string().min(1).optional(),
      status: z.enum(['在用', '维修', '报废']).optional(),
    });

    // 清理请求数据：移除空字符串和 null
    const cleanedData: any = {};
    Object.entries(req.body).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanedData[key] = value;
      } else if (key === 'factory_date' && (value === '' || value === null)) {
        // factory_date 允许设置为 null（清空日期）
        cleanedData[key] = null;
      }
    });

    const data = updateSchema.parse(cleanedData);

    // 检查设备是否存在
    const [existing]: any = await pool.execute('SELECT * FROM equipment WHERE equipment_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: '设备不存在' });
    }

    // 如果状态是"在用"，不允许直接报废
    if (data.status === '报废' && existing[0].status === '在用') {
      return res.status(400).json({ success: false, error: '在用设备不能直接报废，请先修改状态' });
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
    await pool.execute(`UPDATE equipment SET ${fields.join(', ')} WHERE equipment_id = ?`, values);

    res.json({ success: true, message: '更新成功' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: error.errors[0].message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除设备（仅支持未使用的设备）
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查设备是否存在及是否有维修记录
    const [equipment]: any = await pool.execute('SELECT * FROM equipment WHERE equipment_id = ?', [id]);
    if (equipment.length === 0) {
      return res.status(404).json({ success: false, error: '设备不存在' });
    }

    // 检查是否有维修记录
    const [maintenance]: any = await pool.execute('SELECT COUNT(*) as count FROM maintenance WHERE equipment_id = ?', [id]);
    if (maintenance[0].count > 0) {
      return res.status(400).json({ success: false, error: '该设备存在维修记录，无法删除' });
    }

    await pool.execute('DELETE FROM equipment WHERE equipment_id = ?', [id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as equipmentRouter };

