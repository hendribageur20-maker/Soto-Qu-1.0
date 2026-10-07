import { TableItem, MenuItem, Order, Ingredient, RestaurantProfile, PrinterConfig, PurchaseTransaction, PurchaseItem } from '../types';

import sotoAyamImg from '../assets/images/soto_ayam_lamongan_1791387486880.jpg';
import sotoDagingImg from '../assets/images/soto_daging_madura_1791387506300.jpg';
import sotoBetawiImg from '../assets/images/soto_betawi_santan_1791387521642.jpg';
import perkedelSateImg from '../assets/images/perkedel_sate_soto_1791387536681.jpg';
import esTehImg from '../assets/images/es_teh_manis_1790260616776.jpg';
import esJerukImg from '../assets/images/es_jeruk_peras_1790260629539.jpg';

const STORAGE_KEYS = {
  TABLES: 'sotoqu_tables_v1',
  MENU: 'sotoqu_menu_v1',
  ACTIVE_ORDERS: 'sotoqu_active_orders_v1',
  HISTORY_TRANSACTIONS: 'sotoqu_history_v1',
  INGREDIENTS: 'sotoqu_ingredients_v1',
  PURCHASES: 'sotoqu_purchases_v1',
  PROFILE: 'sotoqu_profile_v1',
  PRINTER: 'sotoqu_printer_v1',
};

export const DEFAULT_PROFILE: RestaurantProfile = {
  name: 'Soto Qu 1.0',
  slogan: 'Spesialis Soto Ayam Khas Lamongan & Soto Daging Sapi Pilihan',
  address: 'Jl. Malioboro No. 45, Kota Yogyakarta',
  phone: '0812-3456-7890',
  receiptHeader: 'Selamat Menikmati Kelezatan Soto Qu!',
  receiptFooter: 'Terima kasih atas kunjungan Anda. Kritik & Saran WA: 0812-3456-7890',
  currency: 'Rp',
};

export const DEFAULT_PRINTER: PrinterConfig = {
  paperSize: '58mm',
  autoPrintKitchen: true,
  autoPrintReceipt: true,
  connectedDeviceName: 'POS-58-BT (Thermal)',
  isSimulator: true,
};

export const DEFAULT_TABLES: TableItem[] = [
  { id: 'tbl-1', name: 'Meja 1', number: 1, status: 'kosong', positionIndex: 0, x: 6, y: 12, shape: 'kotak', seats: 4 },
  { id: 'tbl-2', name: 'Meja 2', number: 2, status: 'kosong', positionIndex: 1, x: 54, y: 12, shape: 'kotak', seats: 4 },
  { id: 'tbl-3', name: 'Meja 3', number: 3, status: 'kosong', positionIndex: 2, x: 6, y: 52, shape: 'bulat', seats: 2 },
  { id: 'tbl-4', name: 'Meja 4', number: 4, status: 'kosong', positionIndex: 3, x: 54, y: 52, shape: 'panjang', seats: 6 },
];

export const DEFAULT_MENU: MenuItem[] = [
  {
    id: 'menu-1',
    name: 'Soto Ayam Lamongan Koya',
    category: 'bakso_kuah',
    price: 22000,
    description: 'Kuah kuning rempah kunyit harum, suwiran ayam kampung, telur rebus, bihun, kol, ditaburi koya gurih renyah.',
    imageUrl: sotoAyamImg,
    isAvailable: true,
  },
  {
    id: 'menu-2',
    name: 'Soto Daging Sapi Madura',
    category: 'bakso_kuah',
    price: 28000,
    description: 'Potongan daging sapi empuk dengan kuah kaldu rempah bening gurih kaya rasa, bawang goreng & emping.',
    imageUrl: sotoDagingImg,
    isAvailable: true,
  },
  {
    id: 'menu-3',
    name: 'Soto Betawi Santan Gurih',
    category: 'bakso_kuah',
    price: 32000,
    description: 'Daging sapi berpadu kuah santan susu harum rempah, kentang goreng, tomat segar, dan emping melinjo renyah.',
    imageUrl: sotoBetawiImg,
    isAvailable: true,
  },
  {
    id: 'menu-4',
    name: 'Perkedel Kentang & Sate Telur',
    category: 'pelengkap',
    price: 8000,
    description: 'Perkedel kentang lembut renyah dan sate telur puyuh bumbu kecap manis gurih.',
    imageUrl: perkedelSateImg,
    isAvailable: true,
  },
  {
    id: 'menu-5',
    name: 'Kerupuk Emping Melinjo',
    category: 'pelengkap',
    price: 5000,
    description: 'Emping melinjo asli goreng garing renyah cocok dinikmati bersama kuah soto.',
    imageUrl: perkedelSateImg,
    isAvailable: true,
  },
  {
    id: 'menu-6',
    name: 'Es Teh Manis Melati',
    category: 'minuman',
    price: 5000,
    description: 'Teh melati seduh harum khas Solo dengan gula asli dan es batu kristal segar.',
    imageUrl: esTehImg,
    isAvailable: true,
  },
  {
    id: 'menu-7',
    name: 'Es Jeruk Peras Murni',
    category: 'minuman',
    price: 8000,
    description: 'Jeruk peras manis segar kaya vitamin C, disajikan dingin menyegarkan tenggorokan.',
    imageUrl: esJerukImg,
    isAvailable: true,
  },
  {
    id: 'menu-8',
    name: 'Paket Soto Ayam + Nasi + Es Teh',
    category: 'paket',
    price: 27000,
    description: '1 Porsi Soto Ayam Lamongan Koya + 1 Piring Nasi Pulen + 1 Gelas Es Teh Manis Segar.',
    imageUrl: sotoAyamImg,
    isAvailable: true,
  },
];

