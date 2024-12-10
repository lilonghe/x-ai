import { ChatType, IMessage } from "./interface";

export function saveChatMessageData(key: string, messages: IMessage[]) {
  const chatList = getAllChatData()
  const i = chatList.findIndex(item => item.key === key);
  chatList[i].messages = messages;
  localStorage.setItem('chatList', JSON.stringify(chatList))
}

export function createChatData(chat: ChatType) {
  const chatList = getAllChatData()
  localStorage.setItem('chatList', JSON.stringify([chat, ...chatList]))
}

export function deleteChat(key: string) {
  const chatList = getAllChatData().filter(item => item.key !== key)
  localStorage.setItem('chatList', JSON.stringify(chatList))
}

export function getAllChatData() {
  return JSON.parse(localStorage.getItem('chatList') || '[]') as ChatType[]
}
