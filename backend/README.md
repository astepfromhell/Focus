# Backend (Focus) - 快速开始

位置: `backend`

- *251215更新：目前项目已部署在南京大学软件学院的云主机上，可通过校内网直接于 `http://172.29.5.31:30080/` 访问，无需本地启动后端服务。*
- 如果需要本地启动后端服务进行开发或测试，请参考以下说明。本地运行时后端服务监听在 `http://localhost:3000/` 。

快速步骤:

1. 进入 `backend` 目录
2. 安装依赖: `npm install`
3. 初始化数据库: 使用 `backend/database/init.sql` 在 MySQL 中创建数据库与表在 PowerShell 或 CMD 中运行（会提示输入密码，地址改成对应地址）：

   ```
   mysql -u root -p -e "SOURCE /path/to/init.sql"
   ```
4. 本地开发:进入backend目录，运行 `npm run dev`
5. 单元测试: 终端进入backend目录，`npm run test`；如果需要覆盖率报告，运行`npm run test:coverage`，报告会生成在`backend/coverage`目录下。

API 基本路由:

- `POST /api/auth/register` 注册
- `POST /api/auth/login` 登录
- `GET /api/users/me` 获取当前用户（需要 Authorization: Bearer `<token>`）

测试认证模块验证邮箱/重置密码时，使用的token是register/forget-password返回的形如

```
"devVerificationToken": "91fc7f99f45f3757e9beee7f2d13cf1f6d98e74bbc11013f8213094d324a9c67"
```

的一次性token