export const DEFAULT_INGREDIENTS: Ingredient[] = [
  // 1. Bahan Makanan
  {
    id: 'ing-1',
    name: 'Daging Ayam Kampung Segar',
    category: 'bahan_makanan',
    initialQty: 25,
    unit: 'kg',
    unitPrice: 42000,
    currentStock: 18.5,
    minStockAlert: 5,
    updatedAt: new Date().toISOString(),
    note: 'Suwiran daging soto ayam',
  },
  {
    id: 'ing-2',
    name: 'Daging Sapi Sandung Lamur',
    category: 'bahan_makanan',
    initialQty: 15,
    unit: 'kg',
    unitPrice: 125000,
    currentStock: 9.2,
    minStockAlert: 3,
    updatedAt: new Date().toISOString(),
    note: 'Bahan soto daging sapi khas Madura',
  },
  {
    id: 'ing-3',
    name: 'Bumbu Kuning Rempah Soto',
    category: 'bahan_makanan',
    initialQty: 12,
    unit: 'kg',
    unitPrice: 35000,
    currentStock: 8,
    minStockAlert: 3,
    updatedAt: new Date().toISOString(),
    note: 'Kunyit, jahe, lengkuas, sereh & kemiri',
  },
  {
    id: 'ing-4',
    name: 'Koya Bawang & Kerupuk Udang',
    category: 'bahan_makanan',
    initialQty: 10,
    unit: 'kg',
    unitPrice: 40000,
    currentStock: 6.5,
    minStockAlert: 2,
    updatedAt: new Date().toISOString(),
    note: 'Taburan wajib soto khas Lamongan',
  },
  {
    id: 'ing-5',
    name: 'Bihun & Kol Iris Segar',
    category: 'bahan_makanan',
    initialQty: 30,
    unit: 'pack',
    unitPrice: 7000,
    currentStock: 22,
    minStockAlert: 8,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-6',
    name: 'Jeruk Nipis Segar',
    category: 'bahan_makanan',
    initialQty: 12,
    unit: 'kg',
    unitPrice: 20000,
    currentStock: 7.5,
    minStockAlert: 3,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-7',
    name: 'Beras Pulen Super (Nasi)',
    category: 'bahan_makanan',
    initialQty: 50,
    unit: 'kg',
    unitPrice: 14500,
    currentStock: 38,
    minStockAlert: 10,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ing-8',
    name: 'Gula Pasir & Teh Melati',
    category: 'bahan_makanan',
    initialQty: 25,
    unit: 'kg',
    unitPrice: 17500,
    currentStock: 19,
    minStockAlert: 5,
    updatedAt: new Date().toISOString(),
  },
  // 2. Suplai Takeaway / Kemasan
  {
    id: 'ing-tk-1',
    name: 'Paper Bowl Soto 650ml + Tutup',
    category: 'suplai_takeaway',
    initialQty: 150,
    unit: 'pcs',
    unitPrice: 1250,
    currentStock: 35, // Menipis (< minStockAlert: 60)
    minStockAlert: 60,
    updatedAt: new Date().toISOString(),
    note: 'Mangkok tebal tahan panas anti bocor',
  },
  {
    id: 'ing-tk-2',
    name: 'Sendok Bebek Plastik Higienis',
    category: 'suplai_takeaway',
    initialQty: 250,
    unit: 'pcs',
    unitPrice: 250,
    currentStock: 40, // Menipis (< minStockAlert: 50)
    minStockAlert: 50,
    updatedAt: new Date().toISOString(),
    note: 'Sendok kuah bungkus soto',
  },
  {
    id: 'ing-tk-3',
    name: 'Kantong Kresek Sablon Soto Qu',
    category: 'suplai_takeaway',
    initialQty: 20,
    unit: 'pack',
    unitPrice: 8500,
    currentStock: 14,
    minStockAlert: 5,
    updatedAt: new Date().toISOString(),
    note: 'Ukuran sedang muat 2-3 porsi',
  },
  {
    id: 'ing-tk-4',
    name: 'Plastik Kuah Anti Panas 1/2 Kg',
    category: 'suplai_takeaway',
    initialQty: 25,
    unit: 'pack',
    unitPrice: 9000,
    currentStock: 16,
    minStockAlert: 6,
    updatedAt: new Date().toISOString(),
    note: 'Plastik tebal pembungkus kuah panas',
  },
  {
    id: 'ing-tk-5',
    name: 'Stiker Segel Logo Soto Qu',
    category: 'suplai_takeaway',
    initialQty: 300,
    unit: 'lembar',
    unitPrice: 300,
    currentStock: 50, // Menipis (< minStockAlert: 100)
    minStockAlert: 100,
    updatedAt: new Date().toISOString(),
    note: 'Segel tutup paper bowl takeaway',
  },
];

