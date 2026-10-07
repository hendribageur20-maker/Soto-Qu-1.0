import React, { useState, useRef } from 'react';
import {
  UtensilsCrossed,
  Boxes,
  TrendingUp,
  FileText,
  Settings,
  Printer,
  X,
  ChevronRight,
  Store,
  Plus,
  Utensils,
  Camera,
  Upload,
  Check,
  RotateCcw,
  Lock,
  Unlock,
  Move
} from 'lucide-react';
import { RestaurantProfile, PrinterConfig, MenuItem, MenuCategory } from '../types';

import sotoAyamImg from '../assets/images/soto_ayam_lamongan_1791387486880.jpg';
import sotoDagingImg from '../assets/images/soto_daging_madura_1791387506300.jpg';
import sotoBetawiImg from '../assets/images/soto_betawi_santan_1791387521642.jpg';
import perkedelSateImg from '../assets/images/perkedel_sate_soto_1791387536681.jpg';
import esTehImg from '../assets/images/es_teh_manis_1790260616776.jpg';
import esJerukImg from '../assets/images/es_jeruk_peras_1790260629539.jpg';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  profile: RestaurantProfile;
  printerConfig: PrinterConfig;
  occupiedTablesCount: number;
  menuList: MenuItem[];
  onAddMenu: (newItem: MenuItem) => void;
  isTableLocked?: boolean;
  onToggleTableLock?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  profile,
  printerConfig,
  occupiedTablesCount,
  menuList,
  onAddMenu,
  isTableLocked = true,
  onToggleTableLock,
}) => {
  const [isFormCardOpen, setIsFormCardOpen] = useState(false);

  // Form Card States
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MenuCategory>('bakso_kuah');
  const [price, setPrice] = useState<number>(22000);
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>(sotoAyamImg);
  const [isCustomPhoto, setIsCustomPhoto] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const menuItems = [
    {
      id: 'kasir',
      label: '1. Kasir & Denah Meja',
      icon: UtensilsCrossed,
      badge: occupiedTablesCount > 0 ? `${occupiedTablesCount} Meja Aktif` : undefined,
    },
    { id: 'bahan', label: '2. Modal & Stok Takeaway', icon: Boxes, badge: 'Belanja' },
    { id: 'omset', label: '3. Omset (Pendapatan)', icon: TrendingUp, badge: 'Grafik' },
    { id: 'laporan', label: '4. Laporan & Rekap Modal', icon: FileText, badge: 'PDF/XLS' },
    { id: 'setting', label: '5. Setting Aplikasi', icon: Settings, badge: undefined },
  ];

  const photoPresets = [
    { label: 'Soto Ayam', img: sotoAyamImg },
    { label: 'Soto Daging', img: sotoDagingImg },
    { label: 'Soto Betawi', img: sotoBetawiImg },
    { label: 'Perkedel/Sate', img: perkedelSateImg },
    { label: 'Es Teh', img: esTehImg },
    { label: 'Es Jeruk', img: esJerukImg },
  ];

  // Handle Photo Capture from Phone Camera or Gallery File
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setSelectedImage(base64);
        setIsCustomPhoto(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMenuForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: MenuItem = {
      id: `menu-${Date.now()}`,
      name: name.trim(),
      category,
      price: Number(price) || 0,
      description: description.trim() || 'Menu soto lezat khas Soto Qu 1.0.',
      imageUrl: selectedImage,
      isAvailable: true,
    };

    onAddMenu(newItem);

    // Reset Form
    setName('');
    setDescription('');
    setPrice(22000);
    setIsCustomPhoto(false);
    setSelectedImage(sotoAyamImg);
    setIsFormCardOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => {
          setIsFormCardOpen(false);
          onClose();
        }}
      />

      {/* Drawer Container */}
      <div className="relative w-[85%] max-w-[330px] h-full bg-stone-900 text-stone-100 flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-250 ease-out border-r border-stone-800 overflow-hidden">
        {/* Header Branding Soto Qu 1.0 */}
        <div className="p-4 bg-gradient-to-br from-red-900 via-red-950 to-stone-900 border-b border-red-800/40 relative shrink-0">
          <button
            onClick={() => {
              setIsFormCardOpen(false);
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-300 hover:text-white bg-black/20 hover:bg-black/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xl shadow-lg mb-2 ring-2 ring-amber-400/30">
            SQ
          </div>
          <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
            Soto Qu 1.0
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              v1.0
            </span>
          </h2>
          <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5">{profile.slogan || 'Spesialis Soto Ayam Khas Lamongan & Soto Daging'}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-stone-300">
            <Store className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{profile.address}</span>
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto py-2.5 px-3 space-y-3">
          {/* Navigasi Utama */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Menu Utama
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-red-800/90 text-white shadow-md border border-red-700/50'
                      : 'text-stone-300 hover:bg-stone-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-amber-400 text-stone-950' : 'bg-stone-800 text-stone-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-xs">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                        isActive
                          ? 'bg-red-950 text-amber-300'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* KONTROL MODE TATA LETAK MEJA DI SIDEBAR */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-stone-850 to-stone-900 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isTableLocked
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                      : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                  }`}
                >
                  {isTableLocked ? (
                    <Lock className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Move className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Tata Letak Meja</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        isTableLocked
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-700 animate-pulse'
                      }`}
                    >
                      {isTableLocked ? 'Terkunci' : 'Mode Edit'}
                    </span>
                  </h4>
                  <p className="text-[10px] text-stone-400">
                    {isTableLocked
                      ? 'Meja aman dari geseran tidak sengaja'
                      : 'Meja bebas digeser & dipindah'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onToggleTableLock?.();
                if (activeTab !== 'kasir') {
                  onSelectTab('kasir');
                }
                onClose();
              }}
              className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${
                isTableLocked
                  ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black shadow-amber-950/40'
              }`}
            >
              {isTableLocked ? (
                <>
                  <Move className="w-3.5 h-3.5 text-amber-400" />
                  <span>Buka Kunci (Edit Denah)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-stone-950" />
                  <span>Kunci Posisi Meja</span>
                </>
              )}
            </button>
          </div>

          {/* CARD KECIL: (+) MENU BARU (DENGAN KAMERA & PRESET SOTO) */}
          <div className="pt-1">
            <div className="px-2 pb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-400">
              <span>Katalog Soto Qu</span>
              <span className="text-amber-400 font-mono font-semibold">{menuList.length} menu</span>
            </div>

            <div className="p-3 rounded-2xl bg-gradient-to-br from-stone-850 to-stone-900 border border-amber-500/30 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Menu Soto Qu</h4>
                    <p className="text-[10px] text-stone-400">Foto langsung / pilih contoh</p>
                  </div>
                </div>
              </div>

              {/* Tombol Card Kecil: (+) Menu Baru */}
              <button
                type="button"
                onClick={() => setIsFormCardOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-950/40 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>(+) Menu Baru</span>
              </button>
            </div>
          </div>

          {/* Quick Printer Status Card */}
          <div className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-200">
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Thermal Bluetooth</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                {printerConfig.paperSize}
              </span>
            </div>
            <div className="text-[10px] text-stone-400 truncate">
              {printerConfig.connectedDeviceName || 'Siap Terkoneksi'}
            </div>
            <button
              onClick={() => {
                onSelectTab('setting');
                onClose();
              }}
              className="w-full py-1 px-2 bg-stone-700/80 hover:bg-stone-700 text-stone-300 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <span>Atur Printer & Profil</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-2.5 text-center border-t border-stone-800 text-[10px] text-stone-500 shrink-0">
          Soto Qu 1.0 · POS Restoran
        </div>
      </div>

      {/* MODAL FORM CARD: (+) TAMBAH MENU BARU DENGAN FOTO LANGSUNG */}
      {isFormCardOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setIsFormCardOpen(false)}
          />

          {/* Hidden File Inputs for Camera and Gallery */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoCapture}
            className="hidden"
          />

          {/* Form Card Container */}
          <div className="relative w-full max-w-sm bg-stone-900 text-stone-100 rounded-3xl shadow-2xl z-10 border border-stone-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            {/* Header Form Card */}
            <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white">Form Menu Soto Qu</h3>
                  <p className="text-[10px] text-stone-400">Bisa foto langsung dari HP</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormCardOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields Body */}
            <form onSubmit={handleSaveMenuForm} className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
              {/* Foto Menu: Preview + Tombol Foto Langsung (Kamera) & Galeri */}
              <div className="space-y-2">
                <label className="block font-semibold text-stone-300">
                  Foto Menu (Foto Langsung / Contoh):
                </label>

                {/* Preview Thumbnail */}
                <div className="flex items-center gap-3 p-2 bg-stone-950 rounded-2xl border border-stone-800">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-amber-500/50 bg-stone-800 shrink-0 shadow-md">
                    <img
                      src={selectedImage}
                      alt="Preview Menu"
                      className="w-full h-full object-cover"
                    />
                    {isCustomPhoto && (
                      <div className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-[8px] text-white text-center font-bold py-0.5">
                        Foto Asli
                      </div>
                    )}
                  </div>

                  {/* Tombol Kamera & Galeri */}
                  <div className="flex-1 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Foto Langsung (Kamera)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="w-full py-1.5 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 border border-stone-700 active:scale-95 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pilih dari Galeri</span>
                    </button>
                  </div>
                </div>

                {/* Pilihan Contoh Gambar Soto Preset */}
                <div className="space-y-1">
                  <span className="text-[10px] text-stone-400 block">Atau pilih contoh gambar soto:</span>
                  <div className="grid grid-cols-6 gap-1.5">
                    {photoPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedImage(preset.img);
                          setIsCustomPhoto(false);
                        }}
                        className={`relative rounded-xl overflow-hidden aspect-square border transition-all ${
                          selectedImage === preset.img && !isCustomPhoto
                            ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105'
                            : 'border-stone-700 opacity-60 hover:opacity-100'
                        }`}
                        title={preset.label}
                      >
                        <img
                          src={preset.img}
                          alt={preset.label}
                          className="w-full h-full object-cover"
                        />
                        {selectedImage === preset.img && !isCustomPhoto && (
                          <div className="absolute inset-0 bg-amber-500/25 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nama Menu */}
              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Nama Menu Soto:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Soto Ayam Lamongan Spesial"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-medium focus:outline-hidden focus:border-amber-500 placeholder:text-stone-500"
                />
              </div>

              {/* Kategori Menu */}
              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Kategori Menu:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'bakso_kuah', label: 'Soto Kuah' },
                    { id: 'pelengkap', label: 'Pelengkap' },
                    { id: 'minuman', label: 'Minuman' },
                    { id: 'paket', label: 'Paket Hemat' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as MenuCategory)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border text-center transition-all ${
                        category === cat.id
                          ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                          : 'bg-stone-800 text-stone-300 border-stone-700 hover:border-stone-600'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Harga Jual */}
              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Harga Jual (Rp):
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={500}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-bold font-mono focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block font-semibold text-stone-300 mb-1">
                  Deskripsi Porsi (Opsional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Kuah kuning koya gurih, suwiran ayam, soun, kol..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-hidden focus:border-amber-500 placeholder:text-stone-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormCardOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold shadow-md active:scale-95 transition-all"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
