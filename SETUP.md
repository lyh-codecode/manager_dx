# 项目设置指南

## 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MySQL >= 8.0.0

## 安装步骤

### 1. 安装依赖

```bash
pnpm install
```

### 2. 数据库设置

#### 2.1 创建数据库

登录 MySQL，执行以下命令创建数据库：

```bash
mysql -u root -p
```

然后执行：

```sql
source packages/database/init.sql
```

或者直接运行：

```bash
mysql -u root -p < packages/database/init.sql
```

#### 2.2 插入初始数据

```bash
mysql -u root -p equipment_management < packages/database/seed.sql
```

如果需要生成完整的300条维修记录，可以运行：

```bash
cd packages/database
node generate_seed.js
mysql -u root -p equipment_management < seed_maintenance.sql
```

### 3. 配置后端环境变量

在 `packages/backend` 目录下创建 `.env` 文件：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=equipment_management
PORT=3001
```

### 4. 启动项目

#### 方式一：同时启动前端和后端（推荐）

在项目根目录运行：

```bash
pnpm dev
```

#### 方式二：分别启动

**启动后端：**

```bash
cd packages/backend
pnpm dev
```

**启动前端：**

```bash
cd packages/frontend
pnpm dev
```

### 5. 访问应用

- 前端：http://localhost:3000
- 后端 API：http://localhost:3001

## 项目结构

```
guanlixitong/
├── packages/
│   ├── frontend/          # React 前端应用
│   │   ├── src/
│   │   │   ├── api/       # API 接口定义
│   │   │   ├── components/# React 组件
│   │   │   └── pages/     # 页面组件
│   │   └── package.json
│   ├── backend/           # Node.js 后端服务
│   │   ├── src/
│   │   │   ├── routes/    # API 路由
│   │   │   ├── config/    # 配置文件
│   │   │   └── index.ts   # 入口文件
│   │   └── package.json
│   └── database/          # 数据库脚本
│       ├── init.sql       # 数据库初始化脚本
│       ├── seed.sql       # 初始数据脚本
│       └── generate_seed.js # 生成更多数据的脚本
├── package.json           # Monorepo 根配置
└── pnpm-workspace.yaml    # pnpm workspace 配置
```

## 功能说明

### 已实现功能

1. **设备管理**
   - ✅ 设备列表查询（支持多条件筛选）
   - ✅ 新增设备
   - ✅ 编辑设备信息
   - ✅ 删除设备（仅支持无维修记录的设备）
   - ✅ 设备详情查看
   - ✅ 设备状态过滤（在用/维修/报废）

2. **维修记录管理**
   - ✅ 维修记录列表查询
   - ✅ 多条件筛选（设备、车间、故障类型、时间范围）
   - ✅ 新增维修记录
   - ✅ 编辑维修记录
   - ✅ 删除维修记录
   - ✅ 设备维修历史关联查询

3. **统计分析**
   - ✅ 车间设备统计（总数、在用数、维修次数）
   - ✅ 设备状态统计
   - ✅ 维修趋势统计（按月统计，支持按车间/设备筛选）
   - ✅ 维修费用统计图表

### 数据库设计

- **workshop 表**：车间信息
- **equipment 表**：设备信息（外键关联 workshop）
- **maintenance 表**：维修记录（外键关联 equipment）

### API 接口

#### 设备相关
- `GET /api/equipment` - 获取设备列表
- `GET /api/equipment/:id` - 获取设备详情
- `POST /api/equipment` - 新增设备
- `PUT /api/equipment/:id` - 更新设备
- `DELETE /api/equipment/:id` - 删除设备

#### 维修记录相关
- `GET /api/maintenance` - 获取维修记录列表
- `GET /api/maintenance/equipment/:equipment_id` - 获取设备维修历史
- `POST /api/maintenance` - 新增维修记录
- `PUT /api/maintenance/:id` - 更新维修记录
- `DELETE /api/maintenance/:id` - 删除维修记录

#### 统计相关
- `GET /api/statistics/workshop` - 车间设备统计
- `GET /api/statistics/maintenance-trend` - 维修趋势统计
- `GET /api/statistics/equipment-status` - 设备状态统计

## 开发说明

### 添加新功能

1. 后端：在 `packages/backend/src/routes/` 添加新路由
2. 前端：在 `packages/frontend/src/api/` 添加 API 调用，在 `packages/frontend/src/pages/` 添加页面

### 数据库迁移

如需修改数据库结构，请更新 `packages/database/init.sql` 文件。

## 常见问题

### 1. 数据库连接失败

检查 `.env` 文件中的数据库配置是否正确，确保 MySQL 服务正在运行。

### 2. 端口被占用

修改 `packages/backend/.env` 中的 `PORT` 或 `packages/frontend/vite.config.ts` 中的 `server.port`。

### 3. 前端无法连接后端

确保后端服务已启动，并检查 `vite.config.ts` 中的代理配置。

