# Trending Topics API

这是一个用于获取微博、小红书和抖音热搜的 API 服务。

## 功能特点

- 支持获取微博热搜
- 支持获取小红书热搜
- 支持获取抖音热搜
- RESTful API 设计
- TypeScript 实现

## 安装

```bash
# 克隆项目
git clone [repository-url]

# 安装依赖
npm install
```

## 使用方法

### 开发环境运行

```bash
npm run dev
```

### 生产环境运行

```bash
# 构建项目
npm run build

# 运行服务
npm start
```

## API 接口

### 获取所有平台热搜

```
GET /api/trending
```

### 获取指定平台热搜

```
GET /api/trending/:platform
```

支持的平台：
- weibo
- douyin

## 返回数据格式

```json
{
  "success": true,
  "data": {
    "platform": "weibo",
    "items": [
      {
        "title": "热搜标题",
        "url": "热搜链接",
        "hot": "热度值",
        "platform": "weibo"
      }
    ],
    "timestamp": 1234567890
  }
}
```

## 注意事项

- 该服务需要网络连接以获取各平台的热搜数据
- 建议在生产环境中添加适当的缓存机制
- 使用适当的请求频率以避免被目标平台限制 