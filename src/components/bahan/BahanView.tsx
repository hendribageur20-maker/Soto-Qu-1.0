import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Search,
  ShoppingCart,
  Receipt,
  Calendar,
  Store,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  X,
  Check,
  TrendingDown,
  Sparkles,
  RefreshCw,
  Package,
  Info
} from 'lucide-react';
import { Ingredient, IngredientCategory, IngredientUnit, PurchaseItem, PurchaseTransaction } from '../../types';

interface BahanViewProps {
  ingredients: Ingredient[];
  onSaveIngredients: (items: Ingredient[]) => void;
  purchases: PurchaseTransaction[];
  onSavePurchases: (items: PurchaseTransaction[]) => void;
  onShowNotification?: (msg: string) => void;
}

interface NewPurchaseRow {
  rowId: string;
  ingredientId: string;
  name: string;
  category: IngredientCategory;
  qty: number;
  unit: IngredientUnit;
  unitPrice: number;
  totalPrice: number;
}

export const BahanView: React.FC<BahanViewProps> = ({
  ingredients,
  onSaveIngredients,
  purchases,
  onSavePurchases,
  onShowNotification,
}) => {
  // Navigation Sub-Tabs: 'belanja' (Input Harian) | 'master' (Master Data) | 'rekap' (Rekapan Modal)
  const [activeTab, setActiveTab] = useState<'belanja' | 'master' | 'rekap'>('belanja');

  // Master List Search & Category Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'bahan_makanan' | 'suplai_takeaway'>('all');

  // Master Add/Edit Modal State
  const [isMasterModalOpen, setIsMasterModalOpen] = useState<boolean>(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [formCategory, setFormCategory] = useState<IngredientCategory>('bahan_makanan');
  const [formName, setFormName] = useState('');
  const [formInitialQty, setFormInitialQty] = useState<number>(10);
  const [formUnit, setFormUnit] = useState<IngredientUnit>('kg');
  const [formUnitPrice, setFormUnitPrice] = useState<number>(25000);
  const [formCurrentStock, setFormCurrentStock] = useState<number>(10);
  const [formMinAlert, setFormMinAlert] = useState<number>(3);
  const [formNote, setFormNote] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Quick Adjust Stock Modal State
  const [stockAdjustItem, setStockAdjustItem] = useState<Ingredient | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<'tambah' | 'kurang'>('tambah');

  // ----------------------------------------------------
  // DAILY PURCHASE FORM STATE
  // ----------------------------------------------------
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [purchaseDate, setPurchaseDate] = useState<string>(todayStr);
  const [purchaseStore, setPurchaseStore] = useState<string>('');
  const [purchaseNotes, setPurchaseNotes] = useState<string>('');

  const [purchaseRows, setPurchaseRows] = useState<NewPurchaseRow[]>([
    {
      rowId: `row-${Date.now()}-1`,
      ingredientId: ingredients[0]?.id || '',
      name: ingredients[0]?.name || '',
      category: ingredients[0]?.category || 'bahan_makanan',
      qty: 1,
      unit: ingredients[0]?.unit || 'kg',
      unitPrice: ingredients[0]?.unitPrice || 0,
      totalPrice: ingredients[0]?.unitPrice || 0,
    },
  ]);

  // Selected detail for purchase receipt preview
  const [selectedReceipt, setSelectedReceipt] = useState<PurchaseTransaction | null>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  // ----------------------------------------------------
  // STOCK ALERTS CALCULATION
  // ----------------------------------------------------
  const lowStockItems = useMemo(
    () => ingredients.filter((ing) => ing.currentStock <= ing.minStockAlert),
    [ingredients]
  );
  const lowStockTakeaway = useMemo(
    () => lowStockItems.filter((i) => i.category === 'suplai_takeaway'),
    [lowStockItems]
  );
  const lowStockFood = useMemo(
    () => lowStockItems.filter((i) => i.category === 'bahan_makanan'),
    [lowStockItems]
  );

  // Total valuation
  const totalInventoryValuation = useMemo(
    () => ingredients.reduce((sum, ing) => sum + ing.currentStock * ing.unitPrice, 0),
    [ingredients]
  );

  // Filtered Master Items
  const filteredMasterItems = useMemo(() => {
    return ingredients.filter((ing) => {
      const matchSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'all' || ing.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [ingredients, searchQuery, categoryFilter]);

  // ----------------------------------------------------
  // MASTER INGREDIENT ACTIONS
  // ----------------------------------------------------
  const handleOpenAddMaster = (defaultCat?: IngredientCategory) => {
    setEditingIngredient(null);
    setFormCategory(defaultCat || 'bahan_makanan');
    setFormName('');
    setFormInitialQty(10);
    setFormUnit(defaultCat === 'suplai_takeaway' ? 'pcs' : 'kg');
    setFormUnitPrice(defaultCat === 'suplai_takeaway' ? 1200 : 25000);
    setFormCurrentStock(10);
    setFormMinAlert(defaultCat === 'suplai_takeaway' ? 50 : 3);
    setFormNote('');
    setIsMasterModalOpen(true);
  };

  const handleOpenEditMaster = (item: Ingredient) => {
    setEditingIngredient(item);
    setFormCategory(item.category || 'bahan_makanan');
    setFormName(item.name);
    setFormInitialQty(item.initialQty);
    setFormUnit(item.unit);
    setFormUnitPrice(item.unitPrice);
    setFormCurrentStock(item.currentStock);
    setFormMinAlert(item.minStockAlert);
    setFormNote(item.note || '');
    setIsMasterModalOpen(true);
  };

  const handleSaveMasterForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingIngredient) {
      const updated = ingredients.map((ing) =>
        ing.id === editingIngredient.id
          ? {
              ...ing,
              name: formName.trim(),
              category: formCategory,
              initialQty: formInitialQty,
              unit: formUnit,
              unitPrice: formUnitPrice,
              currentStock: formCurrentStock,
              minStockAlert: formMinAlert,
              note: formNote.trim(),
              updatedAt: new Date().toISOString(),
            }
          : ing
      );
      onSaveIngredients(updated);
      onShowNotification?.(`Master "${formName.trim()}" berhasil diperbarui.`);
    } else {
      const newItem: Ingredient = {
        id: `ing-${Date.now()}`,
        name: formName.trim(),
        category: formCategory,
        initialQty: formInitialQty,
        unit: formUnit,
        unitPrice: formUnitPrice,
        currentStock: formCurrentStock,
        minStockAlert: formMinAlert,
        note: formNote.trim(),
        updatedAt: new Date().toISOString(),
      };
      onSaveIngredients([newItem, ...ingredients]);
      onShowNotification?.(`Master "${formName.trim()}" berhasil ditambahkan.`);
    }

    setIsMasterModalOpen(false);
  };

  const handleDeleteMaster = (id: string, name: string) => {
    const updated = ingredients.filter((i) => i.id !== id);
    onSaveIngredients(updated);
    setConfirmDeleteId(null);
    onShowNotification?.(`Item "${name}" dihapus dari master.`);
  };

  const handleSaveStockAdjust = () => {
    if (!stockAdjustItem || adjustAmount <= 0) return;

    const delta = adjustType === 'tambah' ? adjustAmount : -adjustAmount;
    const newStock = Math.max(0, stockAdjustItem.currentStock + delta);

    const updated = ingredients.map((ing) =>
      ing.id === stockAdjustItem.id
        ? {
            ...ing,
            currentStock: Number(newStock.toFixed(2)),
            updatedAt: new Date().toISOString(),
          }
        : ing
    );

    onSaveIngredients(updated);
    onShowNotification?.(
      `Stok ${stockAdjustItem.name} disesuaikan: ${newStock.toFixed(2)} ${stockAdjustItem.unit}`
    );
    setStockAdjustItem(null);
    setAdjustAmount(0);
  };

  // ----------------------------------------------------
  // DAILY PURCHASE ACTIONS
  // ----------------------------------------------------
  const handleAddPurchaseRow = (targetIngredientId?: string) => {
    const defaultIng = targetIngredientId
      ? ingredients.find((i) => i.id === targetIngredientId) || ingredients[0]
      : ingredients[0];

    const newRow: NewPurchaseRow = {
      rowId: `row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ingredientId: defaultIng?.id || '',
      name: defaultIng?.name || '',
      category: defaultIng?.category || 'bahan_makanan',
      qty: 1,
      unit: defaultIng?.unit || 'kg',
      unitPrice: defaultIng?.unitPrice || 0,
      totalPrice: defaultIng?.unitPrice || 0,
    };
    setPurchaseRows([...purchaseRows, newRow]);
  };

  const handleRemovePurchaseRow = (rowId: string) => {
    if (purchaseRows.length <= 1) {
      onShowNotification?.('Minimal satu baris belanjaan.');
      return;
    }
    setPurchaseRows(purchaseRows.filter((r) => r.rowId !== rowId));
  };

  const handleRowSelectIngredient = (rowId: string, ingredientId: string) => {
    const matched = ingredients.find((i) => i.id === ingredientId);
    if (!matched) return;

    setPurchaseRows((prev) =>
      prev.map((row) => {
        if (row.rowId !== rowId) return row;
        const qty = row.qty > 0 ? row.qty : 1;
        return {
          ...row,
          ingredientId: matched.id,
          name: matched.name,
          category: matched.category,
          unit: matched.unit,
          unitPrice: matched.unitPrice,
          totalPrice: qty * matched.unitPrice,
        };
      })
    );
  };

  const handleRowChangeQty = (rowId: string, qty: number) => {
    setPurchaseRows((prev) =>
      prev.map((row) => {
        if (row.rowId !== rowId) return row;
        const validQty = Math.max(0, qty);
        return {
          ...row,
          qty: validQty,
          totalPrice: validQty * row.unitPrice,
        };
      })
    );
  };

  const handleRowChangePrice = (rowId: string, price: number) => {
    setPurchaseRows((prev) =>
      prev.map((row) => {
        if (row.rowId !== rowId) return row;
        const validPrice = Math.max(0, price);
        return {
          ...row,
          unitPrice: validPrice,
          totalPrice: row.qty * validPrice,
        };
      })
    );
  };

  const handleRowChangeUnit = (rowId: string, unit: IngredientUnit) => {
    setPurchaseRows((prev) =>
      prev.map((row) => (row.rowId === rowId ? { ...row, unit } : row))
    );
  };

  // Quick Action from Stock Alert: Jump to Belanja Form and Preload the item
  const handleQuickRestockFromAlert = (item: Ingredient) => {
    setActiveTab('belanja');
    // Check if item is already in rows
    const existing = purchaseRows.find((r) => r.ingredientId === item.id);
    if (!existing) {
      const newRow: NewPurchaseRow = {
        rowId: `row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ingredientId: item.id,
        name: item.name,
        category: item.category,
        qty: Math.max(1, item.minStockAlert * 2 - item.currentStock),
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: Math.max(1, item.minStockAlert * 2 - item.currentStock) * item.unitPrice,
      };
      setPurchaseRows([newRow, ...purchaseRows.filter((r) => r.qty > 0)]);
    }
    onShowNotification?.(`Menyiapkan belanja untuk ${item.name}`);
  };

  // Current Purchase Calculations
  const calculatedFoodCost = useMemo(() => {
    return purchaseRows
      .filter((r) => r.category === 'bahan_makanan')
      .reduce((s, r) => s + r.totalPrice, 0);
  }, [purchaseRows]);

  const calculatedTakeawayCost = useMemo(() => {
    return purchaseRows
      .filter((r) => r.category === 'suplai_takeaway')
      .reduce((s, r) => s + r.totalPrice, 0);
  }, [purchaseRows]);

  const calculatedTotalExpense = calculatedFoodCost + calculatedTakeawayCost;

  // Save Daily Purchase Transaction & Auto-Increase Master Stocks
  const handleSavePurchaseTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    const validRows = purchaseRows.filter((r) => r.qty > 0 && r.ingredientId);
    if (validRows.length === 0) {
      onShowNotification?.('Mohon isi minimal satu baris belanjaan dengan jumlah > 0.');
      return;
    }

    const items: PurchaseItem[] = validRows.map((r) => ({
      id: `pchi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ingredientId: r.ingredientId,
      name: r.name,
      category: r.category,
      qty: r.qty,
      unit: r.unit,
      unitPrice: r.unitPrice,
      totalPrice: r.totalPrice,
    }));

    const foodCost = items
      .filter((i) => i.category === 'bahan_makanan')
      .reduce((s, i) => s + i.totalPrice, 0);

    const takeawayCost = items
      .filter((i) => i.category === 'suplai_takeaway')
      .reduce((s, i) => s + i.totalPrice, 0);

    const newTransaction: PurchaseTransaction = {
      id: `pch-${Date.now()}`,
      date: purchaseDate,
      storeName: purchaseStore.trim() || 'Pasar / Toko Umum',
      items,
      totalFoodCost: foodCost,
      totalTakeawayCost: takeawayCost,
      totalExpense: foodCost + takeawayCost,
      notes: purchaseNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    // 1. Save Transaction to purchases list
    const updatedPurchases = [newTransaction, ...purchases];
    onSavePurchases(updatedPurchases);

    // 2. Automatically update Master Stocks (currentStock += purchased qty) and unitPrice
    const updatedIngredients = ingredients.map((ing) => {
      const matchPurchases = items.filter((p) => p.ingredientId === ing.id);
      if (matchPurchases.length === 0) return ing;

      const addedStock = matchPurchases.reduce((sum, p) => sum + p.qty, 0);
      const latestPrice = matchPurchases[matchPurchases.length - 1].unitPrice;

      return {
        ...ing,
        currentStock: Number((ing.currentStock + addedStock).toFixed(2)),
        unitPrice: latestPrice > 0 ? latestPrice : ing.unitPrice,
        updatedAt: new Date().toISOString(),
      };
    });
    onSaveIngredients(updatedIngredients);

    // 3. Reset form
    setPurchaseStore('');
    setPurchaseNotes('');
    setPurchaseRows([
      {
        rowId: `row-${Date.now()}-1`,
        ingredientId: ingredients[0]?.id || '',
        name: ingredients[0]?.name || '',
        category: ingredients[0]?.category || 'bahan_makanan',
        qty: 1,
        unit: ingredients[0]?.unit || 'kg',
        unitPrice: ingredients[0]?.unitPrice || 0,
        totalPrice: ingredients[0]?.unitPrice || 0,
      },
    ]);

    onShowNotification?.(
      `Belanja modal Rp ${formatCurrency(newTransaction.totalExpense)} tersimpan & stok otomatis bertambah!`
    );
    setActiveTab('rekap');
  };

  // ----------------------------------------------------
  // REKAPAN & LAPORAN MODAL CALCULATIONS
  // ----------------------------------------------------
  // Today purchases
  const todayPurchases = useMemo(() => {
    return purchases.filter((p) => p.date === todayStr);
  }, [purchases, todayStr]);

  const todayTotalFood = useMemo(
    () => todayPurchases.reduce((s, p) => s + p.totalFoodCost, 0),
    [todayPurchases]
  );
  const todayTotalTakeaway = useMemo(
    () => todayPurchases.reduce((s, p) => s + p.totalTakeawayCost, 0),
    [todayPurchases]
  );
  const todayTotalExpense = todayTotalFood + todayTotalTakeaway;

  // Monthly / 30-day purchases
  const monthlyPurchases = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    return purchases.filter((p) => {
      const pDate = new Date(p.date);
      return pDate >= thirtyDaysAgo;
    });
  }, [purchases]);

  const monthlyTotalFood = useMemo(
    () => monthlyPurchases.reduce((s, p) => s + p.totalFoodCost, 0),
    [monthlyPurchases]
  );
  const monthlyTotalTakeaway = useMemo(
    () => monthlyPurchases.reduce((s, p) => s + p.totalTakeawayCost, 0),
    [monthlyPurchases]
  );
  const monthlyTotalExpense = monthlyTotalFood + monthlyTotalTakeaway;

  // Aggregated per-ingredient expenses over the last 30 days
  const perIngredientStats = useMemo(() => {
    const map = new Map<string, { name: string; category: IngredientCategory; unit: string; totalQty: number; totalCost: number }>();

    monthlyPurchases.forEach((transaction) => {
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
  }, [monthlyPurchases]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-3 sm:p-4 space-y-3 pb-24 text-stone-900 bg-stone-100">
      {/* ==================================================== */}
      {/* 1. STOCK ALERT BANNER (If items are running low)     */}
      {/* ==================================================== */}
      {lowStockItems.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 text-white shadow-md border border-rose-800 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 border border-rose-500/30">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wide flex items-center gap-1.5 text-rose-200">
                  <span>PERINGATAN STOK MENIPIS</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                    {lowStockItems.length} Item
                  </span>
                </h4>
                <p className="text-[11px] text-rose-300/90 mt-0.5">
                  {lowStockTakeaway.length > 0 && `${lowStockTakeaway.length} suplai takeaway kemasan`}
                  {lowStockTakeaway.length > 0 && lowStockFood.length > 0 && ' dan '}
                  {lowStockFood.length > 0 && `${lowStockFood.length} bahan makanan`} di bawah batas aman.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('master')}
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-rose-800/80 hover:bg-rose-700 text-rose-100 shrink-0 border border-rose-700 active:scale-95 transition-all"
            >
              Lihat Semua
            </button>
          </div>

          {/* Quick item chips */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {lowStockItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="px-2.5 py-1.5 rounded-xl bg-stone-900/60 border border-rose-700/50 flex items-center gap-2 shrink-0"
              >
                <div>
                  <span className="text-[11px] font-bold text-white block truncate max-w-[140px]">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-rose-300 font-mono">
                    Sisa {item.currentStock} {item.unit} (Min: {item.minStockAlert})
                  </span>
                </div>
                <button
                  onClick={() => handleQuickRestockFromAlert(item)}
                  className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-[10px] active:scale-95 transition-all shadow-xs"
                >
                  + Belanja
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. SUB-TAB SWITCHER                                  */}
      {/* ==================================================== */}
      <div className="p-1 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-1">
        <button
          onClick={() => setActiveTab('belanja')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'belanja'
              ? 'bg-gradient-to-r from-red-700 to-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Input Belanja</span>
        </button>

        <button
          onClick={() => setActiveTab('master')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'master'
              ? 'bg-gradient-to-r from-red-700 to-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Master Bahan</span>
          {lowStockItems.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rekap')}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'rekap'
              ? 'bg-gradient-to-r from-red-700 to-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Rekapan Modal</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* 3. TAB 1: FORM INPUT HARIAN / BELANJA MODAL          */}
      {/* ==================================================== */}
      {activeTab === 'belanja' && (
        <div className="space-y-3">
          {/* Daily Expense Quick Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white border border-stone-800 shadow-md">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span className="flex items-center gap-1.5 font-semibold">
                <Store className="w-4 h-4 text-amber-400" />
                Input Belanja Harian (Modal Operasional)
              </span>
              <span className="text-[11px] text-stone-400 font-mono">
                {new Date(purchaseDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
              </span>
            </div>

            <div className="mt-2 text-2xl font-black text-amber-400 tracking-tight">
              {formatCurrency(calculatedTotalExpense)}
            </div>

            <div className="mt-2 pt-2 border-t border-stone-800 grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-stone-800/60">
                <span className="text-stone-400 block text-[10px]">Bahan Makanan:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {formatCurrency(calculatedFoodCost)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-stone-800/60">
                <span className="text-stone-400 block text-[10px]">Suplai Takeaway/Kemasan:</span>
                <span className="font-bold text-amber-300 font-mono">
                  {formatCurrency(calculatedTakeawayCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSavePurchaseTransaction} className="p-3.5 sm:p-4 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3.5">
            {/* Header Form: Tanggal & Nama Toko / Supplier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  Tanggal Belanja:
                </label>
                <input
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-800 font-semibold focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-stone-400" />
                  Toko / Pasar / Supplier (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Misal: Pasar Kranggan / Toko Plastik"
                  value={purchaseStore}
                  onChange={(e) => setPurchaseStore(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            {/* Purchase Item Rows */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-red-600" />
                  Daftar Bahan & Kemasan yang Dibeli ({purchaseRows.length} Baris)
                </span>
                <span className="text-[10px] text-stone-400">Total = Qty × Harga</span>
              </div>

              {purchaseRows.map((row, idx) => (
                <div
                  key={row.rowId}
                  className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    {/* Dropdown Select from Master Bahan & Takeaway */}
                    <div className="flex-1">
                      <select
                        value={row.ingredientId}
                        onChange={(e) => handleRowSelectIngredient(row.rowId, e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:outline-hidden focus:border-amber-500 shadow-2xs"
                      >
                        <optgroup label="🥩 Bahan Makanan">
                          {ingredients
                            .filter((i) => i.category === 'bahan_makanan')
                            .map((i) => (
                              <option key={i.id} value={i.id}>
                                {i.name} ({i.unit})
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="🥡 Suplai Takeaway / Kemasan">
                          {ingredients
                            .filter((i) => i.category === 'suplai_takeaway')
                            .map((i) => (
                              <option key={i.id} value={i.id}>
                                {i.name} ({i.unit})
                              </option>
                            ))}
                        </optgroup>
                      </select>
                    </div>

                    {/* Category tag */}
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        row.category === 'suplai_takeaway'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {row.category === 'suplai_takeaway' ? 'Takeaway' : 'Makanan'}
                    </span>

                    {/* Delete row button */}
                    <button
                      type="button"
                      onClick={() => handleRemovePurchaseRow(row.rowId)}
                      className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                      title="Hapus Baris"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Row Inputs: Qty, Satuan, Harga Satuan, Subtotal */}
                  <div className="grid grid-cols-4 gap-2 pt-1 text-xs">
                    <div>
                      <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">
                        Qty Beli:
                      </label>
                      <input
                        type="number"
                        step="any"
                        min={0.01}
                        required
                        value={row.qty || ''}
                        onChange={(e) => handleRowChangeQty(row.rowId, Number(e.target.value) || 0)}
                        placeholder="1"
                        className="w-full px-2 py-1.5 bg-white rounded-lg border border-stone-200 text-xs font-mono font-bold text-stone-800 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">
                        Satuan:
                      </label>
                      <select
                        value={row.unit}
                        onChange={(e) => handleRowChangeUnit(row.rowId, e.target.value as IngredientUnit)}
                        className="w-full px-1.5 py-1.5 bg-white rounded-lg border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-hidden focus:border-amber-500"
                      >
                        <option value="kg">kg</option>
                        <option value="gr">gr</option>
                        <option value="pcs">pcs</option>
                        <option value="pack">pack</option>
                        <option value="dus">dus</option>
                        <option value="lembar">lembar</option>
                        <option value="liter">liter</option>
                        <option value="ikat">ikat</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">
                        Harga (Rp):
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={row.unitPrice || ''}
                        onChange={(e) => handleRowChangePrice(row.rowId, Number(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-2 py-1.5 bg-white rounded-lg border border-stone-200 text-xs font-mono text-stone-800 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="bg-amber-50/70 rounded-lg p-1 px-1.5 border border-amber-200/60 flex flex-col justify-center text-right">
                      <span className="text-[9px] text-amber-700 font-semibold uppercase">
                        Total
                      </span>
                      <span className="text-xs font-black text-amber-950 font-mono truncate">
                        {formatCurrency(row.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar: Tambah Baris */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => handleAddPurchaseRow()}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-stone-600" />
                <span>+ Tambah Baris Belanja</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenAddMaster()}
                className="text-[11px] text-stone-500 hover:text-stone-800 underline flex items-center gap-1"
              >
                <span>Bahan belum ada di master? Buat Baru</span>
              </button>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Catatan Nota Belanja (Opsional):
              </label>
              <input
                type="text"
                placeholder="Misal: Nota #0482, belanja stok akhir pekan"
                value={purchaseNotes}
                onChange={(e) => setPurchaseNotes(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-stone-400 block">Total Pengeluaran:</span>
                <span className="text-base font-black text-stone-900 font-mono">
                  {formatCurrency(calculatedTotalExpense)}
                </span>
              </div>

              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Belanja & Tambah Stok</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. TAB 2: MASTER BAHAN & TAKEAWAY                    */}
      {/* ==================================================== */}
      {activeTab === 'master' && (
        <div className="space-y-3">
          {/* Master Valuation Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white shadow-lg border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-stone-300">
                  Total Nilai Aset Bahan & Kemasan
                </span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                {ingredients.length} Item Master
              </span>
            </div>

            <div className="text-2xl font-black text-amber-400 tracking-tight">
              {formatCurrency(totalInventoryValuation)}
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-800">
              <span>{ingredients.filter((i) => i.category === 'bahan_makanan').length} Bahan Makanan</span>
              <span>{ingredients.filter((i) => i.category === 'suplai_takeaway').length} Suplai Takeaway</span>
            </div>
          </div>

          {/* Master Search & Category Filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari bahan / kemasan (daging, paper bowl...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 shadow-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <button
                onClick={() => handleOpenAddMaster()}
                className="h-9 px-3 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Item Master</span>
              </button>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                Semua ({ingredients.length})
              </button>

              <button
                onClick={() => setCategoryFilter('bahan_makanan')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                  categoryFilter === 'bahan_makanan'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>🥩 Bahan Makanan</span>
                <span className="text-[10px] opacity-80">
                  ({ingredients.filter((i) => i.category === 'bahan_makanan').length})
                </span>
              </button>

              <button
                onClick={() => setCategoryFilter('suplai_takeaway')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                  categoryFilter === 'suplai_takeaway'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>🥡 Suplai Takeaway</span>
                <span className="text-[10px] opacity-80">
                  ({ingredients.filter((i) => i.category === 'suplai_takeaway').length})
                </span>
              </button>
            </div>
          </div>

          {/* Master Item Cards */}
          <div className="space-y-2.5">
            {filteredMasterItems.map((item) => {
              const totalValue = item.currentStock * item.unitPrice;
              const isLowStock = item.currentStock <= item.minStockAlert;
              const isTakeaway = item.category === 'suplai_takeaway';

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl bg-white border transition-all shadow-xs ${
                    isLowStock
                      ? 'border-rose-400 bg-rose-50/20'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isTakeaway
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isTakeaway ? 'Takeaway' : 'Bahan Makanan'}
                        </span>
                        <h3 className="text-xs font-black text-stone-900 truncate">
                          {item.name}
                        </h3>
                        {isLowStock && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-600 text-white shrink-0">
                            Stok Kritis!
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-stone-500 mt-1">
                        Harga Standar: <strong className="text-stone-800">{formatCurrency(item.unitPrice)}</strong> / {item.unit}
                        {item.note && <span className="ml-1 text-stone-400 italic">({item.note})</span>}
                      </div>
                    </div>

                    {/* Action Buttons: Edit, Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditMaster(item)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                        title="Edit Master"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {confirmDeleteId === item.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeleteMaster(item.id, item.name)}
                            className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold"
                          >
                            Hapus
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1.5 py-1 rounded-lg bg-stone-200 text-stone-700 text-[10px]"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Hapus Master"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Data Stats: Stok Sekarang, Min Alert, Nilai */}
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-stone-100 text-center">
                    <div className={`p-1.5 rounded-xl ${isLowStock ? 'bg-rose-100/70 border border-rose-300' : 'bg-amber-50/70 border border-amber-200/50'}`}>
                      <span className={`text-[9px] uppercase font-bold block ${isLowStock ? 'text-rose-700' : 'text-amber-800'}`}>
                        Sisa Stok
                      </span>
                      <span className={`text-xs font-black font-mono ${isLowStock ? 'text-rose-950 font-bold' : 'text-amber-950'}`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </div>

                    <div className="p-1.5 rounded-xl bg-stone-50">
                      <span className="text-[9px] uppercase font-bold text-stone-400 block">
                        Batas Alert
                      </span>
                      <span className="text-xs font-bold text-stone-700 font-mono">
                        &le; {item.minStockAlert} {item.unit}
                      </span>
                    </div>

                    <div className="p-1.5 rounded-xl bg-stone-50">
                      <span className="text-[9px] uppercase font-bold text-stone-400 block">
                        Nilai Stok
                      </span>
                      <span className="text-xs font-extrabold text-stone-900 font-mono truncate">
                        {formatCurrency(totalValue)}
                      </span>
                    </div>
                  </div>

                  {/* Quick Adjust Button & Restock Action */}
                  <div className="mt-2 flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleQuickRestockFromAlert(item)}
                      className="text-[11px] font-bold text-red-700 hover:text-red-800 flex items-center gap-1"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>+ Belanja Item Ini</span>
                    </button>

                    <button
                      onClick={() => {
                        setStockAdjustItem(item);
                        setAdjustType('tambah');
                        setAdjustAmount(5);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-bold flex items-center gap-1 active:scale-95 shadow-xs"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Sesuaikan Stok</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredMasterItems.length === 0 && (
              <div className="text-center py-10 text-stone-400 text-xs">
                Tidak ada data bahan atau kemasan ditemukan.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. TAB 3: REKAPAN & LAPORAN MODAL                    */}
      {/* ==================================================== */}
      {activeTab === 'rekap' && (
        <div className="space-y-3">
          {/* Rekapan Harian Card */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Rekapan Modal Hari Ini
                </span>
                <h3 className="text-sm font-black text-stone-900">
                  {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-extrabold text-[11px]">
                {todayPurchases.length} Transaksi Belanja
              </span>
            </div>

            <div className="text-2xl font-black text-red-700 font-mono tracking-tight">
              {formatCurrency(todayTotalExpense)}
            </div>

            {/* Separated: Bahan Makanan vs Kemasan Takeaway */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                  🥩 Belanja Bahan Makanan
                </span>
                <div className="text-sm font-black text-emerald-950 font-mono mt-0.5">
                  {formatCurrency(todayTotalFood)}
                </div>
                <span className="text-[10px] text-emerald-700 block mt-0.5">
                  {todayTotalExpense > 0 ? `${Math.round((todayTotalFood / todayTotalExpense) * 100)}% dari modal` : '0%'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                  🥡 Belanja Kemasan Takeaway
                </span>
                <div className="text-sm font-black text-amber-950 font-mono mt-0.5">
                  {formatCurrency(todayTotalTakeaway)}
                </div>
                <span className="text-[10px] text-amber-700 block mt-0.5">
                  {todayTotalExpense > 0 ? `${Math.round((todayTotalTakeaway / todayTotalExpense) * 100)}% dari modal` : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Rekapan 30 Hari Terakhir / Bulanan Card */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Rekapan Pengeluaran Modal 30 Hari Terakhir
                </span>
                <h3 className="text-sm font-black text-stone-900">
                  Total Belanja: {formatCurrency(monthlyTotalExpense)}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] text-stone-500 font-semibold block">Total Makanan:</span>
                <span className="font-extrabold text-stone-900 font-mono">{formatCurrency(monthlyTotalFood)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] text-stone-500 font-semibold block">Total Takeaway:</span>
                <span className="font-extrabold text-stone-900 font-mono">{formatCurrency(monthlyTotalTakeaway)}</span>
              </div>
            </div>

            {/* Top Ingredients / Supplies Breakdown */}
            <div className="pt-2 border-t border-stone-100">
              <h4 className="text-xs font-black text-stone-800 mb-2">
                Daftar Pengeluaran per Bahan (30 Hari):
              </h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {perIngredientStats.map((item, idx) => {
                  const percentage = monthlyTotalExpense > 0 ? (item.totalCost / monthlyTotalExpense) * 100 : 0;
                  return (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-stone-400">#{idx + 1}</span>
                          <span className="font-bold text-stone-800 truncate">{item.name}</span>
                          <span className={`text-[8px] font-bold px-1 rounded ${item.category === 'suplai_takeaway' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {item.category === 'suplai_takeaway' ? 'Kemasan' : 'Makanan'}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
                          Total beli: {item.totalQty.toFixed(1)} {item.unit} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <span className="font-black text-stone-900 font-mono text-xs">
                        {formatCurrency(item.totalCost)}
                      </span>
                    </div>
                  );
                })}

                {perIngredientStats.length === 0 && (
                  <div className="text-center py-4 text-stone-400 text-xs">
                    Belum ada riwayat belanja dalam 30 hari terakhir.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Riwayat Nota Belanja Harian */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <h4 className="text-xs font-black text-stone-800 flex items-center justify-between">
              <span>Riwayat Nota Belanja Terakhir ({purchases.length} Nota)</span>
              <span className="text-[10px] text-stone-400 font-normal">Ketuk untuk rincian</span>
            </h4>

            <div className="space-y-2">
              {purchases.map((pch) => (
                <div
                  key={pch.id}
                  onClick={() => setSelectedReceipt(pch)}
                  className="p-3 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-400 cursor-pointer transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-stone-900 block">
                        {pch.storeName || 'Pasar / Toko'}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {pch.date} &bull; {pch.items.length} jenis item
                      </span>
                    </div>
                    <span className="text-xs font-black text-red-700 font-mono">
                      {formatCurrency(pch.totalExpense)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-200/60">
                    <span>Makanan: <strong className="text-emerald-700">{formatCurrency(pch.totalFoodCost)}</strong></span>
                    <span>Takeaway: <strong className="text-amber-700">{formatCurrency(pch.totalTakeawayCost)}</strong></span>
                  </div>
                </div>
              ))}

              {purchases.length === 0 && (
                <div className="text-center py-6 text-stone-400 text-xs">
                  Belum ada nota belanja tersimpan.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. MODAL: TAMBAH / EDIT ITEM MASTER                  */}
      {/* ==================================================== */}
      {isMasterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsMasterModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-stone-900 text-stone-100 rounded-3xl p-4 shadow-2xl border border-stone-800 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-sm font-bold text-white">
                {editingIngredient ? 'Edit Master Bahan & Takeaway' : 'Tambah Master Baru'}
              </h3>
              <button onClick={() => setIsMasterModalOpen(false)} className="p-1 rounded-full text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMasterForm} className="space-y-3 pt-3 text-xs">
              {/* Category Selector */}
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Kategori Master:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormCategory('bahan_makanan');
                      if (!editingIngredient) {
                        setFormUnit('kg');
                        setFormMinAlert(3);
                      }
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      formCategory === 'bahan_makanan'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    <span>🥩 Bahan Makanan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormCategory('suplai_takeaway');
                      if (!editingIngredient) {
                        setFormUnit('pcs');
                        setFormMinAlert(50);
                      }
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      formCategory === 'suplai_takeaway'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    <span>🥡 Suplai Takeaway</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Nama Item:</label>
                <input
                  type="text"
                  required
                  placeholder={formCategory === 'suplai_takeaway' ? 'Contoh: Paper Bowl 650ml' : 'Contoh: Daging Sapi Sandung Lamur'}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Satuan Standar:</label>
                  <select
                    value={formUnit}
                    onChange={(e: any) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="gr">gr (Gram)</option>
                    <option value="pcs">pcs (Buah/Biji)</option>
                    <option value="pack">pack (Bungkus)</option>
                    <option value="dus">dus (Karton)</option>
                    <option value="lembar">lembar (Stiker/Kertas)</option>
                    <option value="liter">liter</option>
                    <option value="ikat">ikat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Harga Beli Standar (Rp):</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formUnitPrice}
                    onChange={(e) => setFormUnitPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Sisa Stok Sekarang:</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min={0}
                    value={formCurrentStock}
                    onChange={(e) => setFormCurrentStock(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Batas Peringatan Stok Menipis:
                  </label>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={formMinAlert}
                    onChange={(e) => setFormMinAlert(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Keterangan Tambahan (Opsional):</label>
                <input
                  type="text"
                  placeholder="Misal: Kemasan anti bocor, supplier toko sebelah"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsMasterModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 text-white font-bold shadow-md"
                >
                  Simpan Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 7. MODAL: DETAIL NOTA BELANJA                        */}
      {/* ==================================================== */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedReceipt(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-4 shadow-2xl border border-stone-200 z-10 animate-in zoom-in-95 duration-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Detail Nota Belanja</span>
                <h3 className="text-sm font-black text-stone-900">{selectedReceipt.storeName}</h3>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="p-1 rounded-full text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-stone-600 space-y-1">
              <div className="flex justify-between">
                <span>Tanggal Belanja:</span>
                <strong className="text-stone-900">{selectedReceipt.date}</strong>
              </div>
              {selectedReceipt.notes && (
                <div className="flex justify-between">
                  <span>Catatan:</span>
                  <span className="italic text-stone-700">{selectedReceipt.notes}</span>
                </div>
              )}
            </div>

            {/* List items */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pt-2 border-t border-stone-100 pr-1">
              {selectedReceipt.items.map((it) => (
                <div key={it.id} className="p-2 rounded-xl bg-stone-50 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-stone-900 block">{it.name}</span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {it.qty} {it.unit} &times; {formatCurrency(it.unitPrice)}
                    </span>
                  </div>
                  <span className="font-black text-stone-900 font-mono">
                    {formatCurrency(it.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total summary */}
            <div className="pt-2 border-t border-stone-200 space-y-1 text-xs">
              <div className="flex justify-between text-emerald-800">
                <span>Total Makanan:</span>
                <strong className="font-mono">{formatCurrency(selectedReceipt.totalFoodCost)}</strong>
              </div>
              <div className="flex justify-between text-amber-800">
                <span>Total Takeaway:</span>
                <strong className="font-mono">{formatCurrency(selectedReceipt.totalTakeawayCost)}</strong>
              </div>
              <div className="flex justify-between text-base font-black text-stone-900 pt-1 border-t border-stone-200">
                <span>Grand Total:</span>
                <span className="font-mono text-red-700">{formatCurrency(selectedReceipt.totalExpense)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 8. MODAL: QUICK ADJUST STOCK                         */}
      {/* ==================================================== */}
      {stockAdjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setStockAdjustItem(null)} />
          <div className="relative w-full max-w-sm bg-stone-900 text-stone-100 rounded-3xl p-4 shadow-2xl border border-stone-800 z-10 animate-in zoom-in-95 duration-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h3 className="text-sm font-bold text-white">Sesuaikan Stok: {stockAdjustItem.name}</h3>
              <button onClick={() => setStockAdjustItem(null)} className="p-1 text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-300 p-2.5 bg-stone-800/80 rounded-xl">
              <span>Stok Saat Ini:</span>
              <span className="font-black text-amber-400 text-sm font-mono">
                {stockAdjustItem.currentStock} {stockAdjustItem.unit}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('tambah')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 ${
                  adjustType === 'tambah'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>+ Masuk (Restock)</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustType('kurang')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 ${
                  adjustType === 'kurang'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>- Terpakai (Masak/Pakai)</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Jumlah ({stockAdjustItem.unit}):
              </label>
              <input
                type="number"
                step="any"
                min={0}
                value={adjustAmount || ''}
                onChange={(e) => setAdjustAmount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono text-base font-bold focus:outline-hidden focus:border-amber-500"
                placeholder="0"
              />
            </div>

            <div className="p-2.5 bg-stone-950 rounded-xl text-xs flex justify-between items-center text-stone-300">
              <span>Stok Akhir Nanti:</span>
              <span className="font-black text-white font-mono">
                {Math.max(
                  0,
                  adjustType === 'tambah'
                    ? stockAdjustItem.currentStock + adjustAmount
                    : stockAdjustItem.currentStock - adjustAmount
                ).toFixed(2)}{' '}
                {stockAdjustItem.unit}
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStockAdjustItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveStockAdjust}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 text-white font-bold text-xs shadow-md"
              >
                Konfirmasi Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
