import { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/chat/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: isOpen,
    refetchInterval: 2000 // Poll for new messages
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      return apiRequest('POST', `/api/chat/${sessionId}`, {
        message: messageText,
        isFromUser: true,
        sessionId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat', sessionId] });
      setMessage("");
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  // Initialize chat with welcome message
  const initializeChat = () => {
    if (!isOpen && messages.length === 0) {
      setTimeout(() => {
        sendMessageMutation.mutate("👋 Hi! I'm here to help you find the perfect class. What are you looking for today?");
      }, 500);
    }
  };

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      initializeChat();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      <Button
        onClick={handleToggleChat}
        className="rounded-full h-14 w-14 shadow-lg"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      
      {/* Chat Window */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 shadow-xl">
          <CardHeader className="bg-primary text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-semibold">Live Support</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 hover:bg-transparent p-0 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="h-64 p-4 overflow-y-auto bg-gray-50 space-y-4">
              {messages.length === 0 && (
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-700">👋 Hi! I'm here to help you find the perfect class. What are you looking for today?</p>
                  <span className="text-xs text-gray-500">Support Agent • now</span>
                </div>
              )}
              
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${
                    msg.isFromUser 
                      ? 'ml-4 bg-primary text-white' 
                      : 'mr-4 bg-white shadow-sm'
                  } p-3 rounded-lg`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {msg.isFromUser ? 'You' : 'Support Agent'} • {
                      msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      }) : 'now'
                    }
                  </span>
                </div>
              ))}
              
              {sendMessageMutation.isPending && (
                <div className="mr-4 bg-gray-200 p-3 rounded-lg animate-pulse">
                  <p className="text-sm text-gray-600">Support is typing...</p>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 text-sm"
                  disabled={sendMessageMutation.isPending}
                />
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
