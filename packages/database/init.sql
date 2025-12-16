-- 创建数据库
CREATE DATABASE IF NOT EXISTS equipment_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE equipment_management;

-- 创建车间信息表
CREATE TABLE IF NOT EXISTS workshop (
    workshop_id VARCHAR(50) PRIMARY KEY COMMENT '车间编号',
    workshop_name VARCHAR(100) NOT NULL COMMENT '车间名称',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车间信息表';

-- 创建设备信息表
CREATE TABLE IF NOT EXISTS equipment (
    equipment_id VARCHAR(50) PRIMARY KEY COMMENT '设备编号',
    model VARCHAR(100) NOT NULL COMMENT '型号',
    factory_date DATE COMMENT '出厂日期',
    purchase_price DECIMAL(10, 2) NOT NULL COMMENT '采购价格',
    workshop_id VARCHAR(50) NOT NULL COMMENT '所属车间',
    responsible_person VARCHAR(50) NOT NULL COMMENT '负责人',
    status ENUM('在用', '维修', '报废') NOT NULL DEFAULT '在用' COMMENT '设备状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (workshop_id) REFERENCES workshop(workshop_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_workshop_id (workshop_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备信息表';

-- 创建维修记录表（使用列存储优化，但 MySQL 不支持列存储，这里使用 InnoDB 并添加合适的索引）
CREATE TABLE IF NOT EXISTS maintenance (
    maintenance_id VARCHAR(50) PRIMARY KEY COMMENT '维修单号',
    equipment_id VARCHAR(50) NOT NULL COMMENT '设备编号',
    maintenance_time DATETIME NOT NULL COMMENT '维修时间',
    fault_description TEXT NOT NULL COMMENT '故障描述',
    fault_type VARCHAR(100) COMMENT '故障类型',
    maintenance_cost DECIMAL(10, 2) NOT NULL DEFAULT 0 COMMENT '维修费用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_equipment_id (equipment_id),
    INDEX idx_maintenance_time (maintenance_time),
    INDEX idx_equipment_time (equipment_id, maintenance_time),
    INDEX idx_fault_type (fault_type),
    CHECK (maintenance_cost >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='维修记录表';