// Seed realistic initial purchases for Modal & Belanja
export const createSamplePurchases = (): PurchaseTransaction[] => {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoStr = threeDaysAgo.toISOString().slice(0, 10);

  return [
    {
      id: 'pch-1',
      date: todayStr,
      storeName: 'Pasar Kranggan & Toko Plastik Berkah',
      items: [
        {
          id: 'pchi-1',
          ingredientId: 'ing-1',
          name: 'Daging Ayam Kampung Segar',
          category: 'bahan_makanan',
          qty: 10,
          unit: 'kg',
          unitPrice: 42000,
          totalPrice: 420000,
        },
        {
          id: 'pchi-2',
          ingredientId: 'ing-3',
          name: 'Bumbu Kuning Rempah Soto',
          category: 'bahan_makanan',
          qty: 5,
          unit: 'kg',
          unitPrice: 35000,
          totalPrice: 175000,
        },
        {
          id: 'pchi-3',
          ingredientId: 'ing-tk-1',
          name: 'Paper Bowl Soto 650ml + Tutup',
          category: 'suplai_takeaway',
          qty: 150,
          unit: 'pcs',
          unitPrice: 1250,
          totalPrice: 187500,
        },
        {
          id: 'pchi-4',
          ingredientId: 'ing-tk-2',
          name: 'Sendok Bebek Plastik Higienis',
          category: 'suplai_takeaway',
          qty: 100,
          unit: 'pcs',
          unitPrice: 250,
          totalPrice: 25000,
        },
      ],
      totalFoodCost: 595000,
      totalTakeawayCost: 212500,
      totalExpense: 807500,
      notes: 'Belanja stok pagi hari untuk operasional',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pch-2',
      date: yesterdayStr,
      storeName: 'Supplier Daging Sapi & Beras Makmur',
      items: [
        {
          id: 'pchi-5',
          ingredientId: 'ing-2',
          name: 'Daging Sapi Sandung Lamur',
          category: 'bahan_makanan',
          qty: 8,
          unit: 'kg',
          unitPrice: 125000,
          totalPrice: 1000000,
        },
        {
          id: 'pchi-6',
          ingredientId: 'ing-7',
          name: 'Beras Pulen Super (Nasi)',
          category: 'bahan_makanan',
          qty: 25,
          unit: 'kg',
          unitPrice: 14500,
          totalPrice: 362500,
        },
        {
          id: 'pchi-7',
          ingredientId: 'ing-tk-4',
          name: 'Plastik Kuah Anti Panas 1/2 Kg',
          category: 'suplai_takeaway',
          qty: 10,
          unit: 'pack',
          unitPrice: 9000,
          totalPrice: 90000,
        },
      ],
      totalFoodCost: 1362500,
      totalTakeawayCost: 90000,
      totalExpense: 1452500,
      notes: 'Restock bahan daging dan beras mingguan',
      createdAt: yesterday.toISOString(),
    },
    {
      id: 'pch-3',
      date: threeDaysAgoStr,
      storeName: 'Percetakan & Pasar Sayur',
      items: [
        {
          id: 'pchi-8',
          ingredientId: 'ing-5',
          name: 'Bihun & Kol Iris Segar',
          category: 'bahan_makanan',
          qty: 15,
          unit: 'pack',
          unitPrice: 7000,
          totalPrice: 105000,
        },
        {
          id: 'pchi-9',
          ingredientId: 'ing-6',
          name: 'Jeruk Nipis Segar',
          category: 'bahan_makanan',
          qty: 8,
          unit: 'kg',
          unitPrice: 20000,
          totalPrice: 160000,
        },
        {
          id: 'pchi-10',
          ingredientId: 'ing-tk-5',
          name: 'Stiker Segel Logo Soto Qu',
          category: 'suplai_takeaway',
          qty: 250,
          unit: 'lembar',
          unitPrice: 300,
          totalPrice: 75000,
        },
      ],
      totalFoodCost: 265000,
      totalTakeawayCost: 75000,
      totalExpense: 340000,
      notes: 'Belanja sayur segar dan cetak stiker logo',
      createdAt: threeDaysAgo.toISOString(),
    },
  ];
};

