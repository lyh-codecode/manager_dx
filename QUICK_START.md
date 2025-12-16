# 快速启动指南

## 🚀 启动项目

### 方法一：使用启动脚本（推荐）

```bash
./start.sh
```

### 方法二：使用 pnpm

```bash
pnpm dev
```

### 方法三：分别启动前后端

**终端1 - 启动后端：**
```bash
cd packages/backend
pnpm dev
```

**终端2 - 启动前端：**
```bash
cd packages/frontend
pnpm dev
```

## 📍 访问地址

- **前端页面：** http://localhost:3000
- **后端API：** http://localhost:3001/api/health

## ⚠️ 如果页面无法打开

### 1. 检查服务是否启动

打开终端，应该看到类似输出：

**前端：**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**后端：**
```
🚀 服务器运行在 http://localhost:3001
```

### 2. 检查端口占用

```bash
# 检查端口3000
lsof -ti:3000

# 检查端口3001
lsof -ti:3001

# 如果端口被占用，停止进程
kill -9 $(lsof -ti:3000)
kill -9 $(lsof -ti:3001)
```

### 3. 检查浏览器控制台

1. 打开浏览器访问 http://localhost:3000
2. 按 `F12` 打开开发者工具
3. 查看 **Console** 标签页是否有错误
4. 查看 **Network** 标签页，确认资源加载情况

### 4. 常见问题

#### ❌ 页面显示空白
- 打开浏览器开发者工具（F12）
- 查看 Console 是否有错误
- 检查 Network 标签页，确认资源是否加载

#### ❌ 无法连接到服务器
- 确认服务已启动（查看终端输出）
- 尝试使用 `127.0.0.1:3000` 代替 `localhost:3000`
- 检查防火墙设置

#### ❌ API 请求失败
- 确认后端服务运行在 http://localhost:3001
- 检查 `packages/backend/.env` 文件是否存在
- 测试后端：`curl http://localhost:3001/api/health`

## 🔧 停止服务

按 `Ctrl+C` 停止服务，或者：

```bash
pkill -f "vite"
pkill -f "tsx"
```

## 📝 下一步

1. **配置数据库：** 编辑 `packages/backend/.env` 设置数据库连接
2. **初始化数据库：** 运行 `packages/database/init.sql` 和 `seed.sql`
3. **开始使用：** 访问 http://localhost:3000 开始使用系统

## 💡 提示

- 如果修改了代码，前端会自动热重载
- 后端使用 `tsx watch`，修改代码后会自动重启
- 查看详细故障排查：`TROUBLESHOOTING.md`

