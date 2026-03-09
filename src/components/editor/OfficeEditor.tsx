"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Undo2, Redo2, Save, Download, Upload, Plus, Minus, Move, MousePointer, Eraser } from "lucide-react";
import {
  renderFrame,
  type EditorRenderState,
} from "./renderer";
import type { TileType, FurnitureInstance, FloorColor } from "./types";
import { TILE_SIZE, TileType as TileTypeEnum } from "./types";
import { FURNITURE_CATALOG, type FurnitureDef } from "./furnitureCatalog";

// Default office layout
const DEFAULT_COLS = 20;
const DEFAULT_ROWS = 15;

function createEmptyTileMap(cols: number, rows: number): TileType[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => TileTypeEnum.FLOOR)
  );
}

interface OfficeLayout {
  cols: number;
  rows: number;
  tileMap: TileType[][];
  tileColors: Array<FloorColor | null>;
  furniture: FurnitureInstance[];
}

function createDefaultLayout(): OfficeLayout {
  return {
    cols: DEFAULT_COLS,
    rows: DEFAULT_ROWS,
    tileMap: createEmptyTileMap(DEFAULT_COLS, DEFAULT_ROWS),
    tileColors: Array(DEFAULT_COLS * DEFAULT_ROWS).fill(null),
    furniture: [],
  };
}

type EditTool = "select" | "paint" | "erase" | "move" | "furniture";

