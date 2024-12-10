import { Spin } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import './app.css'
import Chat from './chat'
import Conversation from './conversation'
import { createChatData, deleteChat, getAllChatData, saveChatMessageData } from './db'
import { ChatType, IMessage } from './interface'

function App() {
  const [chatList, setChatList] = useState<ChatType[]>([])
  const [activeKey, setActiveKey] = useState<string>('')

  const loadChatList = () => {
    const data = getAllChatData()
    if (data.length === 0) {
      data.push({
        key: 'default',
        label: '默认会话',
        timestamp: Date.now(),
        messages: [
          {
            content: '你好，需要什么帮助吗？',
            role: 'assistant'
          }
        ]
      })
      createChatData(data[0])
    }
    setChatList(data);
    setActiveKey(data[0].key)
  }

  useEffect(() => {
    loadChatList()
  }, [])

  const defaultMessages = useMemo(() => {
    return chatList.find(item => item.key === activeKey)?.messages || []
  }, [activeKey, chatList])

  if (!chatList.length) {
    return <Spin spinning={true}><div className='h-screen'></div></Spin>
  }

  const handleCreateNew = () => {
    const newChat: ChatType = {
      key: Date.now().toString(),
      label: '会话-' + (Math.random() * 100000).toFixed(),
      timestamp: Date.now(),
      messages: [
        {
          content: '你好，需要什么帮助吗？',
          role: 'assistant'
        }
      ]
    }
    createChatData(newChat)
    setChatList(getAllChatData())
    setActiveKey(newChat.key)
  }

  const handleDelete = (key: string) => {
    deleteChat(key)
    setChatList(getAllChatData())
    if (key === activeKey) {
      setActiveKey(chatList.filter(item => item.key !== key)[0].key)
    }
  }

  const handleChangeActive = (key: string) => {
    setChatList(getAllChatData())
    setActiveKey(key)
  }

  const handleChatDone = (messages: IMessage[]) => {
    saveChatMessageData(activeKey, messages)
    setChatList(getAllChatData())
  }

  return (
    <div className='flex container mx-auto py-5'>
      <Conversation 
        chats={chatList} 
        activeKey={activeKey} 
        onChange={handleChangeActive}
        onCreateNew={handleCreateNew}
        onDelete={handleDelete} />
      <Chat 
        key={activeKey} 
        defaultMessages={defaultMessages} 
        onChatDone={handleChatDone} />
    </div>
  )
}

export default App
