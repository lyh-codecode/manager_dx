# 前端页面无法打开 - 故障排查指南

## 快速检查步骤

### 1. 确认服务是否启动

**检查前端服务：**
```bash
# 在项目根目录运行
cd packages/frontend
pnpm dev
```

**检查后端服务：**
```bash
# 在项目根目录运行
cd packages/backend
pnpm dev
```

**或者同时启动：**
```bash
# 在项目根目录运行
pnpm dev
```

### 2. 检查端口占用

```bash
# 检查端口3000（前端）
lsof -ti:3000

# 检查端口3001（后端）
lsof -ti:3001

# 如果端口被占用，可以杀掉进程
kill -9 $(lsof -ti:3000)
kill -9 $(lsof -ti:3001)
```

### 3. 访问地址

- **前端地址：** http://localhost:3000
- **后端API：** http://localhost:3001/api/health

### 4. 常见问题

#### 问题1：页面显示空白
- **原因：** React应用可能有运行时错误
- **解决：** 
  1. 打开浏览器开发者工具（F12）
  2. 查看 Console 标签页的错误信息
  3. 查看 Network 标签页，确认资源是否加载成功

#### 问题2：无法连接到服务器
- **原因：** 服务未启动或端口被占用
- **解决：**
  1. 确认服务已启动（应该看到类似 "Local: http://localhost:3000" 的输出）
  2. 检查防火墙设置
  3. 尝试使用 127.0.0.1:3000 代替 localhost:3000

#### 问题3：API请求失败
- **原因：** 后端服务未启动或数据库未配置
- **解决：**
  1. 确认后端服务运行在 http://localhost:3001
  2. 检查 `packages/backend/.env` 文件是否存在
  3. 测试后端健康检查：`curl http://localhost:3001/api/health`

#### 问题4：页面加载但显示错误
- **原因：** 可能是数据库连接问题或API错误
- **解决：**
  1. 打开浏览器开发者工具
  2. 查看 Console 和 Network 标签页
  3. 检查后端日志输出

### 5. 重新启动服务

如果遇到问题，尝试完全重启：

```bash
# 1. 停止所有服务
pkill -f "vite"
pkill -f "tsx"

# 2. 清理并重新安装依赖（如果需要）
cd packages/frontend && rm -rf node_modules && pnpm install
cd ../backend && rm -rf node_modules && pnpm install

# 3. 重新启动
cd ../..
pnpm dev
```

### 6. 检查浏览器控制台

打开浏览器开发者工具（F12），检查：

1. **Console 标签页：** 查看是否有 JavaScript 错误
2. **Network 标签页：** 查看资源加载情况
   - 确认 `main.tsx` 和 `App.tsx` 等文件加载成功
   - 确认 API 请求是否正常

### 7. 验证步骤

1. ✅ 前端服务启动成功（看到 Vite 启动信息）
2. ✅ 浏览器可以访问 http://localhost:3000
3. ✅ 浏览器控制台没有错误
4. ✅ 后端服务运行正常
5. ✅ API 请求可以正常响应

### 8. 如果仍然无法解决

请提供以下信息：
- 浏览器控制台的错误信息（Console 标签页）
- 网络请求的状态（Network 标签页）
- 终端中的错误日志
- 使用的浏览器和版本