export default function OfficeEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Layout state
  const [layout, setLayout] = useState<OfficeLayout>(() => createDefaultLayout());
  const [history, setHistory] = useState<OfficeLayout[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Editor state
  const [activeTool, setActiveTool] = useState<EditTool>("furniture");
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [ghostPosition, setGhostPosition] = useState<{ col: number; row: number } | null>(null);
  
  // Save to history
  const saveToHistory = useCallback((newLayout: OfficeLayout) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newLayout)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setLayout(newLayout);
  }, [history, historyIndex]);
  
  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLayout(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  }, [history, historyIndex]);
  
  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLayout(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  }, [history, historyIndex]);
  
  // Zoom handlers
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.5, Math.min(2, z + delta)));
  }, []);
  
  // Get tile from screen position
  const screenToTile = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const mapW = layout.cols * TILE_SIZE * zoom;
    const mapH = layout.rows * TILE_SIZE * zoom;
    const offsetX = (canvas.width - mapW) / 2 + pan.x;
    const offsetY = (canvas.height - mapH) / 2 + pan.y;
    
    const col = Math.floor((x - offsetX) / (TILE_SIZE * zoom));
    const row = Math.floor((y - offsetY) / (TILE_SIZE * zoom));
    
    if (col < 0 || col >= layout.cols || row < 0 || row >= layout.rows) {
      return null;
    }
    
    return { col, row };
  }, [layout.cols, layout.rows, zoom, pan]);
  
  // Place furniture
  const placeFurniture = useCallback((col: number, row: number, def: FurnitureDef) => {
    const newFurniture: FurnitureInstance = {
      uid: `furniture_${Date.now()}`,
      type: def.type,
      sprite: def.sprite,
      x: col * TILE_SIZE,
      y: row * TILE_SIZE,
      zY: row * TILE_SIZE + def.offsetY,
      width: def.width,
      height: def.height,
      rotation: 0,
    };
    
    const newLayout = {
      ...layout,
      furniture: [...layout.furniture, newFurniture],
    };
    
    saveToHistory(newLayout);
  }, [layout, saveToHistory]);
  
  // Paint tile
  const paintTile = useCallback((col: number, row: number, tileType: TileType) => {
    const newTileMap = layout.tileMap.map((row_, r) =>
      row_.map((cell, c) => (r === row && c === col ? tileType : cell))
    );
    
    const newLayout = { ...layout, tileMap: newTileMap };
    saveToHistory(newLayout);
  }, [layout, saveToHistory]);
  
  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const tile = screenToTile(e.clientX, e.clientY);
    
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Middle click or shift+click for pan
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }
    
    if (!tile) return;
    
    if (activeTool === "furniture" && selectedFurniture) {
      const def = FURNITURE_CATALOG.find(f => f.type === selectedFurniture);
      if (def) {
        placeFurniture(tile.col, tile.row, def);
      }
    } else if (activeTool === "paint") {
      paintTile(tile.col, tile.row, TileTypeEnum.FLOOR);
    } else if (activeTool === "erase") {
      paintTile(tile.col, tile.row, TileTypeEnum.VOID);
    }
  }, [screenToTile, activeTool, selectedFurniture, placeFurniture, paintTile, pan]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      return;
    }
    
    const tile = screenToTile(e.clientX, e.clientY);
    setGhostPosition(tile);
  }, [isDragging, dragStart, screenToTile]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Resize canvas
    const container = containerRef.current;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
    
    // Build editor state for rendering
    const editorState: EditorRenderState = {
      showGrid: true,
      ghostSprite: null,
      ghostCol: ghostPosition?.col ?? -1,
      ghostRow: ghostPosition?.row ?? -1,
      ghostValid: true,
      hasSelection: false,
      selectedCol: 0,
      selectedRow: 0,
      selectedW: 1,
      selectedH: 1,
      showGhostBorder: true,
      ghostBorderHoverCol: -1,
      ghostBorderHoverRow: -1,
    };
    
    // Render
    renderFrame(
      ctx,
      canvas.width,
      canvas.height,
      layout.tileMap,
      layout.furniture,
      zoom,
      pan.x,
      pan.y,
      editorState,
      layout.tileColors,
      layout.cols,
      layout.rows
    );
    
    // Draw ghost furniture
    if (ghostPosition && activeTool === "furniture" && selectedFurniture) {
      const def = FURNITURE_CATALOG.find(f => f.type === selectedFurniture);
      if (def) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#6366f1";
        ctx.fillRect(
          ghostPosition.col * TILE_SIZE * zoom + pan.x,
          ghostPosition.row * TILE_SIZE * zoom + pan.y,
          def.width * TILE_SIZE * zoom,
          def.height * TILE_SIZE * zoom
        );
        ctx.restore();
      }
    }
  }, [layout, zoom, pan, ghostPosition, activeTool, selectedFurniture]);
  
  // Setup wheel listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);
  
  // Save layout
  const handleSave = useCallback(() => {
    localStorage.setItem("office-layout", JSON.stringify(layout));
  }, [layout]);
  
  // Export layout
  const handleExport = useCallback(() => {
    const data = JSON.stringify(layout, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "office-layout.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [layout]);
  
  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-900">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-1 p-2 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-lg">
          {/* Tools */}
          <div className="flex gap-1 mr-2">
            {[
              { tool: "select" as EditTool, icon: MousePointer, label: "Select" },
              { tool: "paint" as EditTool, icon: Plus, label: "Paint" },
              { tool: "erase" as EditTool, icon: Eraser, label: "Erase" },
              { tool: "move" as EditTool, icon: Move, label: "Move" },
              { tool: "furniture" as EditTool, icon: Plus, label: "Furniture" },
            ].map(({ tool, icon: Icon, label }) => (
              <button
                key={tool}
                onClick={() => setActiveTool(tool)}
                className={`p-2 rounded transition-colors ${
                  activeTool === tool
                    ? "bg-purple-500 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
                title={label}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
          
          <div className="w-px h-6 bg-slate-600 mx-1" />
          
          {/* History */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
            title="Undo"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
            title="Redo"
          >
            <Redo2 size={16} />
          </button>
          
          <div className="w-px h-6 bg-slate-600 mx-1" />
          
          {/* Save/Export */}
          <button
            onClick={handleSave}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Save"
          >
            <Save size={16} />
          </button>
          <button
            onClick={handleExport}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Export"
          >
            <Download size={16} />
          </button>
          
          <div className="w-px h-6 bg-slate-600 mx-1" />
          
          {/* Zoom */}
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Zoom out"
          >
            <Minus size={16} />
          </button>
          <span className="px-2 text-xs text-slate-300 min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(2, z + 0.25))}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Zoom in"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      {/* Furniture Palette (when furniture tool active) */}
      {activeTool === "furniture" && (
        <div className="absolute left-4 top-20 z-40 p-2 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-lg max-h-96 overflow-y-auto">
          <div className="text-xs text-slate-400 mb-2 font-medium">Furniture</div>
          <div className="grid grid-cols-3 gap-1">
            {FURNITURE_CATALOG.slice(0, 12).map((item) => (
              <button
                key={item.type}
                onClick={() => setSelectedFurniture(item.type)}
                className={`p-2 rounded transition-colors text-xs ${
                  selectedFurniture === item.type
                    ? "bg-purple-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
                title={item.name}
              >
                {item.name.slice(0, 6)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
