# 带中文说明的配置示例

[返回首页](../../../README.md) · [配置字段](../configuration.md) · [Compose 说明](../compose.md)

| 文件               | 可以怎样使用                                      | 注意                                                        |
| ------------------ | ------------------------------------------------- | ----------------------------------------------------------- |
| env.zh-CN.example  | 首次复制到仓库根目录 .env，再填写自己的账号       | 默认有效值与根 env.example 一致；# 注释不执行               |
| compose.zh-CN.yaml | 备份后复制到仓库根目录 compose.yaml，再按需求改值 | 有效结构/值与根 compose.yaml 一致，时区仍是 America/Toronto |
| config.zh-CN.jsonc | 逐项阅读中文注释                                  | 不能直接运行；正式使用根 config.example.json 的合法 JSON    |

**相对路径按 Compose 文件位置解析**。把 compose 示例留在 docs 目录后用 -f 直接运行，会让 .env/config/sessions 路径偏离本教程，不建议这样用。

Windows 首次使用中文 .env 示例：

```powershell
Copy-Item docs/zh-CN/examples/env.zh-CN.example .env
Copy-Item config.example.json config.json
notepad .env
```

Linux：

```bash
cp docs/zh-CN/examples/env.zh-CN.example .env
cp config.example.json config.json
chmod 600 .env
nano .env
```

这些复制步骤仅用于没有旧文件的首次配置，不能覆盖已有真实 .env。容器根 config.json 不会自动变成挂载的 config/config.json；Docker 首次默认生成自己的配置。