// Seed realistic initial transactions for Omset & Laporan
const createSampleHistory = (): Order[] => {
  const now = new Date();
  const sampleData: Order[] = [];

  const timeOffsets = [
    { hours: 1, amount: 64000, method: 'tunai' as const, type: 'meja' as const, table: 'Meja 2' },
    { hours: 2, amount: 82000, method: 'qris' as const, type: 'meja' as const, table: 'Meja 1' },
    { hours: 3.5, amount: 33000, method: 'tunai' as const, type: 'bungkus' as const, table: undefined },
    { hours: 4.5, amount: 110000, method: 'qris' as const, type: 'meja' as const, table: 'Meja 4' },
    { hours: 5.5, amount: 55000, method: 'tunai' as const, type: 'bungkus' as const, table: undefined },
    { hours: 6.5, amount: 77000, method: 'tunai' as const, type: 'meja' as const, table: 'Meja 3' },
    // Yesterday samples
    { days: 1, hours: 2, amount: 95000, method: 'qris' as const, type: 'meja' as const, table: 'Meja 1' },
    { days: 1, hours: 4, amount: 62000, method: 'tunai' as const, type: 'bungkus' as const, table: undefined },
    { days: 1, hours: 6, amount: 135000, method: 'tunai' as const, type: 'meja' as const, table: 'Meja 2' },
    // 2 days ago
    { days: 2, hours: 3, amount: 89000, method: 'qris' as const, type: 'meja' as const, table: 'Meja 3' },
    { days: 2, hours: 5, amount: 48000, method: 'tunai' as const, type: 'bungkus' as const, table: undefined },
    // 3 days ago
    { days: 3, hours: 4, amount: 120000, method: 'tunai' as const, type: 'meja' as const, table: 'Meja 4' },
    { days: 4, hours: 5, amount: 75000, method: 'qris' as const, type: 'meja' as const, table: 'Meja 1' },
    { days: 5, hours: 6, amount: 104000, method: 'tunai' as const, type: 'meja' as const, table: 'Meja 2' },
  ];

  sampleData.push(
    ...timeOffsets.map((s, idx) => {
      const d = new Date(now);
      if (s.days) d.setDate(d.getDate() - s.days);
      d.setHours(d.getHours() - s.hours);

      const items: Order['items'] = [
        { menuId: 'menu-1', name: 'Bakso Urat Jumbo', price: 25000, quantity: 2 },
        { menuId: 'menu-6', name: 'Es Teh Manis Melati', price: 5000, quantity: 2 },
      ];

      return {
        id: `ord-hist-${idx + 1}`,
        receiptNumber: `BQ-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(100 + idx)}`,
        type: s.type,
        tableName: s.table,
        customerName: s.type === 'meja' ? `Tamu ${s.table}` : `Pelanggan #${10 + idx}`,
        items,
        subtotal: s.amount,
        discount: 0,
        tax: 0,
        total: s.amount,
        status: 'paid' as const,
        createdAt: d.toISOString(),
        paidAt: d.toISOString(),
        paymentMethod: s.method,
        cashAmount: s.method === 'tunai' ? (s.amount <= 50000 ? 50000 : 100000) : s.amount,
        changeAmount: s.method === 'tunai' ? ((s.amount <= 50000 ? 50000 : 100000) - s.amount) : 0,
      };
    })
  );

  return sampleData;
};

