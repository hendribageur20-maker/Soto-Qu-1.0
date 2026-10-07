import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Search,
  Calendar,
  Filter,
  ChevronRight,
  Receipt,
  Utensils,
  ShoppingBag,
  AlertTriangle,
  Boxes,
  TrendingDown,
  TrendingUp,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { Order, RestaurantProfile, PurchaseTransaction, Ingredient } from '../../types';
import { ExportService } from '../../services/export';

interface LaporanViewProps {
  history: Order[];
  profile: RestaurantProfile;
  onOpenReceipt: (order: Order) => void;
  purchases?: PurchaseTransaction[];
  ingredients?: Ingredient[];
  onNavigateToTab?: (tab: string) => void;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  history,
  profile,
  onOpenReceipt,
  purchases = [],
  ingredients = [],
  onNavigateToTab,
}) => {
  // Main view mode: 'penjualan' (Sales/Omset) vs 'modal_belanja' (Modal & Bahan/Takeaway)
  const [reportMode, setReportMode] = useState<'penjualan' | 'modal_belanja'>('penjualan');

  const [filterPeriod, setFilterPeriod] = useState<'today' | '7days' | 'month' | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'meja' | 'bungkus'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // ----------------------------------------------------
  // STOCK ALERT (Menipis)
  // ----------------------------------------------------
  const lowStockTakeaway = useMemo(
    () => ingredients.filter((i) => i.category === 'suplai_takeaway' && i.currentStock <= i.minStockAlert),
    [ingredients]
  );
  const lowStockFood = useMemo(
    () => ingredients.filter((i) => i.category === 'bahan_makanan' && i.currentStock <= i.minStockAlert),
    [ingredients]
  );
  const totalLowStock = lowStockTakeaway.length + lowStockFood.length;

  // ----------------------------------------------------
  // SALES TRANSACTIONS FILTER
  // ----------------------------------------------------
  const filteredOrders = history.filter((ord) => {
    // Period filter
    const ordDate = new Date(ord.createdAt);
    if (filterPeriod === 'today') {
      if (ord.createdAt.slice(0, 10) !== todayStr) return false;
    } else if (filterPeriod === '7days') {
      const diffDays = (now.getTime() - ordDate.getTime()) / (1000 * 3600 * 24);
      if (diffDays > 7) return false;
    } else if (filterPeriod === 'month') {
      if (ordDate.getMonth() !== now.getMonth() || ordDate.getFullYear() !== now.getFullYear()) {
        return false;
      }
    }

    // Type filter
    if (filterType !== 'all' && ord.type !== filterType) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchReceipt = ord.receiptNumber.toLowerCase().includes(q);
      const matchCustomer = ord.customerName.toLowerCase().includes(q);
      const matchTable = ord.tableName?.toLowerCase().includes(q) || false;
      const matchItems = ord.items.some((i) => i.name.toLowerCase().includes(q));
      if (!matchReceipt && !matchCustomer && !matchTable && !matchItems) return false;
    }

    return true;
  });

  const totalFilteredRevenue = filteredOrders.reduce((s, o) => s + o.total, 0);

  // ----------------------------------------------------
  // MODAL & EXPENSES RECAP (HARIAN & BULANAN)
  // ----------------------------------------------------
  const todayPurchases = useMemo(
    () => purchases.filter((p) => p.date === todayStr),
    [purchases, todayStr]
  );
  const todayFoodExpense = useMemo(
    () => todayPurchases.reduce((s, p) => s + p.totalFoodCost, 0),
    [todayPurchases]
  );
  const todayTakeawayExpense = useMemo(
    () => todayPurchases.reduce((s, p) => s + p.totalTakeawayCost, 0),
    [todayPurchases]
  );
  const todayTotalExpense = todayFoodExpense + todayTakeawayExpense;

  // 30 days expenses
  const thirtyDaysPurchases = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return purchases.filter((p) => new Date(p.date) >= d);
  }, [purchases]);

  const monthlyFoodExpense = useMemo(
    () => thirtyDaysPurchases.reduce((s, p) => s + p.totalFoodCost, 0),
    [thirtyDaysPurchases]
  );
  const monthlyTakeawayExpense = useMemo(
    () => thirtyDaysPurchases.reduce((s, p) => s + p.totalTakeawayCost, 0),
    [thirtyDaysPurchases]
  );
  const monthlyTotalExpense = monthlyFoodExpense + monthlyTakeawayExpense;

  // Aggregated per-ingredient expenses over last 30 days
  const perIngredientStats = useMemo(() => {
    const map = new Map<string, { name: string; category: string; unit: string; totalQty: number; totalCost: number }>();
    thirtyDaysPurchases.forEach((transaction) => {
      transaction.items.forEach((item) => {
        const key = item.ingredientId || item.name;
        const current = map.get(key) || {
          name: item.name,
          category: item.category,
          unit: item.unit,
          totalQty: 0,
          totalCost: 0,
        };
        current.totalQty += item.qty;
        current.totalCost += item.totalPrice;
        map.set(key, current);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.totalCost - a.totalCost);
  }, [thirtyDaysPurchases]);

  // Today Sales vs Expenses
  const todaySalesTotal = useMemo(() => {
    return history
      .filter((o) => o.createdAt.slice(0, 10) === todayStr)
      .reduce((s, o) => s + o.total, 0);
  }, [history, todayStr]);

  const todayGrossProfit = todaySalesTotal - todayTotalExpense;

  const getPeriodLabel = () => {
    switch (filterPeriod) {
      case 'today':
        return 'Hari Ini';
      case '7days':
        return '7 Hari Terakhir';
      case 'month':
        return 'Bulan Ini';
      default:
        return 'Semua Waktu';
    }
  };

  const handleExportCSV = () => {
    ExportService.exportToCSV(filteredOrders, profile);
  };

  const handleExportPDF = () => {
    ExportService.exportReportPDF(filteredOrders, profile, getPeriodLabel());
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-3 sm:p-4 space-y-3 pb-24 text-stone-900 bg-stone-100">
      {/* ==================================================== */}
      {/* 1. STOCK ALERT WARNING (Kemasan & Bahan Menipis)     */}
      {/* ==================================================== */}
      {totalLowStock > 0 && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 shadow-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-rose-900 block">
                Peringatan Stok Menipis ({totalLowStock} Item)
              </span>
              <span className="text-[11px] text-rose-700">
                {lowStockTakeaway.length > 0 && `${lowStockTakeaway.length} suplai kemasan takeaway`}
                {lowStockTakeaway.length > 0 && lowStockFood.length > 0 && ' & '}
                {lowStockFood.length > 0 && `${lowStockFood.length} bahan makanan`} di bawah batas minimal.
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab?.('bahan')}
            className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1 shrink-0 active:scale-95 transition-all shadow-xs"
          >
            <span>Restock</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. MODE SWITCHER: PENJUALAN VS REKAP MODAL BELANJA   */}
      {/* ==================================================== */}
      <div className="p-1 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-1">
        <button
          onClick={() => setReportMode('penjualan')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
            reportMode === 'penjualan'
              ? 'bg-gradient-to-r from-red-700 to-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Laporan Penjualan (Kasir)</span>
        </button>

        <button
          onClick={() => setReportMode('modal_belanja')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
            reportMode === 'modal_belanja'
              ? 'bg-gradient-to-r from-red-700 to-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Rekapan Modal & Belanja</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* 3. MODE: REKAP MODAL & BELANJA BAHAN / TAKEAWAY      */}
      {/* ==================================================== */}
      {reportMode === 'modal_belanja' && (
        <div className="space-y-3">
          {/* Daily Profit & Loss Summary Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white shadow-md border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span className="font-semibold">Kalkulasi Keuangan Hari Ini:</span>
              <span className="text-[11px] text-stone-400 font-mono">
                {new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' })}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-xl bg-stone-800/70 border border-stone-700">
                <span className="text-[9px] uppercase font-bold text-stone-400 block">Omset Penjualan</span>
                <span className="text-xs font-black text-emerald-400 font-mono block mt-0.5">
                  {formatCurrency(todaySalesTotal)}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-stone-800/70 border border-stone-700">
                <span className="text-[9px] uppercase font-bold text-stone-400 block">Total Modal Belanja</span>
                <span className="text-xs font-black text-rose-400 font-mono block mt-0.5">
                  {formatCurrency(todayTotalExpense)}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40">
                <span className="text-[9px] uppercase font-bold text-amber-300 block">Laba Kotor</span>
                <span className={`text-xs font-black font-mono block mt-0.5 ${todayGrossProfit >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {formatCurrency(todayGrossProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* a) Rekapan Harian Modal: Pisah Makanan vs Kemasan */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  a) Rekapan Harian Modal Belanja
                </span>
                <h3 className="text-sm font-black text-stone-900">
                  Total Modal Hari Ini: {formatCurrency(todayTotalExpense)}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold text-[10px]">
                {todayPurchases.length} Nota Belanja
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                  🥩 Belanja Bahan Makanan
                </span>
                <div className="text-sm font-black text-emerald-950 font-mono">
                  {formatCurrency(todayFoodExpense)}
                </div>
                <span className="text-[10px] text-emerald-700 block">
                  Daging, bumbu, koya, beras, bihun, mie
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                  🥡 Belanja Kemasan Takeaway
                </span>
                <div className="text-sm font-black text-amber-950 font-mono">
                  {formatCurrency(todayTakeawayExpense)}
                </div>
                <span className="text-[10px] text-amber-700 block">
                  Paper bowl, tutup, sendok, kresek, stiker
                </span>
              </div>
            </div>
          </div>

          {/* b) Rekapan Bulanan / Riwayat 30 Hari per Bahan */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  b) Rekapan Bulanan (30 Hari Terakhir)
                </span>
                <h3 className="text-sm font-black text-stone-900">
                  Daftar Pengeluaran per Bahan
                </h3>
              </div>
              <span className="text-xs font-black text-red-700 font-mono">
                {formatCurrency(monthlyTotalExpense)}
              </span>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {perIngredientStats.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-stone-400">#{idx + 1}</span>
                      <span className="font-bold text-stone-900 truncate">{item.name}</span>
                      <span
                        className={`text-[8px] font-bold px-1 rounded ${
                          item.category === 'suplai_takeaway'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.category === 'suplai_takeaway' ? 'Kemasan' : 'Makanan'}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-mono mt-0.5 block">
                      Total dibeli: {item.totalQty.toFixed(1)} {item.unit}
                    </span>
                  </div>
                  <span className="font-black text-stone-900 font-mono text-xs">
                    {formatCurrency(item.totalCost)}
                  </span>
                </div>
              ))}

              {perIngredientStats.length === 0 && (
                <div className="text-center py-6 text-stone-400 text-xs">
                  Belum ada transaksi belanja modal dalam sebulan terakhir.
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigateToTab?.('bahan')}
              className="w-full py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              <span>Buka Formulir Belanja & Master Bahan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. MODE: LAPORAN PENJUALAN (KASIR)                   */}
      {/* ==================================================== */}
      {reportMode === 'penjualan' && (
        <div className="space-y-3">
          {/* Top Filter & Export Actions Card */}
          <div className="p-3.5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-900">
                  Laporan Penjualan ({filteredOrders.length} Trx)
                </span>
                <div className="text-sm font-extrabold text-amber-700">
                  {formatCurrency(totalFilteredRevenue)}
                </div>
              </div>

              {/* Export Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleExportPDF}
                  className="px-2.5 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                  title="Export Laporan PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                  title="Export Laporan Excel/CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel/CSV</span>
                </button>
              </div>
            </div>

            {/* Period Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-xs">
              {[
                { id: 'today', label: 'Hari Ini' },
                { id: '7days', label: '7 Hari' },
                { id: 'month', label: 'Bulan Ini' },
                { id: 'all', label: 'Semua' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterPeriod(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-colors ${
                    filterPeriod === tab.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search & Service Type Filter */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari No. Nota atau nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <select
                value={filterType}
                onChange={(e: any) => setFilterType(e.target.value)}
                className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 font-semibold focus:outline-hidden"
              >
                <option value="all">Semua Tipe</option>
                <option value="meja">Makan di Tempat</option>
                <option value="bungkus">Bungkus</option>
              </select>
            </div>
          </div>

          {/* Transactions Scrollable List */}
          <div className="space-y-2">
            {filteredOrders.map((ord) => {
              const d = new Date(ord.createdAt);
              const timeFormatted = d.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const dateFormatted = d.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
              });

              return (
                <div
                  key={ord.id}
                  onClick={() => onOpenReceipt(ord)}
                  className="p-3 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-stone-300 active:scale-98 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        ord.type === 'meja'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ord.type === 'meja' ? (
                        <Utensils className="w-5 h-5" />
                      ) : (
                        <ShoppingBag className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-stone-900 truncate">
                          {ord.receiptNumber}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-stone-100 text-stone-600">
                          {ord.type === 'meja' ? ord.tableName || 'Meja' : 'Bungkus'}
                        </span>
                      </div>

                      <div className="text-[11px] text-stone-500 truncate mt-0.5">
                        {dateFormatted} &bull; {timeFormatted} &bull; {ord.items.length} Macam Menu
                      </div>
                    </div>
                  </div>

                  {/* Amount & Method */}
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <div className="font-black text-xs text-stone-900 font-mono">
                        {formatCurrency(ord.total)}
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          ord.paymentMethod === 'tunai'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {ord.paymentMethod || 'Lunas'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </div>
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="py-12 text-center text-xs text-stone-400">
                Tidak ada riwayat transaksi pada filter ini.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
