import { Bubble, Sender, useXAgent, useXChat, XRequest } from "@ant-design/x";
import { GetProp } from "antd";
import markdownit from 'markdown-it';
import { useState } from "react";
import { IOpenAIStreamResponse } from "../interface";

const md = markdownit({ html: true, breaks: true });

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  user: {
    placement: 'end',
    avatar: { style: { background: '#a677ff' } },
  },
  assistant: {
    placement: 'start',
    avatar: { style: { background: '#f7d7ff' }, children: 'AI' },
    typing: true,
    
  },
};

const { create } = XRequest({
  baseURL: import.meta.env['VITE_AI_BASE_URL'] + '/chat/completions',
  dangerouslyApiKey: import.meta.env['VITE_API_KEY'],
  model: import.meta.env['VITE_AI_MODEL'],
});

export default function Chat() {
  const [userInput, setUserInput] = useState<string>()

  const [agent] = useXAgent<{ role: string, content: string }>({
    request: async (info, callbacks) => {
      const { message, messages = [] } = info;
      const { onUpdate, onSuccess } = callbacks;

      if(!message) return;
      
      const content = {
        role: 'assistant',
        content: '',
      };
      setUserInput('')
      try {
        create(
          {
            messages: [...messages, message],
            stream: true,
          },
          {
            onSuccess: (chunks) => {
              console.log('sse chunk list', chunks);
            },
            onError: (error) => {
              console.log('error', error);
            },
            onUpdate: (chunk) => {
              if (chunk.data.includes('[DONE]')) {
                onSuccess(content)
                return;
              }
              const data = JSON.parse(chunk.data) as IOpenAIStreamResponse;
              content.content += data?.choices[0].delta.content;
              onUpdate(content);
            },
          },
        );
      } catch (error) {
        console.log(error)
      }
    },
  });

  const { messages, onRequest } = useXChat({ 
    agent, 
    defaultMessages: [
      {
        id: 'init',
        message: {
          role: 'assistant',
          content: '你好，有什么我可以帮你的吗？',
        },
        status: 'success',
      },
    ], 
  })

  const items = messages.map(({ message, id }) => ({
    key: id,
    content: <div dangerouslySetInnerHTML={{ __html: md.render(message.content) }} />,
    role: message.role,
  }));

  return <div style={{ maxWidth: 800, margin: 'auto', padding: 20 }}>
    <Bubble.List roles={roles} items={items} />
    <Sender 
      onSubmit={msg => onRequest({ role: 'user', content: msg })}
      loading={agent.isRequesting()} 
      value={userInput}
      onChange={setUserInput}
      placeholder="发送聊天内容" 
      style={{ marginTop: 20 }} />  
  </div>
}