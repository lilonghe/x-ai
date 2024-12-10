import { ConversationsProps } from "@ant-design/x"
import { GetProp } from "antd"

export interface IOpenAIStreamResponse {
  id: string
  object: string
  created: number
  model: string
  system_fingerprint: string
  choices: {
    index: number
    delta: {
      role: string
      content: string
    }
    finish_reason: null | string
  }[]
}

export interface IOpenAIResponse {
  id: string
  object: string
  created: number
  model: string
  system_fingerprint: string
  choices: {
    index: number
    message: {
      content: string
      role: string
    }
    finish_reason: null | string
  }[]
}

export type ChatType = GetProp<ConversationsProps, 'items'>[0] & {
  messages?: IMessage[]
}

export interface IMessage {
  content: string
  // 'user' | 'assistant'
  role: string
}