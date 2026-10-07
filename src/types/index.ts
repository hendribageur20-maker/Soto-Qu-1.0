export type TableStatus = 'kosong' | 'terisi' | 'menunggu_bayar';

export interface TableItem {
  id: string;
  name: string;
  number: number;
  status: TableStatus;
  orderId?: string;
  customerName?: string;
  pax?: number;
  totalAmount?: number;
  itemsCount?: number;
  openedAt?: string;
  positionIndex: number;
  // Floor Plan Coordinates & Attributes
  x?: number; // Position in % (0 - 100) or px
  y?: number; // Position in % (0 - 100) or px
  shape?: 'kotak' | 'bulat' | 'panjang';
  seats?: number;
}

export type MenuCategory = 'bakso_kuah' | 'pelengkap' | 'minuman' | 'paket';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
}

export interface OrderItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export type OrderType = 'meja' | 'bungkus';

export type PaymentMethod = 'tunai' | 'qris';

export interface Order {
  id: string;
  receiptNumber: string;
  type: OrderType;
  tableId?: string;
  tableName?: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'draft' | 'saved' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  cashAmount?: number;
  changeAmount?: number;
}

export type IngredientCategory = 'bahan_makanan' | 'suplai_takeaway';
export type IngredientUnit = 'kg' | 'gr' | 'pcs' | 'liter' | 'ikat' | 'pack' | 'dus' | 'lembar';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  initialQty: number;
  unit: IngredientUnit;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  updatedAt: string;
  note?: string;
}

export interface PurchaseItem {
  id: string;
  ingredientId: string;
  name: string;
  category: IngredientCategory;
  qty: number;
  unit: IngredientUnit;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseTransaction {
  id: string;
  date: string;
  storeName?: string;
  items: PurchaseItem[];
  totalFoodCost: number;
  totalTakeawayCost: number;
  totalExpense: number;
  notes?: string;
  createdAt: string;
}

export interface RestaurantProfile {
  name: string;
  slogan: string;
  address: string;
  phone: string;
  receiptHeader: string;
  receiptFooter: string;
  currency: string;
}

export interface PrinterConfig {
  paperSize: '58mm' | '80mm';
  autoPrintKitchen: boolean;
  autoPrintReceipt: boolean;
  connectedDeviceName?: string;
  isSimulator: boolean;
}