export const StorageService = {
  getTables(): TableItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TABLES);
    if (!raw) {
      this.saveTables(DEFAULT_TABLES);
      return DEFAULT_TABLES;
    }
    try {
      const parsed: TableItem[] = JSON.parse(raw);
      const normalized = parsed.map((t, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        return {
          ...t,
          x: typeof t.x === 'number' ? t.x : (col === 0 ? 6 : 54),
          y: typeof t.y === 'number' ? t.y : (12 + row * 40),
          shape: t.shape || 'kotak',
          seats: t.seats || 4,
        };
      });
      return normalized;
    } catch {
      return DEFAULT_TABLES;
    }
  },

  saveTables(tables: TableItem[]): void {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  },

  getMenu(): MenuItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU);
    if (!raw) {
      this.saveMenu(DEFAULT_MENU);
      return DEFAULT_MENU;
    }
    try {
      const parsed: MenuItem[] = JSON.parse(raw);
      if (parsed.length > 0 && parsed[0].name.toLowerCase().includes('bakso')) {
        this.saveMenu(DEFAULT_MENU);
        return DEFAULT_MENU;
      }
      return parsed;
    } catch {
      return DEFAULT_MENU;
    }
  },

  saveMenu(menu: MenuItem[]): void {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
  },

  getActiveOrders(): Record<string, Order> {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_ORDERS);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  },

  saveActiveOrders(orders: Record<string, Order>): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ORDERS, JSON.stringify(orders));
  },

  getHistory(): Order[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY_TRANSACTIONS);
    if (!raw) {
      const seeded = createSampleHistory();
      this.saveHistory(seeded);
      return seeded;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveHistory(history: Order[]): void {
    localStorage.setItem(STORAGE_KEYS.HISTORY_TRANSACTIONS, JSON.stringify(history));
  },

  addTransaction(order: Order): void {
    const history = this.getHistory();
    history.unshift(order);
    this.saveHistory(history);
  },

  getIngredients(): Ingredient[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
    if (!raw) {
      this.saveIngredients(DEFAULT_INGREDIENTS);
      return DEFAULT_INGREDIENTS;
    }
    try {
      const parsed: Ingredient[] = JSON.parse(raw);
      // Migration: ensure category is set, and if no takeaway items exist, merge DEFAULT_INGREDIENTS takeaway supplies
      const hasTakeaway = parsed.some((item) => item.category === 'suplai_takeaway');
      const normalized = parsed.map((item) => {
        if (item.category) return item;
        const isTk = item.name.toLowerCase().includes('bowl') ||
          item.name.toLowerCase().includes('tutup') ||
          item.name.toLowerCase().includes('sendok') ||
          item.name.toLowerCase().includes('plastik') ||
          item.name.toLowerCase().includes('kresek') ||
          item.name.toLowerCase().includes('stiker');
        return {
          ...item,
          category: (isTk ? 'suplai_takeaway' : 'bahan_makanan') as Ingredient['category'],
        };
      });

      if (!hasTakeaway) {
        const defaultTakeawayItems = DEFAULT_INGREDIENTS.filter((item) => item.category === 'suplai_takeaway');
        const merged = [...normalized, ...defaultTakeawayItems];
        this.saveIngredients(merged);
        return merged;
      }

      return normalized;
    } catch {
      return DEFAULT_INGREDIENTS;
    }
  },

  saveIngredients(items: Ingredient[]): void {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(items));
  },

  getPurchases(): PurchaseTransaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    if (!raw) {
      const seeded = createSamplePurchases();
      this.savePurchases(seeded);
      return seeded;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  savePurchases(purchases: PurchaseTransaction[]): void {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  },

  addPurchase(purchase: PurchaseTransaction): void {
    const list = this.getPurchases();
    list.unshift(purchase);
    this.savePurchases(list);
  },

  getProfile(): RestaurantProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      this.saveProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    try {
      const parsed: RestaurantProfile = JSON.parse(raw);
      if (parsed.name && parsed.name.toLowerCase().includes('bakso')) {
        this.saveProfile(DEFAULT_PROFILE);
        return DEFAULT_PROFILE;
      }
      return parsed;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: RestaurantProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getPrinterConfig(): PrinterConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.PRINTER);
    if (!raw) {
      this.savePrinterConfig(DEFAULT_PRINTER);
      return DEFAULT_PRINTER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PRINTER;
    }
  },

  savePrinterConfig(cfg: PrinterConfig): void {
    localStorage.setItem(STORAGE_KEYS.PRINTER, JSON.stringify(cfg));
  },
};
