#!/bin/bash

echo "🚀 启动工业设备台账管理系统..."
echo ""

# 检查端口占用
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  端口 3000 已被占用，正在停止..."
    kill -9 $(lsof -ti:3000) 2>/dev/null
    sleep 1
fi

if lsof -ti:3001 > /dev/null 2>&1; then
    echo "⚠️  端口 3001 已被占用，正在停止..."
    kill -9 $(lsof -ti:3001) 2>/dev/null
    sleep 1
fi

echo "✅ 启动服务..."
echo "📱 前端地址: http://localhost:3000"
echo "🔧 后端地址: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

# 启动服务
pnpm dev

