# 增长智能体协同中心

这是集团内部使用的统一入口平台：成员使用匿名工号登录，按岗位进入各自工作台；管理员创建成员账号、分配岗位和头像。所有岗位都可以在此打开三个已发布的专业智能体。

## 已配置的三个入口

| 智能体 | 已发布地址 |
| --- | --- |
| 汽车增长策略智能体 | https://automotive-growth-api-300033-11-1470261947.sh.run.tcloudbase.com/ |
| 独立站本地化增长智能体 | https://dilizhan-marketing-results-302768-11-1474942037.sh.run.tcloudbase.com/ |
| 直播营销策划智能体 | https://live-marketing-results-302728-7-1474898132.sh.run.tcloudbase.com/ |

## 登录与岗位

- 管理员：由 `ADMIN_EMAIL` 与 `ADMIN_INITIAL_PASSWORD` 创建。管理员账号显示为 `ADMIN-001`，不是姓名。
- 四个默认匿名成员：`ops-a01`、`visual-b01`、`data-c01`、`marketing-d01`。
- 默认成员密码由 `TEAM_INITIAL_PASSWORD` 设置；请在上线前设置为至少 8 位的临时密码，并由管理员按需重置。
- 岗位头像已固定为：电商运营师、视觉设计师、数据分析师、数字营销师四张指定头像。

## GitHub + CloudBase 发布

1. 在 GitHub 新建一个**私有**仓库，例如 `growth-agent-collaboration-center`。
2. 上传本文件夹内的全部内容，不上传 `.env`，也不要上传 `node_modules`。
3. 在 CloudBase 的 SQL 编辑器执行 `schema.sql`。已有旧库也可执行，它只会补充 `avatar_key` 字段。
4. 在云托管通过该 GitHub 仓库的 `main` 分支部署，构建方式选 Dockerfile，服务端口填写 `80`。
5. 在环境变量中填写：

```text
CLOUDBASE_ENV_ID=你的环境ID
CLOUDBASE_APIKEY=服务端 API Key
DEEPSEEK_API_KEY=你的 DeepSeek Key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
ADMIN_EMAIL=admin@group.local
ADMIN_INITIAL_PASSWORD=你自己设置的管理员密码
TEAM_INITIAL_PASSWORD=四个默认账号的临时密码
JWT_SECRET=至少32位的随机字符串
```

6. 发布成功后，通过公网 URL 打开系统。管理员登录后，在“成员与权限”中新建匿名工号、选择岗位与头像。

## 安全说明

- 不要把 DeepSeek、CloudBase、LangSmith 的真实密钥上传 GitHub。
- GitHub 仓库必须设为私有。
- 本平台只承托登录、权限、成员、岗位和跳转；三个专业智能体仍各自使用已发布的公网地址。
