import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, Bot, User, Settings } from 'lucide-react';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
  content: 'Hello! I\'m your AI assistant. How can I help you?'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [systemRole, setSystemRole] = useState('You’re a professional, efficient university course AI assistant: supporting teachers with lesson prep, teaching optimization and multi-level questions, and helping students with preview, knowledge sorting and exam review in concise language.');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // send message
  const sendMessage = async () => {
    const message = userInput.trim();
    if (!message || isLoading) return;

  // add user message
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: message
    };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
  // call backend AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system: systemRole,
          user: message
        })
      });

      const data = await response.json();

  // add AI reply
      const newAIMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.ok ? data.data.response : `错误：${data.message}`
      };
      setMessages(prev => [...prev, newAIMessage]);
    } catch (error) {
  // add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `网络错误：${error.message}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // handle Enter to send
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // clear conversation
  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'ai',
  content: 'Hello! I\'m your AI assistant. How can I help you?'
      }
    ]);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="h-[700px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant
          </CardTitle>
          
          {/* system role settings */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              AI Role Settings
            </label>
            <Textarea
              placeholder="Set the AI role and behavior..."
              value={systemRole}
              onChange={(e) => setSystemRole(e.target.value)}
              className="min-h-[60px]"
            />
          </div>
          <Separator />
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* message list */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* 加载指示器 */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <p className="text-sm text-gray-600">AI is thinking...</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* input area */}
          <div className="mt-4 space-y-3">
            <Separator />
            <div className="flex gap-2">
              <Input
                placeholder="Type your question..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage} 
                disabled={isLoading || !userInput.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button 
                onClick={clearChat} 
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChat;