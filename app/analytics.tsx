"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/lib/card";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnalyticsData } from "@/pages/api/analytics";

interface AnalyticsProps {
  isDarkMode: boolean;
}

export function Analytics({ isDarkMode }: AnalyticsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );

  const loadingText = "loading...";

  const fetchLatestAnalytics = useCallback(async () => {
    try {
      const response = await fetch("/api/analytics");
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching latest analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestAnalytics();
    const intervalId = setInterval(() => {
      fetchLatestAnalytics();
    }, 2000); // Fetch analytics every 2 seconds

    return () => clearInterval(intervalId);
  }, [fetchLatestAnalytics]);

  const totalCommentaries = useMemo(() => {
    if (isLoading) return loadingText;

    return analyticsData?.totalCommentaries ?? 0;
  }, [analyticsData, isLoading]);

  const avgLatency = useMemo(() => {
    if (isLoading) return loadingText;

    const latestLatency = analyticsData?.latestLatency;
    if (!latestLatency?.length) return "0ms";

    const totalLatency = latestLatency.reduce(
      (acc, { latency }) => acc + latency,
      0
    );
    const avgLatency = totalLatency / (latestLatency.length * 1000);

    return `${avgLatency.toFixed(2)}ms`;
  }, [analyticsData, isLoading]);

  const latestCommentaries = useMemo(() => {
    if (isLoading) return [loadingText];

    const commentaries = analyticsData?.latestCommentaries.map(
      ({ commentary }) => commentary
    );

    if (!commentaries?.length) {
      return ["No commentaries"];
    }

    return commentaries;
  }, [analyticsData, isLoading]);

  const scoreData = useMemo(() => {
    if (!analyticsData) return [];

    return analyticsData.scoresOverTime.map((entry) => ({
      time: entry.gameTime,
      warriors: entry.warriorsScore,
      cavaliers: entry.cavaliersScore,
    }));
  }, [analyticsData]);

  const scoreDataMin = useMemo(() => {
    if (!scoreData.length) return 0;

    const minWarriorsScore = Math.min(
      ...scoreData.map((entry) => entry.warriors)
    );
    const minCavaliersScore = Math.min(
      ...scoreData.map((entry) => entry.cavaliers)
    );

    return Math.min(minWarriorsScore, minCavaliersScore) - 5;
  }, [scoreData]);

  const scoreDataMax = useMemo(() => {
    if (!scoreData.length) return 0;

    const maxWarriorsScore = Math.max(
      ...scoreData.map((entry) => entry.warriors)
    );
    const maxCavaliersScore = Math.max(
      ...scoreData.map((entry) => entry.cavaliers)
    );

    return Math.max(maxWarriorsScore, maxCavaliersScore) + 5;
  }, [scoreData]);

  const currentWarriorsScore = useMemo(() => {
    if (isLoading) return loadingText;

    if (!scoreData.length) return "...";

    const latestScore = scoreData[scoreData.length - 1];

    return latestScore.warriors;
  }, [isLoading, scoreData]);

  const currentCavaliersScore = useMemo(() => {
    if (isLoading) return loadingText;

    if (!scoreData.length) return "...";

    const latestScore = scoreData[scoreData.length - 1];

    return latestScore.cavaliers;
  }, [isLoading, scoreData]);

  const probabilityData = useMemo(() => {
    if (!analyticsData) return [];

    return analyticsData.warriorsProbabilityOverTime.map((entry) => ({
      time: entry.gameTime,
      warriors: entry.warriorsWinProbability,
      cavaliers: 100 - entry.warriorsWinProbability,
    }));
  }, [analyticsData]);

  const currentWarriorsWinProbability = useMemo(() => {
    if (isLoading) return loadingText;

    if (!probabilityData.length) return "...";

    const latestProbability = probabilityData[probabilityData.length - 1];

    return `${latestProbability.warriors}%`;
  }, [isLoading, probabilityData]);

  const currentCavaliersWinProbability = useMemo(() => {
    if (isLoading) return loadingText;

    if (!probabilityData.length) return "...";

    const latestProbability = probabilityData[probabilityData.length - 1];

    return `${latestProbability.cavaliers}%`;
  }, [isLoading, probabilityData]);

  const probabilityDataMin = useMemo(() => {
    if (!probabilityData.length) return 0;

    const minWarriorsProbability = Math.min(
      ...probabilityData.map((entry) => entry.warriors)
    );
    const minCavaliersProbability = Math.min(
      ...probabilityData.map((entry) => entry.cavaliers)
    );

    return Math.min(minWarriorsProbability, minCavaliersProbability) - 5;
  }, [probabilityData]);

  const probabilityDataMax = useMemo(() => {
    if (!probabilityData.length) return 0;

    const maxWarriorsProbability = Math.max(
      ...probabilityData.map((entry) => entry.warriors)
    );
    const maxCavaliersProbability = Math.max(
      ...probabilityData.map((entry) => entry.cavaliers)
    );

    return Math.max(maxWarriorsProbability, maxCavaliersProbability) + 5;
  }, [probabilityData]);

  const cardBg = isDarkMode ? "bg-gray-700" : "bg-gray-100";
  const textColor = isDarkMode ? "text-gray-100" : "text-nba-blue";

  return (
    <CardContent className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Score board */}
        <Card className={`${cardBg} ${textColor}`}>
          <CardContent className="p-4 flex flex-col justify-center items-center h-full">
            <h3 className="text-sm font-semibold mb-2">Score Board</h3>
            <div className="font-bold text-center grid grid-cols-3 gap-4  items-center">
              <h3
                className={`text-2xl
                  ${isDarkMode ? "text-gray-100" : "text-[#FFC72C]"}`}
              >
                {currentWarriorsScore}
              </h3>
              -
              <h3
                className={` text-2xl
                  ${isDarkMode ? "text-gray-100" : "text-[#860038]"}`}
              >
                {currentCavaliersScore}
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Total Commentaries */}
        <Card className={`${cardBg} ${textColor}`}>
          <CardContent className="p-4 flex flex-col justify-center items-center h-full">
            <div className="text-2xl font-bold">{totalCommentaries}</div>
            <h3 className="text-sm font-semibold mb-1">Total Commentaries</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Latest Latencies */}
        <Card className={`${cardBg} ${textColor}`}>
          <CardContent className="p-4 flex flex-col justify-center items-center h-full">
            <div className="text-2xl font-bold">{avgLatency}</div>
            <h3 className="text-sm font-semibold mb-1">Avg Response Time</h3>
          </CardContent>
        </Card>

        {/* Latest Commentaries */}
        <Card className={`${cardBg} ${textColor}`}>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-1">Latest Commentaries</h3>
            <div className="space-y-1">
              {latestCommentaries.map((commentary, index) => (
                <p key={index} className="text-xs truncate">
                  {commentary}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scores Over Time */}
      <Card className={`${cardBg} ${textColor}`}>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-2">
            Winning Probability over time
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={probabilityData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "#ffffff20" : "#00000020"}
                />
                <XAxis
                  dataKey="time"
                  stroke={isDarkMode ? "#ffffff80" : "#00000080"}
                />
                <YAxis
                  stroke={isDarkMode ? "#ffffff80" : "#00000080"}
                  domain={[probabilityDataMin, probabilityDataMax]}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#374151" : "#FFFFFF",
                    border: `1px solid ${isDarkMode ? "#4B5563" : "#E5E7EB"}`,
                  }}
                  labelStyle={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
                />
                <Line
                  type="monotone"
                  dataKey="warriors"
                  stroke="#FFC72C"
                  name="Warriors"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="cavaliers"
                  stroke="#860038"
                  name="Cavaliers"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-center grid grid-cols-2 gap-4">
            <div>
              <div className="text-xl font-bold text-[#FFC72C]">
                {currentWarriorsWinProbability}
              </div>
              <p className="text-xs opacity-80">
                Current Warriors Win Probability
              </p>
            </div>
            <div>
              <div className="text-xl font-bold text-[#860038]">
                {currentCavaliersWinProbability}
              </div>
              <p className="text-xs opacity-80">
                Current Cavaliers Win Probability
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {/* Each Team's Win Probability */}
        <Card className={`${cardBg} ${textColor} col-span-2`}>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-2">
              Score over time (Warriors vs Cavaliers)
            </h3>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#ffffff20" : "#00000020"}
                  />
                  <XAxis
                    dataKey="time"
                    stroke={isDarkMode ? "#ffffff80" : "#00000080"}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#ffffff80" : "#00000080"}
                    domain={[scoreDataMin, scoreDataMax]}
                    unit="pts"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#374151" : "#FFFFFF",
                      border: `1px solid ${isDarkMode ? "#4B5563" : "#E5E7EB"}`,
                    }}
                    labelStyle={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
                  />
                  <Bar dataKey="warriors" fill="#FFC72C" name="Warriors" />
                  <Bar dataKey="cavaliers" fill="#860038" name="Cavaliers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </CardContent>
  );
}
