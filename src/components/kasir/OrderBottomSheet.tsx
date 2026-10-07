import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Printer,
  Check,
  Search,
  MessageSquare,
  Utensils,
  Trash2,
  ClipboardList,
  User,
  ArrowRight
} from 'lucide-react';
import { MenuItem, OrderItem, MenuCategory, Order, OrderType } from '../../types';

interface OrderBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  orderType: OrderType;
  tableName?: string;
  tableId?: string;
  existingOrder?: Order | null;
  menuList: MenuItem[];
  onSaveAndPrint: (
    items: OrderItem[],
    type: OrderType,
    tableId?: string,
    tableName?: string,
    customerName?: string,
    printOption?: 'bluetooth' | 'pdf' | 'none'
  ) => void;
}

export const OrderBottomSheet: React.FC<OrderBottomSheetProps> = ({
  isOpen,
  onClose,
  orderType,
  tableName,
  tableId,
  existingOrder,
  menuList,
  onSaveAndPrint,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'order_list'>('catalog');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Record<string, { qty: number; notes: string }>>({});
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);

  useEffect(() => {
    if (existingOrder && isOpen) {
      const map: Record<string, { qty: number; notes: string }> = {};
      existingOrder.items.forEach((item) => {
        map[item.menuId] = { qty: item.quantity, notes: item.notes || '' };
      });
      setSelectedItems(map);
      setCustomerName(existingOrder.customerName || '');
      setActiveTab('catalog');
    } else if (isOpen) {
      setSelectedItems({});
      setCustomerName(orderType === 'meja' ? (tableName ? `Tamu ${tableName}` : 'Tamu Meja') : 'Pelanggan Bungkus');
      setActiveTab('catalog');
    }
  }, [existingOrder, isOpen, orderType, tableName]);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'bakso_kuah', label: 'Soto Kuah' },
    { id: 'pelengkap', label: 'Pelengkap' },
    { id: 'minuman', label: 'Minuman' },
    { id: 'paket', label: 'Paket Hemat' },
  ];

  const filteredMenu = menuList.filter((m) => {
    const matchCat = activeCategory === 'all' || m.category === activeCategory;
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch && m.isAvailable;
  });

  const handleUpdateQty = (menuId: string, delta: number) => {
    setSelectedItems((prev) => {
      const current = prev[menuId]?.qty || 0;
      const notes = prev[menuId]?.notes || '';
      const newQty = Math.max(0, current + delta);

      if (newQty === 0) {
        const copy = { ...prev };
        delete copy[menuId];
        return copy;
      }
      return {
        ...prev,
        [menuId]: { qty: newQty, notes },
      };
    });

    if (navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  const handleRemoveItem = (menuId: string) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      delete copy[menuId];
      return copy;
    });
  };

  const handleUpdateNotes = (menuId: string, notes: string) => {
    setSelectedItems((prev) => {
      if (!prev[menuId]) return prev;
      return {
        ...prev,
        [menuId]: { ...prev[menuId], notes },
      };
    });
  };

  // Convert selected items map to OrderItem array
  const orderItemsList: OrderItem[] = Object.entries(selectedItems)
    .filter(([_, data]) => data.qty > 0)
    .map(([menuId, data]) => {
      const itemDef = menuList.find((m) => m.id === menuId);
      return {
        menuId,
        name: itemDef?.name || 'Item',
        price: itemDef?.price || 0,
        quantity: data.qty,
        notes: data.notes || undefined,
      };
    });

  const totalItemCount = orderItemsList.reduce((sum, i) => sum + i.quantity, 0);
  const totalBill = orderItemsList.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const handleConfirmOrder = (printOption: 'bluetooth' | 'pdf' | 'none') => {
    if (orderItemsList.length === 0) {
      return;
    }
    onSaveAndPrint(
      orderItemsList,
      orderType,
      tableId,
      tableName,
      customerName.trim() || (orderType === 'meja' ? tableName || 'Meja' : 'Pelanggan'),
      printOption
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Container: Full-Height / Maximized Modal (h-[94vh] sm:h-[90vh], rounded-t-2xl) */}
      <div className="relative w-full max-w-4xl mx-auto h-[94vh] sm:h-[90vh] max-h-[96dvh] bg-stone-900 text-stone-100 rounded-t-2xl sm:rounded-t-3xl shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-300 border-t border-stone-800 overflow-hidden">
        {/* Grab Handle */}
        <div 
          onClick={onClose}
          className="w-12 h-1.5 bg-stone-700/80 rounded-full mx-auto my-2 shrink-0 cursor-pointer hover:bg-stone-600 transition-colors" 
          title="Tutup / Geser ke bawah"
        />

        {/* Sheet Header */}
        <div className="px-4 pb-2.5 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-extrabold text-white tracking-tight truncate">
                {orderType === 'meja' ? `Pesanan: ${tableName || 'Meja'}` : 'Pesanan Bungkus (Takeaway)'}
              </span>
              {existingOrder ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Update Pesanan
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Pesanan Baru
                </span>
              )}
            </div>
            
            {/* Customer Name Input */}
            <div className="flex items-center gap-1.5 mt-1">
              <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nama Tamu / Pelanggan..."
                className="text-xs bg-stone-800/80 hover:bg-stone-800 focus:bg-stone-800 text-stone-200 placeholder:text-stone-500 rounded-md px-2 py-0.5 border border-stone-700/60 focus:border-amber-500 focus:outline-hidden w-44 sm:w-56"
              />
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 active:scale-95 transition-all"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation: Katalog Menu vs Rincian Pesanan */}
        <div className="grid grid-cols-2 p-1.5 mx-3 mt-2 bg-stone-950/80 rounded-xl border border-stone-800 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'catalog'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Pilih Menu ({filteredMenu.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('order_list')}
            className={`py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'order_list'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Daftar Pesanan</span>
            {totalItemCount > 0 && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'order_list' ? 'bg-stone-950 text-amber-400' : 'bg-red-600 text-white'
              }`}>
                {totalItemCount}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: KATALOG MENU */}
        {activeTab === 'catalog' && (
          <div className="flex-1 min-h-0 flex flex-col">
            {/* Search & Category Filter Tabs */}
            <div className="p-3 border-b border-stone-800 space-y-2 shrink-0 bg-stone-900/90">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari soto ayam, daging, minuman..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:outline-hidden focus:border-amber-500 placeholder:text-stone-500"
                />
              </div>

              {/* Categories Tab Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1 rounded-xl whitespace-nowrap text-xs font-semibold transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
                        : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LIST MENU CARD (FOTO, NAMA MENU, HARGA) - Responsive Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 overscroll-contain">
              {filteredMenu.length === 0 ? (
                <div className="py-12 text-center text-stone-500 space-y-2">
                  <Utensils className="w-8 h-8 mx-auto opacity-40 text-stone-400" />
                  <p className="text-xs">Tidak ada menu yang sesuai dengan pencarian.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {filteredMenu.map((menu) => {
                    const currentQty = selectedItems[menu.id]?.qty || 0;
                    const currentNotes = selectedItems[menu.id]?.notes || '';
                    const isEditingNote = editingNotesId === menu.id;

                    return (
                      <div
                        key={menu.id}
                        className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                          currentQty > 0
                            ? 'bg-stone-850 border-amber-500/80 shadow-lg ring-1 ring-amber-500/30'
                            : 'bg-stone-800/60 border-stone-750 hover:border-stone-600 shadow-xs'
                        }`}
                      >
                        {/* Bagian Atas: FOTO MENU + Badge QTY */}
                        <div className="relative aspect-4/3 w-full bg-stone-900 overflow-hidden">
                          <img
                            src={menu.imageUrl}
                            alt={menu.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />

                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                          {/* Badge Qty Porsi jika sudah dipilih */}
                          {currentQty > 0 && (
                            <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-red-600 text-white font-mono font-black text-[10px] shadow-md animate-in zoom-in-75 ring-1 ring-white/30">
                              {currentQty}x
                            </div>
                          )}
                        </div>

                        {/* Bagian Tengah: NAMA MENU & HARGA */}
                        <div className="p-2.5 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-white line-clamp-1 leading-snug">
                              {menu.name}
                            </h4>
                            <div className="text-xs font-extrabold text-amber-400 font-mono mt-0.5">
                              {formatCurrency(menu.price)}
                            </div>
                          </div>

                          {/* Tombol Aksi (+ / - atau + Tambah) */}
                          <div className="mt-2 pt-1 border-t border-stone-700/60">
                            {currentQty === 0 ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(menu.id, 1)}
                                className="w-full py-1.5 rounded-xl bg-stone-700 hover:bg-stone-600 active:bg-amber-500 active:text-stone-950 text-stone-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                              >
                                <Plus className="w-3.5 h-3.5 text-amber-400" />
                                <span>Pesan</span>
                              </button>
                            ) : (
                              <div className="space-y-1.5">
                                {/* Counter Control */}
                                <div className="flex items-center justify-between bg-stone-900/90 rounded-xl p-0.5 border border-stone-700">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(menu.id, -1)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-stone-800 text-stone-300 hover:text-white active:scale-90 transition-transform"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>

                                  <span className="font-mono font-bold text-xs text-white">
                                    {currentQty}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(menu.id, 1)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500 text-stone-950 font-bold active:scale-90 transition-transform"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Tombol Catatan Porsi */}
                                {isEditingNote ? (
                                  <div className="flex items-center gap-1 mt-1">
                                    <input
                                      type="text"
                                      placeholder="Misal: Tanpa mie, kuah banyak..."
                                      value={currentNotes}
                                      onChange={(e) => handleUpdateNotes(menu.id, e.target.value)}
                                      className="w-full px-1.5 py-1 bg-stone-900 border border-stone-700 rounded-lg text-[10px] text-stone-200 focus:outline-hidden focus:border-amber-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setEditingNotesId(null)}
                                      className="px-2 py-1 rounded-lg bg-amber-500 text-stone-950 font-bold text-[10px]"
                                    >
                                      OK
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setEditingNotesId(menu.id)}
                                    className="w-full text-center text-[10px] text-stone-400 hover:text-amber-400 truncate flex items-center justify-center gap-1"
                                  >
                                    <MessageSquare className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                    <span className="truncate">
                                      {currentNotes ? currentNotes : '+ Catatan'}
                                    </span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DAFTAR / RINCIAN PESANAN TERPILIH */}
        {activeTab === 'order_list' && (
          <div className="flex-1 min-h-0 flex flex-col p-3 sm:p-4 overflow-y-auto overscroll-contain">
            {orderItemsList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <ShoppingBag className="w-12 h-12 text-stone-600" />
                <h4 className="text-sm font-bold text-stone-300">Belum Ada Menu Terpilih</h4>
                <p className="text-xs text-stone-500 max-w-xs">
                  Silakan pilih menu soto, lauk pelengkap, atau minuman dari katalog menu.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('catalog')}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buka Katalog Menu</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-stone-300">
                    Rincian {orderItemsList.length} Item Terpilih ({totalItemCount} Porsi)
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('catalog')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <span>+ Tambah Menu Lain</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {orderItemsList.map((item) => (
                    <div
                      key={item.menuId}
                      className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/80 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <h5 className="text-xs font-bold text-white truncate">{item.name}</h5>
                          <span className="text-[11px] text-stone-400 font-mono">
                            @{formatCurrency(item.price)}
                          </span>
                        </div>

                        {/* Subtotal */}
                        <div className="text-xs font-bold text-amber-400 font-mono mt-0.5">
                          {formatCurrency(item.price * item.quantity)}
                        </div>

                        {/* Catatan Baris */}
                        <div className="mt-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-amber-500 shrink-0" />
                          <input
                            type="text"
                            placeholder="Tulis catatan (misal: pisah kuah)..."
                            value={selectedItems[item.menuId]?.notes || ''}
                            onChange={(e) => handleUpdateNotes(item.menuId, e.target.value)}
                            className="text-[11px] bg-stone-900 border border-stone-700 rounded-md px-2 py-0.5 text-stone-200 placeholder:text-stone-500 focus:outline-hidden focus:border-amber-500 w-full"
                          />
                        </div>
                      </div>

                      {/* Qty Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center bg-stone-900 rounded-xl border border-stone-700 p-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.menuId, -1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-stone-800 text-stone-300 hover:text-white"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-mono font-bold text-xs text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.menuId, 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500 text-stone-950 font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.menuId)}
                          className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Hapus Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM ORDER SUMMARY & ACTION FOOTER - Equipped with Safe Area Padding */}
        <div 
          className="p-3.5 sm:p-4 bg-stone-950/95 backdrop-blur-md border-t border-stone-800 shrink-0 space-y-2.5 pb-8 sm:pb-4"
          style={{ paddingBottom: 'max(2rem, calc(1rem + env(safe-area-inset-bottom, 0px)))' }}
        >
          {/* Summary Row */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2">
              <span className="text-stone-400">
                Total: <strong className="text-amber-300 font-mono text-sm">{totalItemCount} Porsi</strong>
              </span>
              {totalItemCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'catalog' ? 'order_list' : 'catalog')}
                  className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1"
                >
                  {activeTab === 'catalog' ? `Lihat Rincian (${orderItemsList.length})` : 'Tambah Menu Lagi'}
                </button>
              )}
            </div>
            <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
              {formatCurrency(totalBill)}
            </span>
          </div>

          {/* Action Buttons: Simpan Saja & Simpan & Struk Dapur */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Action 1: Simpan Saja */}
            <button
              type="button"
              onClick={() => handleConfirmOrder('none')}
              disabled={totalItemCount === 0}
              className="py-3 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-stone-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 transition-all"
            >
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Simpan Saja</span>
            </button>

            {/* Action 2: Simpan & Cetak Struk Dapur (Bluetooth Thermal) */}
            <button
              type="button"
              onClick={() => handleConfirmOrder('bluetooth')}
              disabled={totalItemCount === 0}
              className="py-3 px-3 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 transition-all"
            >
              <Printer className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Simpan & Struk Dapur</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

