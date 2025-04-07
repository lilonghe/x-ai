import LogtoClient from '@logto/browser'
import { Button, Spin } from 'antd'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { useEffect, useMemo, useState } from 'react'
import './app.css'
import Chat from './chat'
import Conversation from './conversation'
import { createChatData, deleteChat, getAllChatData, saveChatMessageData } from './db'
import { ChatType, IMessage } from './interface'

const logtoClient = new LogtoClient({
  endpoint: 'http://localhost:3001/',
  appId: 'rfb5daimf4vpg3ntvwt8y',
  scopes: ['read:resource'],
  resources: ['http://localhost:8080']
});

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

  const signIn = async () => {
    await logtoClient.handleSignInCallback(window.location.href)
    window.location.href = '/';
    getInfo();
  }
  const getInfo = async () => {
    
    const userInfo = await logtoClient.getIdTokenClaims();
    const token = await logtoClient.getAccessToken('http://localhost:8080')

    const jwks = createRemoteJWKSet(new URL('http://localhost:3001/oidc/jwks'));
    const { payload } = await jwtVerify(token, jwks)
  
    console.log(userInfo, token, payload)
  }

  const logout = () => {
    logtoClient.signOut()
  }

  useEffect(() => {
    loadChatList()

    if (window.location.pathname === '/callback') {
      signIn()
    } else {
      logtoClient.isAuthenticated().then(isAuth => {
        if (isAuth) {
          getInfo()
        } else {
          logtoClient.signIn('http://localhost:5173/callback');
        }
      })
    }

    

    
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
      <Button onClick={logout}>Logout</Button>
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
