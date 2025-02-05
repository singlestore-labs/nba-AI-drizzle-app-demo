"use client";

import { Analytics } from "@/app/analytics";
import Chat from "@/app/chat";
import { Button } from "@/components/lib/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/lib/card";
import Video from "@/components/refs/video";
import { CommentaryRequestBody } from "@/pages/api/commentaries";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { ElementRef, useCallback, useEffect, useRef, useState } from "react";

export type Commentary = {
  timestamp: string;
  text: string;
  type: "ai" | "user";
};

const COMMENTARY_GENERATION_INTERVAL = 20000;

export default function NBAAnalysis() {
  const videoRef = useRef<ElementRef<typeof Video>>(null);
  const commentaryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const [commentaries, setCommentaries] = useState<Commentary[]>([
    {
      timestamp: new Date().toISOString(),
      text: "Welcome to the NBA OnTheFly commentaries!",
      type: "ai",
    },
    {
      timestamp: new Date().toISOString(),
      text: "The AI is now watching the game and generating commentaries.",
      type: "ai",
    },
    {
      timestamp: new Date().toISOString(),
      text: "Feel free to join the conversation!",
      type: "user",
    },
  ]);

  // Function to start commentaries fetching interval
  const startCommentaryInterval = useCallback(() => {
    console.log("Starting commentaries interval");
    if (!commentaryIntervalRef.current) {
      commentaryIntervalRef.current = setInterval(() => {
        fetchCommentary(videoRef);
      }, COMMENTARY_GENERATION_INTERVAL);
    }
  }, [videoRef]);

  // Function to stop commentaries fetching interval
  const stopCommentaryInterval = useCallback(() => {
    if (commentaryIntervalRef.current) {
      clearInterval(commentaryIntervalRef.current);
      commentaryIntervalRef.current = null;
    }
  }, [videoRef]);

  const handlePlay = () => {
    console.log("Video is playing, starting commentaries interval");
    fetchCommentary(videoRef);
    startCommentaryInterval();
  };

  const handlePause = () => {
    stopCommentaryInterval();
  };

  const fetchCommentary = async (
    videoRef: React.RefObject<HTMLVideoElement>
  ) => {
    if (!videoRef.current) {
      console.error("Video element not found");
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef?.current?.videoWidth || 0;
      canvas.height = videoRef?.current?.videoHeight || 0;

      console.log(
        "Generating commentary from video frame:",
        canvas.width,
        "x",
        canvas.height
      );

      const context = canvas?.getContext("2d");
      if (context && videoRef?.current) {
        context.drawImage(videoRef?.current, 0, 0, canvas.width, canvas.height);
      }

      const imageData = canvas.toDataURL("image/jpeg");

      const body: CommentaryRequestBody = {
        imageData,
        width: canvas.width,
        height: canvas.height,
      };

      const response = await fetch("/api/commentaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.text) {
        setCommentaries((prev) => [
          ...prev,
          {
            timestamp: data.timestamp || new Date().toISOString(),
            text: data.text,
            type: "ai",
          },
        ]);
      } else {
        console.error("No commentaries text received from API.");
      }
    } catch (error) {
      console.error("Error generating commentaries:", error);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-nba-white text-nba-blue"
      } transition-colors duration-200`}
    >
      {/* Header */}
      <header
        className={`${
          isDarkMode ? "bg-gray-800" : "bg-nba-white"
        } shadow-md fixed top-0 w-full z-50`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-nba-blue to-nba-red dark:from-nba-red dark:to-nba-white bg-clip-text text-transparent"
          >
            NBA OnTheFly
          </Link>
          <nav className="flex gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className={`${
                isDarkMode
                  ? "bg-gray-700 text-gray-100"
                  : "bg-nba-blue text-nba-white"
              }`}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="mb-8">
          <div className="grid lg:grid-cols-[1fr_400px] gap-6 lg:h-[600px]">
            {/* Video and Chat Section */}
            <div className="space-y-6">
              <Card
                className={`overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-xl h-full
                   ${isDarkMode ? "bg-gray-800" : "bg-nba-white"}`}
              >
                <div className="relative bg-gray-200 lg:h-[600px]">
                  <Video
                    src="/sample-video.mp4"
                    ref={videoRef}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    className="object-fill"
                  />
                </div>
              </Card>
            </div>

            <div className="space-y-4 lg:h-[600px]">
              <Chat
                isDarkMode={isDarkMode}
                commentaries={commentaries}
                setCommentaries={setCommentaries}
              />
            </div>
          </div>
          {/* Analytics Section */}
          <Card
            className={`mt-4 shadow-lg transition-shadow duration-300 hover:shadow-xl ${
              isDarkMode
                ? "bg-gray-800 text-gray-100"
                : "bg-nba-white text-nba-blue"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Game Analytics
              </CardTitle>
            </CardHeader>
            <Analytics isDarkMode={isDarkMode} />
          </Card>
        </div>
      </main>
    </div>
  );
}
