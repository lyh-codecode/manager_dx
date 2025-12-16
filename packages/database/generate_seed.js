// 生成300条维修记录的脚本
const fs = require('fs');
const path = require('path');

// 设备编号列表
const equipmentIds = [];
for (let i = 1; i <= 50; i++) {
  equipmentIds.push(`EQ${String(i).padStart(3, '0')}`);
}

// 故障类型
const faultTypes = ['主轴异常噪音', '液压系统泄漏', '电气系统故障', '冷却系统故障', '刀具磨损严重', '传动系统故障', '润滑系统故障'];
const faultDescriptions = {
  '主轴异常噪音': '主轴运行过程中出现异常噪音，需要检查轴承和主轴组件',
  '液压系统泄漏': '液压系统出现泄漏，需要更换密封件',
  '电气系统故障': '电气控制系统故障，需要检查电路和控制器',
  '冷却系统故障': '冷却系统无法正常工作，需要清洗和维修',
  '刀具磨损严重': '刀具磨损严重，需要更换新刀具',
  '传动系统故障': '传动系统出现故障，需要检查齿轮和皮带',
  '润滑系统故障': '润滑系统故障，需要添加润滑油和检查油路'
};

// 生成维修记录
const maintenanceRecords = [];
let maintenanceId = 51; // 从 MT051 开始

// 生成2023年1月到2024年10月的数据
const startDate = new Date('2023-01-01');
const endDate = new Date('2024-10-31');

for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + Math.floor(Math.random() * 5) + 1)) {
  if (maintenanceRecords.length >= 300) break;
  
  const equipmentId = equipmentIds[Math.floor(Math.random() * equipmentIds.length)];
  const faultType = faultTypes[Math.floor(Math.random() * faultTypes.length)];
  const maintenanceTime = new Date(date);
  maintenanceTime.setHours(Math.floor(Math.random() * 8) + 8);
  maintenanceTime.setMinutes(Math.floor(Math.random() * 60));
  
  const maintenanceCost = Math.floor(Math.random() * 4000) + 1500; // 1500-5500之间
  
  maintenanceRecords.push({
    maintenance_id: `MT${String(maintenanceId++).padStart(3, '0')}`,
    equipment_id: equipmentId,
    maintenance_time: maintenanceTime.toISOString().slice(0, 19).replace('T', ' '),
    fault_description: faultDescriptions[faultType],
    fault_type: faultType,
    maintenance_cost: maintenanceCost.toFixed(2)
  });
}

// 生成SQL插入语句
const sqlStatements = maintenanceRecords.map(record => {
  return `('${record.maintenance_id}', '${record.equipment_id}', '${record.maintenance_time}', '${record.fault_description}', '${record.fault_type}', ${record.maintenance_cost})`;
});

const sql = `-- 插入300条维修记录
INSERT INTO maintenance (maintenance_id, equipment_id, maintenance_time, fault_description, fault_type, maintenance_cost) VALUES
${sqlStatements.join(',\n')}
ON DUPLICATE KEY UPDATE 
    equipment_id = VALUES(equipment_id),
    maintenance_time = VALUES(maintenance_time),
    fault_description = VALUES(fault_description),
    fault_type = VALUES(fault_type),
    maintenance_cost = VALUES(maintenance_cost);`;

// 写入文件
const outputPath = path.join(__dirname, 'seed_maintenance.sql');
fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`✅ 已生成 ${maintenanceRecords.length} 条维修记录到 ${outputPath}`);

