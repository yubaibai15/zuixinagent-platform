# 统一资料上传、智能体问答与 LangSmith 配置

## 上传后的实际行为

- PDF、DOCX、XLSX、CSV、TXT、MD、JSON：服务会立即提取文字，提问时会作为智能体的依据。
- 图片、音频、视频、压缩包和其他格式：会先保存到 CloudBase 文件存储；配置多媒体解析服务后，服务返回的文字、OCR 结果或转写稿会自动用于问答。
- 未配置解析服务时，界面会显示“已保存，等待解析”，不会将文件误标为已读懂。

## 腾讯云环境变量

在云托管服务的环境变量中设置以下值，真实密钥不要提交到 GitHub：

```text
MAX_UPLOAD_MB=100
MULTIMODAL_PARSER_URL=https://你的解析服务地址
MULTIMODAL_PARSER_API_KEY=你的解析服务密钥
PARSER_TIMEOUT_MS=45000
```

解析服务接收 `POST` 的 `multipart/form-data`，文件字段名为 `file`。它需要返回 JSON，以下任一字段存放可供问答检索的文字即可：

```json
{ "text": "视频转写、图片识别或文档解析后的文字" }
```

也可用 `extractedText` 或 `transcript` 字段。建议将视频和音频处理成快速转写，避免用户长时间等待。

## LangSmith 追踪

```text
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=你的 LangSmith API Key
LANGSMITH_PROJECT=nev-agent-platform
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_TRACE_CONTENT=false
```

默认 `LANGSMITH_TRACE_CONTENT=false`，只记录调用元数据、文件类型、索引状态和模型调用情况，不上传用户提问和回答正文。若你明确需要在 LangSmith 中查看正文，再设置为 `true`。

## 数据库更新

重新部署前，在 CloudBase SQL 编辑器再执行一次 `schema.sql`。该脚本会为文件表增加解析状态字段，旧数据不会丢失。
