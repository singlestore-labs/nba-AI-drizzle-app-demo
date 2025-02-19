"use client";

import { Commentary } from "@/app/page";
import { Button } from "@/components/lib/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/lib/card";
import { Input } from "@/components/lib/input";
import { ScrollArea } from "@/components/lib/scroll-area";
import { useCallback, useRef, useState } from "react";

type ChatProps = {
  isDarkMode: boolean;
  commentaries: Commentary[];
  setCommentaries: React.Dispatch<React.SetStateAction<Commentary[]>>;
};

const Chat: React.FC<ChatProps> = ({
  isDarkMode,
  commentaries,
  setCommentaries,
}) => {
  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  const [userMessage, setUserMessage] = useState("");

  // Function that handles sending a userMessage to the chat
  const onSendMessage = useCallback((userMessage: string) => {
    setCommentaries((prev) => [
      {
        timestamp: new Date().toISOString(),
        text: userMessage,
        type: "user",
      },
      ...prev,
    ]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userMessage.trim()) {
      if (onSendMessage) {
        onSendMessage(userMessage);
      }
      setUserMessage("");
    }
  };

  return (
    <Card
      className={`shadow-lg transition-shadow duration-300 hover:shadow-xl h-full ${
        isDarkMode ? "bg-gray-800 text-gray-100" : "bg-nba-white text-nba-blue"
      }`}
    >
      <CardHeader>
        <CardTitle className="text-xl font-bold">Live Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <ScrollArea ref={chatBoxRef} className="h-[400px] pe-4">
            <div className="space-y-4">
              {commentaries.map((commentary, i) => (
                <div
                  key={i}
                  className="flex gap-2 animate-in slide-in-from-bottom-3"
                >
                  <div
                    className={`w-8 h-8 rounded-full ${
                      commentary.type === "ai"
                        ? "bg-nba-blue text-nba-white"
                        : "bg-nba-red text-nba-white"
                    } flex items-center justify-center`}
                  >
                    {commentary.type === "ai" ? "AI" : "U"}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`${
                        commentary.type === "ai"
                          ? isDarkMode
                            ? "bg-gray-700 text-gray-100"
                            : "bg-nba-blue/20 text-nba-blue"
                          : isDarkMode
                          ? "bg-gray-700 text-gray-100"
                          : "bg-nba-red/10 text-nba-red/80"
                      } rounded-lg p-3 shadow-md`}
                    >
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {new Date(commentary.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-sm">{commentary.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter className="w-full flex justify-between">
        <form onSubmit={handleSubmit} className="w-full">
          <div
            className={`pt-4 border-t bottom-0
            ${isDarkMode ? "border-gray-700" : "border-nba-blue/20"}`}
          >
            <div className="flex gap-2">
              <Input
                value={userMessage}
                placeholder="Type your userMessage..."
                className={`flex-auto
                  ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-nba-blue/20 border-nba-blue/40"
                  }`}
                onChange={(e) => setUserMessage(e.target.value)}
              />
              <Button
                className={`${
                  isDarkMode
                    ? "bg-nba-red hover:bg-nba-red/80"
                    : "bg-nba-blue hover:bg-nba-blue/80"
                } text-nba-white`}
                type="submit"
              >
                Send
              </Button>
            </div>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
};

export default Chat;
