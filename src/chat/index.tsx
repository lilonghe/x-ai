import { Bubble, Sender, useXAgent, useXChat, XRequest } from "@ant-design/x";
import { GetProp } from "antd";
import markdownit from 'markdown-it';
import { useState } from "react";
import { IMessage, IOpenAIStreamResponse } from "../interface";

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

export default function Chat({ defaultMessages, onChatDone }: { defaultMessages: IMessage[], onChatDone: (messages: IMessage[]) => void }) {
  const [userInput, setUserInput] = useState<string>()

  const [agent] = useXAgent<IMessage>({
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
                onChatDone([...messages, content])
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
    defaultMessages: defaultMessages.map(item => ({ message: item })),
  })

  const items = messages.map(({ message, id }) => ({
    key: id,
    content: <div dangerouslySetInnerHTML={{ __html: md.render(message.content) }} />,
    role: message.role,
  }));

  return <div className="flex-1">
    <Bubble.List roles={roles} items={items} className="h-[calc(100vh-120px)]" />
    <Sender 
      onSubmit={msg => onRequest({ role: 'user', content: msg })}
      loading={agent.isRequesting()} 
      value={userInput}
      onChange={setUserInput}
      placeholder="发送聊天内容" 
      style={{ marginTop: 20 }} />  
  </div>
}