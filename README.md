# Use Ant Design X + Ollama

## Config
在 `.env` 中配置大模型相关信息，兼容 openai api 的接口都可以直接使用


## Data
数据目前保存在 localStorage `chatList` 中，可以按需改成访问 db  
`messages` 其实应该抽离保存，但是为了便于数据管理，就放在 chatList 中了。