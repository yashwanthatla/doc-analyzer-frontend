'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { ArrowUp, FileUp, Plus, Trash2, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

type Message = {
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
}

type Conversation = {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messages: Message[]
}

export default function ChatComponent() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentChat, setCurrentChat] = useState<Message[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [currentChat])

  const generateChatId = () => {
    return Math.random().toString(36).substr(2, 9)
  }

  const getChatTitle = (messages: Message[]): string => {
    if (messages.length === 0) return 'New Chat'
    const firstUserMessage = messages.find(m => m.type === 'user')
    if (!firstUserMessage) return 'New Chat'
    return firstUserMessage.content.length > 30 
      ? firstUserMessage.content.substring(0, 30) + '...'
      : firstUserMessage.content
  }

  const saveCurrentChat = () => {
    if (currentChat.length > 0 && currentChatId) {
      const chatTitle = getChatTitle(currentChat)
      const lastMessage = currentChat[currentChat.length - 1].content
      
      const updatedConversation: Conversation = {
        id: currentChatId,
        title: chatTitle,
        lastMessage: lastMessage.length > 50 ? lastMessage.substring(0, 50) + '...' : lastMessage,
        timestamp: new Date(),
        messages: currentChat
      }

      setConversations(prev => {
        const existingIndex = prev.findIndex(conv => conv.id === currentChatId)
        if (existingIndex !== -1) {
          const newConversations = [...prev]
          newConversations[existingIndex] = updatedConversation
          return newConversations
        }
        return [...prev, updatedConversation]
      })
    }
  }

  const handleNewChat = () => {
    if (currentChat.length > 0) {
      saveCurrentChat()
    }
    
    const newChatId = generateChatId()
    fetch('http://localhost:8000/newChat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ chatId: newChatId })
    }).catch(error => {
      console.error('Error notifying backend about new chat:', error)
      // Continue with local flow even if backend notification fails
    })
    setCurrentChatId(newChatId)
    setCurrentChat([{
      type: 'system',
      content: 'Please upload a document to start the conversation.',
      timestamp: new Date()
    }])
    setInputMessage('')
  }

  const loadConversation = (convId: string) => {
    if (currentChat.length > 0) {
      saveCurrentChat()
    }
    
    const conversationIndex = conversations.findIndex(conv => conv.id === convId)
    fetch('http://localhost:8000/loadChat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ index: conversationIndex })
    }).catch(error => {
      console.error('Error notifying backend about loaded chat:', error)
      // Continue with local flow even if backend notification fails
    })

    const conversation = conversations.find(conv => conv.id === convId)
    if (conversation) {
      setCurrentChatId(convId)
      setCurrentChat(conversation.messages)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const newMessage: Message = { 
      type: 'user', 
      content: inputMessage, 
      timestamp: new Date() 
    }
    setCurrentChat(prev => [...prev, newMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: inputMessage })
      })

      const data = await response.json()
      
      if (response.ok) {
        const aiMessage: Message = {
          type: 'ai',
          content: data.answer,
          timestamp: new Date()
        }
        setCurrentChat(prev => [...prev, aiMessage])
      } else {
        throw new Error(data.message || 'Failed to get response')
      }
    } catch (error) {
      console.error('Error:', error)
      setCurrentChat(prev => [...prev, {
        type: 'system',
        content: 'Sorry, there was an error processing your request.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (response.ok) {
        setCurrentChat(prev => [...prev, {
          type: 'system',
          content: `Successfully uploaded ${file.name}. You can now ask questions about the document.`,
          timestamp: new Date()
        }])
      } else {
        throw new Error(data.message || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Error:', error)
      setCurrentChat(prev => [...prev, {
        type: 'system',
        content: 'Sorry, there was an error uploading your file.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFlush = async () => {
    try {
      const response = await fetch('http://localhost:8000/flush', {
        method: 'POST'
      })

      if (response.ok) {
        setCurrentChat([{
          type: 'system',
          content: 'Please upload a document to start the conversation.',
          timestamp: new Date()
        }])
      } else {
        throw new Error('Failed to flush data')
      }
    } catch (error) {
      console.error('Error:', error)
      setCurrentChat(prev => [...prev, {
        type: 'system',
        content: 'Sorry, there was an error flushing the data.',
        timestamp: new Date()
      }])
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.md'))) {
      handleFileUpload(file)
    } else {
      setCurrentChat(prev => [...prev, {
        type: 'system',
        content: 'Please upload only PDF or Markdown files.',
        timestamp: new Date()
      }])
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div className="w-72 flex flex-col border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-blue-400">Document Analyzer</h1>
          <Button className="w-full mt-4" onClick={handleNewChat}>
            <Plus className="mr-2 h-4 w-4" /> New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          {conversations.map((conv) => (
            <div 
              key={conv.id} 
              className={cn(
                "p-3 hover:bg-gray-800 cursor-pointer",
                currentChatId === conv.id && "bg-gray-800"
              )}
              onClick={() => loadConversation(conv.id)}
            >
              <div className="flex items-center">
                <span className="font-medium">{conv.title}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1 truncate">{conv.lastMessage}</p>
              <p className="text-xs text-gray-500 mt-1">{conv.timestamp.toLocaleString()}</p>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold">Document Analysis Chat</h2>
          <Button variant="ghost" size="icon" onClick={handleFlush}>
            <Trash2 className="h-5 w-5" />
          </Button>
        </header>
        <ScrollArea className="flex-1 p-4" ref={chatContainerRef}>
          {currentChat.map((message, index) => (
            <div
              key={index}
              className={cn(
                "mb-4 max-w-[80%] rounded-lg p-4",
                message.type === 'user' 
                  ? "ml-auto bg-blue-600" 
                  : message.type === 'system'
                  ? "mx-auto bg-gray-700 max-w-[60%] text-center"
                  : "bg-gray-800"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold">
                  {message.type === 'user' ? 'You' : message.type === 'system' ? 'System' : 'Assistant'}
                </span>
                <span className="text-xs text-gray-400">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </ScrollArea>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-end space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question about your document..."
              className="flex-1 bg-gray-800 border-gray-700 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.md"
              onChange={handleFileSelect}
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-5 w-5" />
            </Button>
            <Button onClick={handleSendMessage}>
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            <span>Upload PDF or Markdown files only</span>
          </div>
        </div>
      </div>
    </div>
  )
}