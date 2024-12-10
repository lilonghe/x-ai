import { DeleteOutlined } from "@ant-design/icons";
import { Conversations, ConversationsProps } from "@ant-design/x";
import { Button } from "antd";
import { ChatType } from "../interface";

interface Props {
  chats: ChatType[]
  activeKey: string
  onChange: (key: string) => void
  onCreateNew: () => void
  onDelete: (key: string) => void
}

export default function Conversation({ chats, activeKey, onChange, onCreateNew, onDelete }: Props) {
  const menuConfig: ConversationsProps['menu'] = () => ({
    items: [
      {
        label: '删除',
        key: 'delete',
        icon: <DeleteOutlined />,
        danger: true,
      },
    ],
    onClick: () => {
      onDelete(activeKey)
    },
  });

  return <div className="w-[300px] px-2 h-[calc(100vh-45px)] overflow-y-scroll">
    <Conversations
      onActiveChange={onChange}
      items={chats}
      activeKey={activeKey}
      className="!p-0"
      menu={chats.length > 1 ? menuConfig : undefined} />
    <Button block type="dashed" className="mt-2" onClick={onCreateNew}>开始新对话</Button>
  </div>
}