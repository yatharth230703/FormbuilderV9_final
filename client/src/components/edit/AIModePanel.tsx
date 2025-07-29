import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormConfig } from "@shared/types";
import { Send, Bot, User, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import userIcon from "../user-icon.png";
import chatbotIcon from "../chatbot-icon.png";

interface AIModePanelProps {
  formConfig: FormConfig | null;
  onConfigUpdate: (config: FormConfig) => void;
}

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
  jsonData?: FormConfig | null;
};

export default function AIModePanel({ formConfig, onConfigUpdate }: AIModePanelProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "system",
      content: "Welcome to AI Edit Mode! I can help you modify your form. Describe what changes you'd like to make.",
      timestamp: new Date(),
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Edit form mutation
  const editFormMutation = useMutation({
    mutationFn: (instruction: string) => 
      apiRequest<{ config: FormConfig }>({
        url: "/api/edit-form",
        method: "POST",
        body: JSON.stringify({
          currentConfig: formConfig,
          instruction: instruction,
        }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: (data) => {
      if (data.config) {
        onConfigUpdate(data.config);
        toast({
          title: "Success",
          description: "Form updated successfully!",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update form",
        variant: "destructive",
      });
    },
  });

  // Scroll to bottom when chat history updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || !formConfig) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: userText,
      timestamp: new Date(),
    };
    setChatHistory((prev) => [...prev, userMessage]);

    // Clear input
    setPrompt("");

    // Start loading state
    setIsGenerating(true);

    // Add temporary assistant message with loading state
    const tempAssistantMsg: ChatMessage = {
      role: "assistant",
      content: "Generating...",
      timestamp: new Date(),
      isGenerating: true,
    };
    setChatHistory((prev) => [...prev, tempAssistantMsg]);

    try {
      // Call the edit API
      const result = await editFormMutation.mutateAsync(userText);

      // Remove loading message
      setChatHistory((prev) => prev.filter((msg) => !msg.isGenerating));

      // Add success message with updated JSON
      const successMsg: ChatMessage = {
        role: "assistant",
        content: "✅ Form updated successfully! Here's the updated configuration. You can continue making changes or save the form.",
        timestamp: new Date(),
        jsonData: result.config,
      };
      setChatHistory((prev) => [...prev, successMsg]);
    } catch (error) {
      // Remove loading message
      setChatHistory((prev) => prev.filter((msg) => !msg.isGenerating));
      
      // Add error message
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Something went wrong"}`,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(prompt);
    }
  };

  // Handle copy JSON
  const handleCopyJson = () => {
    if (!formConfig) return;
    navigator.clipboard
      .writeText(JSON.stringify(formConfig, null, 2))
      .then(() =>
        toast({
          title: "JSON copied",
          description: "Form configuration copied to clipboard",
        }),
      )
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        }),
      );
  };

  // Handle download JSON
  const handleDownloadJson = () => {
    if (!formConfig) return;
    const jsonString = JSON.stringify(formConfig, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "form-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "JSON downloaded",
      description: "Form configuration downloaded as JSON file",
    });
  };

  if (!formConfig) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <p>No form configuration available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Edit Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Chat Container */}
        <div
          ref={chatContainerRef}
          className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden hide-scrollbar p-4 bg-gray-50"
        >
          {chatHistory.map((message, index) => {
            // Determine icon based on role
            let iconSrc = null;
            if (message.role === "user") {
              iconSrc = userIcon;
            } else if (message.role === "assistant" || message.role === "system") {
              iconSrc = chatbotIcon;
            }

            // Add spacing between system and user messages
            const prevMsg = chatHistory[index - 1];
            const isSystemAfterUser =
              message.role === "system" && prevMsg && prevMsg.role === "user";

            return (
              <div
                key={index}
                className={`mb-4 flex items-start ${
                  isSystemAfterUser ? "mt-6" : ""
                }`}
              >
                {/* Icon */}
                {iconSrc && (
                  <img
                    src={iconSrc}
                    alt={message.role === "user" ? "User" : "Bot"}
                    className="w-8 h-8 rounded-full object-cover mr-3 mt-1 border border-gray-300 bg-white"
                  />
                )}
                <div className="flex-1">
                  {/* System message style */}
                  {message.role === "system" ? (
                    <div className="text-sm text-gray-500 inline-block">
                      {message.content}
                    </div>
                  ) : (
                    <div
                      className={`py-2 w-full max-w-full text-base text-gray-900 break-words whitespace-pre-line ${
                        message.role === "assistant" &&
                        !(
                          message.content.startsWith("✅ Form updated successfully!") ||
                          message.content.startsWith("Error:")
                        )
                          ? "bg-gray-200 rounded-2xl px-3"
                          : ""
                      }`}
                      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    >
                      {message.isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-pulse">Generating</div>
                          <div className="flex space-x-1">
                            <div
                              className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                  )}

                  {/* JSON Preview (only for assistant messages with JSON data) */}
                  {message.role === "assistant" && message.jsonData && (
                    <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg text-xs font-mono">
                      <div className="mb-2 flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-700">
                          Updated JSON
                        </span>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            title="Copy JSON"
                            onClick={handleCopyJson}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            title="Download JSON"
                            onClick={handleDownloadJson}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        <pre className="whitespace-pre-wrap break-words text-[10px] leading-tight">
                          {JSON.stringify(message.jsonData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              placeholder="Describe how you want to modify the form..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-20 flex-1 resize-none"
              disabled={isGenerating}
            />
            <Button
              className="h-10 px-3"
              onClick={() => handleSendMessage(prompt)}
              disabled={isGenerating || !prompt.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 