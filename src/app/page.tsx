"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { Gamepad2, Edit3, Wifi, WifiOff, Users, MessageSquare, ListTodo, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Dynamically import PhaserGame to avoid SSR issues
const PhaserGame = dynamic(() => import("@/components/game/PhaserGame"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Loading game...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [mode, setMode] = useState<"play" | "edit">("play");
  const [gatewayUrl, setGatewayUrl] = useState("ws://127.0.0.1:18789/");
  const [gatewayToken, setGatewayToken] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (isConnected) {
      setIsConnected(false);
      return;
    }
    setIsConnecting(true);
    // Simulate connection attempt
    setTimeout(() => {
      setIsConnecting(false);
      // For demo purposes, toggle connection
      setIsConnected(!isConnected);
    }, 1000);
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-950 text-white flex">
      {/* Main Game Area */}
      <div className="flex-1 relative">
        {mode === "play" ? (
          <PhaserGame />
        ) : (
          <div className="h-full flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <Edit3 className="w-16 h-16 mx-auto mb-4 text-slate-500" />
              <h2 className="text-xl font-semibold mb-2">Office Editor Mode</h2>
              <p className="text-slate-400 mb-4">Design your office layout</p>
              <p className="text-sm text-slate-500">
                The office editor from Pixel Agents is available in this merged project.
                Customize your workspace with desks, chairs, and decorations.
              </p>
            </div>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="absolute top-4 left-4 z-50">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "play" | "edit")}>
            <TabsList className="bg-slate-800/80 backdrop-blur border border-slate-700">
              <TabsTrigger value="play" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
                <Gamepad2 className="w-4 h-4 mr-2" />
                Play
              </TabsTrigger>
              <TabsTrigger value="edit" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Project Title */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <h1 className="text-xl font-bold text-yellow-500 pixel-font">Agent Town</h1>
          <p className="text-xs text-slate-400 text-center">OpenClaw AI Agent Workspace</p>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
        {/* Connection Status */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-slate-500" />
              )}
              <span className="font-medium">
                {isConnected ? "Connected" : isConnecting ? "Connecting..." : "Disconnected"}
              </span>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "bg-green-600" : ""}>
              {isConnected ? "Online" : "Offline"}
            </Badge>
          </div>

          <div className="space-y-2">
            <div>
              <Label htmlFor="gateway-url" className="text-xs text-slate-400">Gateway URL</Label>
              <Input
                id="gateway-url"
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                placeholder="ws://127.0.0.1:18789/"
                className="h-8 bg-slate-800 border-slate-700 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="gateway-token" className="text-xs text-slate-400">Token (optional)</Label>
              <Input
                id="gateway-token"
                type="password"
                value={gatewayToken}
                onChange={(e) => setGatewayToken(e.target.value)}
                placeholder="Enter token..."
                className="h-8 bg-slate-800 border-slate-700 text-sm"
              />
            </div>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className={`w-full ${isConnected ? "bg-red-600 hover:bg-red-700" : "bg-yellow-600 hover:bg-yellow-700 text-black"}`}
            >
              {isConnecting ? "Connecting..." : isConnected ? "Disconnect" : "Connect to OpenClaw"}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 p-4 border-b border-slate-800">
          <div className="bg-slate-800/50 rounded p-2 text-center">
            <Users className="w-4 h-4 mx-auto mb-1 text-blue-400" />
            <p className="text-lg font-bold">0</p>
            <p className="text-xs text-slate-400">Agents</p>
          </div>
          <div className="bg-slate-800/50 rounded p-2 text-center">
            <ListTodo className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
            <p className="text-lg font-bold">0</p>
            <p className="text-xs text-slate-400">Tasks</p>
          </div>
          <div className="bg-slate-800/50 rounded p-2 text-center">
            <MessageSquare className="w-4 h-4 mx-auto mb-1 text-green-400" />
            <p className="text-lg font-bold">0</p>
            <p className="text-xs text-slate-400">Messages</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="flex-1 p-4 overflow-auto">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Welcome to Agent Town</CardTitle>
              <CardDescription className="text-xs">
                A pixel RPG where AI agents work together
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-300 space-y-2">
              <p><strong>🎮 Play Mode:</strong> Walk around the office as the boss. Press E near workers to assign tasks.</p>
              <p><strong>✏️ Edit Mode:</strong> Design your office layout with furniture and decorations.</p>
              <p><strong>🔌 OpenClaw:</strong> Connect to an OpenClaw gateway to interact with real AI agents.</p>
              <p className="text-slate-500 pt-2 border-t border-slate-700">
                This project merges Agent Town (Phaser game) and Pixel Agents (office editor) into a unified experience.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">OpenClaw Integration</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-300 space-y-2">
              <p>OpenClaw is an AI agent runtime that powers the workers in this office.</p>
              <p><strong>Setup:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Install and run OpenClaw gateway</li>
                <li>Default: ws://127.0.0.1:18789/</li>
                <li>Click Connect to establish WebSocket</li>
                <li>Assign tasks to AI agents in-game</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            Merged Project: Agent Town + Pixel Agents
          </p>
          <p className="text-xs text-slate-600">
            Powered by OpenClaw
          </p>
        </div>
      </div>
    </main>
  );
}
