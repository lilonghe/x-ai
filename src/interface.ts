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