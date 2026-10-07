import React, { useState, useRef, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Plus,
  Move,
  GripVertical,
  Utensils,
  Receipt,
  Trash2,
  Maximize2,
  Square,
  Circle,
  RectangleHorizontal,
  Magnet,
  RotateCcw,
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import { TableItem, Order } from '../../types';

interface TableGridProps {
  tables: TableItem[];
  activeOrders: Record<string, Order>;
  onSelectTable: (table: TableItem) => void;
  onAddTable: () => void;
  onReorderTables: (newTables: TableItem[]) => void;
  onDeleteTable: (tableId: string) => void;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

export const TableGrid: React.FC<TableGridProps> = ({
  tables,
  activeOrders,
  onSelectTable,
  onAddTable,
  onReorderTables,
  onDeleteTable,
  isLocked: propIsLocked,
  onToggleLock,
}) => {
  const [internalIsLocked, setInternalIsLocked] = useState<boolean>(true);
  const isLocked = propIsLocked !== undefined ? propIsLocked : internalIsLocked;

  const handleToggleLock = () => {
    if (onToggleLock) {
      onToggleLock();
    } else {
      setInternalIsLocked(!internalIsLocked);
    }
    setSelectedTableId(null);
    if (navigator.vibrate) {
      try {
        navigator.vibrate(30);
      } catch {}
    }
  };

  const [snapGrid, setSnapGrid] = useState<boolean>(true);
  const [localTables, setLocalTables] = useState<TableItem[]>(tables);
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync with prop updates when not dragging
  useEffect(() => {
    if (!draggingTableId) {
      setLocalTables(tables);
    }
  }, [tables, draggingTableId]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  // ----------------------------------------------------
  // POINTER DRAG & DROP HANDLERS (TOUCH & MOUSE COMPATIBLE)
  // ----------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, table: TableItem) => {
    if (isLocked) return;

    // Ignore if clicking on shape or delete buttons inside the card
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    e.preventDefault();
    e.stopPropagation();

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Capture pointer to track dragging seamlessly across the canvas
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    const tableRect = e.currentTarget.getBoundingClientRect();

    // Offset of touch/click within the card
    const offsetX = e.clientX - tableRect.left;
    const offsetY = e.clientY - tableRect.top;

    setDraggingTableId(table.id);
    setSelectedTableId(table.id);
    setDragOffset({ x: offsetX, y: offsetY });

    if (navigator.vibrate) {
      try {
        navigator.vibrate(20);
      } catch {}
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>, table: TableItem) => {
    if (isLocked || draggingTableId !== table.id) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    e.preventDefault();

    const canvasRect = canvas.getBoundingClientRect();
    const currentPxX = e.clientX - canvasRect.left - dragOffset.x;
    const currentPxY = e.clientY - canvasRect.top - dragOffset.y;

    // Convert pixel to percentage of canvas dimensions
    let pctX = (currentPxX / canvasRect.width) * 100;
    let pctY = (currentPxY / canvasRect.height) * 100;

    // Snap to 5% grid intervals if enabled
    if (snapGrid) {
      pctX = Math.round(pctX / 5) * 5;
      pctY = Math.round(pctY / 5) * 5;
    }

    // Boundaries clamping: keep card nicely inside floor boundaries
    const maxPctX = table.shape === 'panjang' ? 52 : table.shape === 'bulat' ? 56 : 54;
    const maxPctY = 82;
    const clampedX = Math.max(2, Math.min(maxPctX, Math.round(pctX * 10) / 10));
    const clampedY = Math.max(4, Math.min(maxPctY, Math.round(pctY * 10) / 10));

    // Update coordinates in local state for instantaneous 60fps movement
    setLocalTables((prev) =>
      prev.map((t) => (t.id === table.id ? { ...t, x: clampedX, y: clampedY } : t))
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>, table: TableItem) => {
    if (isLocked || draggingTableId !== table.id) return;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    setDraggingTableId(null);

    // Save final coordinates to parent state & localStorage immediately
    onReorderTables(localTables);
  };

  // Change table shape in edit mode
  const handleChangeShape = (tableId: string, shape: 'kotak' | 'bulat' | 'panjang') => {
    const seats = shape === 'bulat' ? 2 : shape === 'panjang' ? 6 : 4;
    const updated = localTables.map((t) =>
      t.id === tableId ? { ...t, shape, seats } : t
    );
    setLocalTables(updated);
    onReorderTables(updated);
  };

  // One-click reset tables to neatly aligned grid rows
  const handleResetGridLayout = () => {
    const updated = localTables.map((t, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      return {
        ...t,
        x: col === 0 ? 8 : 54,
        y: 12 + row * 26,
      };
    });
    setLocalTables(updated);
    onReorderTables(updated);
  };

  // Status badge styling helper
  const getStatusInfo = (table: TableItem) => {
    if (table.status === 'kosong') {
      return {
        label: 'Kosong',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500',
        tableBg: 'bg-white border-emerald-300 hover:border-emerald-500 shadow-sm',
        accentBar: 'bg-emerald-500',
        chairColor: 'bg-emerald-200 border-emerald-400',
      };
    }

    if (table.status === 'menunggu_bayar') {
      return {
        label: 'Tunggu Bayar',
        bg: 'bg-amber-100 text-amber-900 border-amber-300',
        dot: 'bg-amber-500',
        tableBg: 'bg-amber-50/80 border-amber-400 hover:border-amber-500 shadow-md',
        accentBar: 'bg-amber-500',
        chairColor: 'bg-amber-200 border-amber-400',
      };
    }

    // Terisi
    return {
      label: 'Terisi',
      bg: 'bg-rose-100 text-rose-800 border-rose-300',
      dot: 'bg-rose-500',
      tableBg: 'bg-rose-50/70 border-rose-400 hover:border-rose-500 shadow-md',
      accentBar: 'bg-rose-600',
      chairColor: 'bg-rose-200 border-rose-400',
    };
  };

  const occupiedCount = localTables.filter((t) => t.status !== 'kosong').length;
  const emptyCount = localTables.length - occupiedCount;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-100 select-none">
      {/* FLOOR PLAN CANVAS AREA (EXPANSIVE & FULL SCREEN) */}
      <div className="flex-1 relative overflow-hidden p-1.5 sm:p-2 h-full min-h-[560px]">
        <div
          ref={canvasRef}
          onClick={() => {
            if (!isLocked) setSelectedTableId(null);
          }}
          className={`relative w-full h-full min-h-[560px] rounded-3xl border-2 transition-all overflow-hidden ${
            isLocked
              ? 'bg-[#f7f6f2] border-stone-300 shadow-inner'
              : 'bg-[#faf9f5] border-amber-400/80 shadow-lg ring-1 ring-amber-400/30'
          }`}
          style={{
            backgroundImage: isLocked
              ? 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)'
              : 'radial-gradient(#d97706 1.4px, transparent 1.4px)',
            backgroundSize: '20px 20px',
          }}
        >
          {/* FLOATING CORNER CONTROL: Posisi Terkunci / Mode Edit Tata Letak */}
          {isLocked ? (
            <div className="absolute top-2.5 right-2.5 z-30">
              <button
                type="button"
                onClick={handleToggleLock}
                title="Buka Mode Edit Denah (Geser & Pindahkan Meja)"
                className="group px-3 py-1.5 bg-stone-900/85 hover:bg-stone-900 text-stone-200 hover:text-white backdrop-blur-md rounded-2xl shadow-lg border border-stone-700/80 flex items-center gap-1.5 transition-all active:scale-95 text-xs font-bold"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400 group-hover:text-amber-400 transition-colors" />
                <span className="text-[11px] font-bold">Posisi Terkunci</span>
              </button>
            </div>
          ) : (
            <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between gap-1.5 bg-stone-900/95 text-stone-100 p-2 sm:px-3 rounded-2xl shadow-2xl border border-amber-500/70 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1 truncate">
                    <Move className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">Mode Edit Tata Letak</span>
                  </span>
                  <span className="text-[10px] text-stone-300 truncate hidden xs:inline">
                    Geser meja bebas pakai jari / mouse
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Magnet Grid Snap Toggle */}
                <button
                  type="button"
                  onClick={() => setSnapGrid(!snapGrid)}
                  className={`px-2 py-1 rounded-xl text-[10px] font-semibold flex items-center gap-1 border transition-colors ${
                    snapGrid
                      ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                  title="Ratakan posisi meja ke titik grid"
                >
                  <Magnet className="w-3 h-3" />
                  <span className="hidden sm:inline">Magnet</span>
                </button>

                {/* Reset to neat grid */}
                <button
                  type="button"
                  onClick={handleResetGridLayout}
                  className="px-2 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                  title="Atur ulang meja secara otomatis berjejer rapi"
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Ratakan</span>
                </button>

                {/* Kunci Posisi / Selesai */}
                <button
                  type="button"
                  onClick={handleToggleLock}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs flex items-center gap-1 shadow-md shadow-amber-950/30 active:scale-95 transition-all"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Selesai</span>
                </button>
              </div>
            </div>
          )}

          {/* Architectural Floor Plan Landmark: Dapur & Kasir */}
          <div className="absolute top-0 left-0 right-0 py-1.5 px-3 pr-32 bg-amber-500/10 border-b border-dashed border-amber-300 flex items-center justify-between text-[10px] font-bold text-amber-800/80 select-none z-0">
            <span className="flex items-center gap-1">
              <span>🍲 DAPUR SOTO & SERVIS</span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400">
              Lantai 1 Utama
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 py-1.5 px-3 bg-stone-200/60 border-t border-dashed border-stone-300 flex items-center justify-center text-[10px] font-extrabold text-stone-500 uppercase tracking-widest select-none z-0">
            🚪 PINTU MASUK & KASIR DEPAN
          </div>

          {/* TABLE OBJECTS ON CANVAS */}
          {localTables.map((table) => {
            const statusInfo = getStatusInfo(table);
            const activeOrder = table.orderId ? activeOrders[table.orderId] : undefined;
            const isDragging = draggingTableId === table.id;
            const isSelected = selectedTableId === table.id;

            // Dimensions based on shape
            const shapeClass =
              table.shape === 'bulat'
                ? 'w-[40%] min-w-[135px] max-w-[165px] aspect-square rounded-full'
                : table.shape === 'panjang'
                ? 'w-[48%] min-w-[160px] max-w-[200px] aspect-16/10 rounded-2xl'
                : 'w-[44%] min-w-[140px] max-w-[175px] aspect-4/3 rounded-2xl'; // default kotak

            const posX = table.x ?? 10;
            const posY = table.y ?? 10;

            return (
              <div
                key={table.id}
                onPointerDown={(e) => handlePointerDown(e, table)}
                onPointerMove={(e) => handlePointerMove(e, table)}
                onPointerUp={(e) => handlePointerUp(e, table)}
                onPointerCancel={(e) => handlePointerUp(e, table)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isLocked) {
                    onSelectTable(table);
                  } else {
                    setSelectedTableId(isSelected ? null : table.id);
                  }
                }}
                style={{
                  left: `${posX}%`,
                  top: `${posY}%`,
                  touchAction: isLocked ? 'auto' : 'none',
                }}
                className={`absolute select-none transition-shadow ${
                  isDragging ? 'z-40 scale-105 shadow-2xl opacity-90' : isSelected ? 'z-30' : 'z-10'
                } ${isLocked ? 'cursor-pointer active:scale-95' : 'cursor-grab active:cursor-grabbing'}`}
              >
                {/* Real-time coordinates tooltip when actively dragging */}
                {isDragging && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-stone-900 text-amber-300 text-[10px] font-mono font-bold whitespace-nowrap shadow-md z-50 pointer-events-none">
                    X: {Math.round(posX)}% · Y: {Math.round(posY)}%
                  </div>
                )}

                {/* Chair Accents Surrounding Table (Top View Architectural Look) */}
                {table.shape === 'bulat' ? (
                  <>
                    <div
                      className={`absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-2 rounded-full border ${statusInfo.chairColor}`}
                    />
                    <div
                      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-2 rounded-full border ${statusInfo.chairColor}`}
                    />
                    <div
                      className={`absolute top-1/2 -left-2 -translate-y-1/2 w-2 h-7 rounded-full border ${statusInfo.chairColor}`}
                    />
                    <div
                      className={`absolute top-1/2 -right-2 -translate-y-1/2 w-2 h-7 rounded-full border ${statusInfo.chairColor}`}
                    />
                  </>
                ) : (
                  <>
                    <div className="absolute -top-2 left-3 right-3 flex justify-around pointer-events-none">
                      <div className={`w-6 h-2 rounded-full border ${statusInfo.chairColor}`} />
                      <div className={`w-6 h-2 rounded-full border ${statusInfo.chairColor}`} />
                      {table.shape === 'panjang' && (
                        <div className={`w-6 h-2 rounded-full border ${statusInfo.chairColor}`} />
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-3 right-3 flex justify-around pointer-events-none">
                      <div className={`w-6 h-2 rounded-full border ${statusInfo.chairColor}`} />
                      <div className={`w-6 h-2 rounded-full border ${statusInfo.chairColor}`} />
                      {table.shape === 'panjang' && (
                        <div className={`w-6 h-2 rounded-full border ${statusInfo.chairColor}`} />
                      )}
                    </div>
                  </>
                )}

                {/* Table Top Surface Card */}
                <div
                  className={`relative p-2.5 flex flex-col justify-between border-2 overflow-hidden transition-colors ${shapeClass} ${
                    statusInfo.tableBg
                  } ${
                    !isLocked && isSelected
                      ? 'ring-3 ring-amber-500 border-amber-600'
                      : !isLocked
                      ? 'border-dashed border-amber-400 hover:border-amber-600'
                      : ''
                  }`}
                >
                  {/* Top Header of Table Card */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 min-w-0">
                      {!isLocked && (
                        <GripVertical className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
                      )}
                      <span className="font-extrabold text-xs text-stone-900 tracking-tight truncate">
                        {table.name}
                      </span>
                    </div>

                    {/* Status Dot / Badge */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`w-2 h-2 rounded-full ${statusInfo.dot} animate-pulse`} />
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${statusInfo.bg}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  {table.status === 'kosong' ? (
                    <div className="my-auto py-1 flex flex-col items-center justify-center text-center">
                      <Utensils className="w-4 h-4 text-emerald-600/70 mb-0.5 stroke-[1.8]" />
                      <span className="text-[10px] font-bold text-emerald-800">
                        {isLocked ? '+ Buat Pesanan' : `${table.seats || 4} Kursi`}
                      </span>
                    </div>
                  ) : (
                    <div className="my-auto py-0.5 space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] text-stone-600">
                        <span className="font-semibold text-stone-700">
                          {activeOrder
                            ? `${activeOrder.items.reduce((s, i) => s + i.quantity, 0)} Item`
                            : `${table.itemsCount || 0} Item`}
                        </span>
                        {table.openedAt && (
                          <span className="font-mono text-[9px] text-stone-400">
                            {table.openedAt}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-black text-rose-700 font-mono truncate">
                        {formatCurrency(activeOrder?.total || table.totalAmount || 0)}
                      </div>
                    </div>
                  )}

                  {/* Bottom Capacity / Edit Hint */}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-200/70 text-[9px] text-stone-500">
                    <span className="font-medium">{table.seats || 4} Kursi</span>
                    {isLocked ? (
                      <span className="text-stone-400">Ketuk</span>
                    ) : (
                      <span className="text-amber-700 font-bold">Geser Meja</span>
                    )}
                  </div>
                </div>

                {/* Edit Controls Toolbar Popover (When Selected in Edit Mode) */}
                {!isLocked && isSelected && (
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-stone-900 text-white rounded-xl shadow-xl border border-stone-700 z-50 animate-in fade-in zoom-in-95">
                    {/* Shape Selector */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeShape(table.id, 'kotak');
                      }}
                      title="Bentuk Kotak (4 Kursi)"
                      className={`p-1.5 rounded-lg transition-colors ${
                        table.shape === 'kotak' || !table.shape
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <Square className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeShape(table.id, 'bulat');
                      }}
                      title="Bentuk Bundar (2 Kursi)"
                      className={`p-1.5 rounded-lg transition-colors ${
                        table.shape === 'bulat'
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <Circle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeShape(table.id, 'panjang');
                      }}
                      title="Bentuk Panjang (6 Kursi)"
                      className={`p-1.5 rounded-lg transition-colors ${
                        table.shape === 'panjang'
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <RectangleHorizontal className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Table if Empty */}
                    {table.status === 'kosong' && localTables.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTable(table.id);
                        }}
                        title="Hapus Meja Ini"
                        className="p-1.5 rounded-lg bg-red-950 text-red-300 hover:bg-red-900 hover:text-white transition-colors ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FLOATING ACTION BUTTON (FAB) (+) MEJA BARU */}
      <div className="fixed bottom-4 right-4 z-30 pointer-events-none">
        <button
          onClick={onAddTable}
          className="pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-xs shadow-xl shadow-red-950/40 border border-amber-400/30 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>(+) Meja Baru</span>
        </button>
      </div>
    </div>
  );
};
