# 工业设备台账管理系统

基于 React + Node.js + MySQL 的全栈管理系统

## 项目结构

```
guanlixitong/
├── packages/
│   ├── frontend/     # React 前端应用
│   ├── backend/      # Node.js 后端服务
│   └── database/     # 数据库脚本
├── package.json
└── pnpm-workspace.yaml
```

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Ant Design
- **后端**: Node.js + Express + TypeScript + MySQL2
- **数据库**: MySQL
- **包管理**: pnpm workspace (monorepo)

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发环境

```bash
pnpm dev
```

这将同时启动前端和后端服务。

### 数据库初始化

1. 创建 MySQL 数据库
2. 配置后端 `.env` 文件
3. 运行数据库初始化脚本

## 功能特性

- ✅ 设备信息 CRUD 操作
- ✅ 维修记录管理
- ✅ 车间设备统计
- ✅ 维修趋势分析
- ✅ 多条件筛选查询
- ✅ DB4AI 时序预测（可选）

