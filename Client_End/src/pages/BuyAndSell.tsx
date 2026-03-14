import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Plus, Search, ChevronLeft, ChevronRight, X, Upload,
  Phone, Tag, User, IndianRupee, ImagePlus, Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// ── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  images: string[];
  price: number;
  seller: string;
  contact: string;
  category: string;
  description: string;
  listedAt: string;
}

const CATEGORIES = [
  'All',
  'Electronics/Gadgets',
  'Books',
  'Stationery',
  'Clothing',
  'Sports',
  'Furniture',
  'Miscellaneous',
];

// ── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Adjustable Hand Grip Strengthener',
    images: [
      'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
    ],
    price: 249,
    seller: 'Avinash',
    contact: '9972405051',
    category: 'Sports',
    description: 'Metal spring, easy turn dial, strong plastic, non-slip grip. Brand new, barely used.',
    listedAt: '2 hours ago',
  },
  {
    id: '2',
    name: 'JK Copier A4 75gsm 500 Sheets',
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&q=80',
    ],
    price: 295,
    seller: 'Yash Vardhan Jha',
    contact: '9302650231',
    category: 'Stationery',
    description: 'Sealed pack of 500 sheets. A4 size, 75gsm weight. Perfect for printing assignments.',
    listedAt: '5 hours ago',
  },
  {
    id: '3',
    name: 'Tribit StormBox 2 Bluetooth Speaker',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80',
    ],
    price: 3900,
    seller: 'Shikhar',
    contact: '9559583981',
    category: 'Electronics/Gadgets',
    description: 'IPX7 waterproof Bluetooth speaker. 24-hour battery life. Deep bass. Like new condition.',
    listedAt: '1 day ago',
  },
  {
    id: '4',
    name: 'Engineering Mathematics by B.S. Grewal',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    ],
    price: 450,
    seller: 'Rahul Kumar',
    contact: '8284024950',
    category: 'Books',
    description: '44th edition. Covers all semesters. Highlighted but in good condition. No torn pages.',
    listedAt: '2 days ago',
  },
  {
    id: '5',
    name: 'Casio FX-991EX Scientific Calculator',
    images: [
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
    ],
    price: 1200,
    seller: 'Priya Sharma',
    contact: '7890123456',
    category: 'Electronics/Gadgets',
    description: 'Classwiz series. 552 functions. Natural textbook display. Includes protective case.',
    listedAt: '3 days ago',
  },
  {
    id: '6',
    name: 'Wooden Study Table with Drawer',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80',
      'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=400&q=80',
    ],
    price: 2500,
    seller: 'Ankit Mehta',
    contact: '9876543210',
    category: 'Furniture',
    description: 'Solid wood study table. One deep drawer. Compact size ideal for hostel rooms. Minor scratches.',
    listedAt: '4 days ago',
  },
];

// ── Inline orange/black theme tokens ─────────────────────────────────────────

const T = {
  bg: '#0a0a0a',
  card: '#141414',
  cardHover: '#1a1a1a',
  border: '#2a2a2a',
  accent: '#f97316',      // orange-500
  accentDark: '#ea580c',  // orange-600
  accentGlow: 'rgba(249,115,22,0.15)',
  text: '#f5f5f5',
  muted: '#a3a3a3',
  badge: '#1c1c1c',
};

// ── Main Component ───────────────────────────────────────────────────────────

export default function BuyAndSell() {
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [sellOpen, setSellOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  // Sell form state
  const [form, setForm] = useState({
    name: '', price: '', contact: '', category: 'Electronics/Gadgets', description: '',
  });
  const [formImages, setFormImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) setFormImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.contact) {
      toast.error('Please fill in all required fields.');
      return;
    }
    const newProduct: Product = {
      id: Date.now().toString(),
      name: form.name,
      images: formImages.length > 0 ? formImages : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'],
      price: parseFloat(form.price),
      seller: 'You',
      contact: form.contact,
      category: form.category,
      description: form.description,
      listedAt: 'Just now',
    };
    setProducts(prev => [newProduct, ...prev]);
    setForm({ name: '', price: '', contact: '', category: 'Electronics/Gadgets', description: '' });
    setFormImages([]);
    setSellOpen(false);
    toast.success('Item listed successfully!');
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text }}>
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 border-b" style={{ background: T.card, borderColor: T.border }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.accentGlow }}>
              <ShoppingBag className="w-5 h-5" style={{ color: T.accent }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: T.text }}>PEC Marketplace</h1>
              <p className="text-xs" style={{ color: T.muted }}>{products.length} items listed</p>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-3 w-full sm:w-auto sm:ml-auto">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: T.muted }} />
              <input
                placeholder="Search items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg text-sm outline-none"
                style={{ background: T.badge, border: `1px solid ${T.border}`, color: T.text }}
              />
            </div>
            <select
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              className="h-9 px-3 rounded-lg text-sm outline-none cursor-pointer"
              style={{ background: T.badge, border: `1px solid ${T.border}`, color: T.text }}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={() => setSellOpen(true)}
              className="h-9 px-4 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors"
              style={{ background: T.accent, color: '#000' }}
              onMouseEnter={e => (e.currentTarget.style.background = T.accentDark)}
              onMouseLeave={e => (e.currentTarget.style.background = T.accent)}
            >
              <Plus className="w-4 h-4" /> Sell Item
            </button>
          </div>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4" style={{ color: T.border }} />
            <p className="text-lg font-medium" style={{ color: T.muted }}>No items found</p>
            <p className="text-sm mt-1" style={{ color: T.border }}>Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} onView={setViewProduct} />
            ))}
          </div>
        )}
      </div>

      {/* ── Sell Item Modal ── */}
      <Dialog open={sellOpen} onOpenChange={setSellOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden gap-0" style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b" style={{ borderColor: T.border }}>
            <DialogTitle style={{ color: T.text }}>List an Item for Sale</DialogTitle>
            <DialogDescription style={{ color: T.muted }}>Fill in the details below to list your item on PEC Marketplace.</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4">
            {/* Image upload */}
            <div>
              <label className="text-xs font-medium" style={{ color: T.muted }}>Photos</label>
              <div className="mt-1.5 flex gap-2 flex-wrap">
                {formImages.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setFormImages(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.7)' }}
                    >
                      <X className="w-3 h-3" style={{ color: T.accent }} />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors"
                  style={{ border: `2px dashed ${T.border}`, color: T.muted }}
                >
                  <ImagePlus className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">Add</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
            {/* Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium" style={{ color: T.muted }}>Product Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full h-9 mt-1 px-3 rounded-lg text-sm outline-none"
                  style={{ background: T.badge, border: `1px solid ${T.border}`, color: T.text }}
                  placeholder="e.g. Bluetooth Speaker" />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: T.muted }}>Price (₹) *</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                  className="w-full h-9 mt-1 px-3 rounded-lg text-sm outline-none"
                  style={{ background: T.badge, border: `1px solid ${T.border}`, color: T.text }}
                  placeholder="299" />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: T.muted }}>Contact Number *</label>
                <input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })}
                  className="w-full h-9 mt-1 px-3 rounded-lg text-sm outline-none"
                  style={{ background: T.badge, border: `1px solid ${T.border}`, color: T.text }}
                  placeholder="9876543210" maxLength={10} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium" style={{ color: T.muted }}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full h-9 mt-1 px-3 rounded-lg text-sm outline-none cursor-pointer"
                  style={{ background: T.badge, border: `1px solid ${T.border}`, color: T.text }}
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium" style={{ color: T.muted }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ background: T.badge, border: `1px solid ${T.border}`, color: T.text }}
                  placeholder="Describe your item..." />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setSellOpen(false)}
                className="flex-1 h-9 rounded-lg text-sm font-medium transition-colors"
                style={{ background: T.badge, border: `1px solid ${T.border}`, color: T.text }}
              >Cancel</button>
              <button onClick={handleSubmit}
                className="flex-1 h-9 rounded-lg text-sm font-semibold transition-colors"
                style={{ background: T.accent, color: '#000' }}
              >List Item</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── View Product Modal ── */}
      <Dialog open={!!viewProduct} onOpenChange={v => !v && setViewProduct(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden gap-0" style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}>
          {viewProduct && (
            <>
              <div className="w-full h-56 overflow-hidden">
                <img src={viewProduct.images[0]} alt={viewProduct.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold" style={{ color: T.text }}>{viewProduct.name}</h3>
                <p className="text-2xl font-bold" style={{ color: T.accent }}>₹ {viewProduct.price.toLocaleString()}</p>
                <p className="text-sm" style={{ color: T.muted }}>{viewProduct.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm pt-2" style={{ color: T.muted }}>
                  <div className="flex items-center gap-2"><User className="w-4 h-4" style={{ color: T.accent }} /><span>{viewProduct.seller}</span></div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4" style={{ color: T.accent }} /><span>{viewProduct.contact}</span></div>
                  <div className="flex items-center gap-2"><Tag className="w-4 h-4" style={{ color: T.accent }} /><span>{viewProduct.category}</span></div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: T.border }}>{viewProduct.listedAt}</div>
                </div>
                <div className="flex gap-2 pt-3">
                  <button
                    onClick={() => { navigator.clipboard.writeText(viewProduct.contact); toast.success('Contact number copied!'); }}
                    className="flex-1 h-9 rounded-lg text-sm font-semibold transition-colors"
                    style={{ background: T.accent, color: '#000' }}
                  >Contact Seller</button>
                  <button onClick={() => setViewProduct(null)}
                    className="h-9 px-4 rounded-lg text-sm font-medium"
                    style={{ background: T.badge, border: `1px solid ${T.border}`, color: T.text }}
                  >Close</button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Product Card (IRIS-inspired) ─────────────────────────────────────────────

function ProductCard({ product, index, onView }: { product: Product; index: number; onView: (p: Product) => void }) {
  const [imgIdx, setImgIdx] = useState(0);
  const hasMultiple = product.images.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="rounded-xl overflow-hidden flex flex-col"
      style={{ background: T.card, border: `1px solid ${T.border}` }}
    >
      {/* ── Title + Request ── */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <h3 className="font-semibold text-sm truncate pr-2" style={{ color: T.text }}>{product.name}</h3>
        <button
          onClick={() => { navigator.clipboard.writeText(product.contact); toast.success(`Copied ${product.seller}'s number!`); }}
          className="text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap"
          style={{ border: `1.5px solid ${T.accent}`, color: T.accent }}
        >Request</button>
      </div>

      {/* ── Image Carousel ── */}
      <div className="relative h-48 overflow-hidden" style={{ background: '#0d0d0d' }}>
        <img src={product.images[imgIdx]} alt={product.name} className="w-full h-full object-contain" />
        {hasMultiple && (
          <>
            <button
              onClick={() => setImgIdx(i => (i - 1 + product.images.length) % product.images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.6)', color: T.muted }}
            ><ChevronLeft className="w-4 h-4" /></button>
            <button
              onClick={() => setImgIdx(i => (i + 1) % product.images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.6)', color: T.muted }}
            ><ChevronRight className="w-4 h-4" /></button>
          </>
        )}
      </div>

      {/* ── Badge ── */}
      <div className="flex justify-center -mt-3.5 relative z-10">
        <span className="text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase"
          style={{ background: T.accent, color: '#000' }}
        >Student Listed</span>
      </div>

      {/* ── Details ── */}
      <div className="px-4 pt-3 pb-4 space-y-2 text-sm flex-1 flex flex-col">
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
          <span className="font-semibold" style={{ color: T.muted }}>Seller:</span>
          <span style={{ color: T.text }}>{product.seller}</span>

          <span className="font-semibold" style={{ color: T.muted }}>Cost:</span>
          <span className="font-bold" style={{ color: T.accent }}>₹ {product.price.toLocaleString()}</span>

          <span className="font-semibold" style={{ color: T.muted }}>Contact:</span>
          <span style={{ color: T.text }}>{product.contact}</span>

          <span className="font-semibold" style={{ color: T.muted }}>Category:</span>
          <span style={{ color: T.text }}>{product.category}</span>
        </div>

        <div className="pt-2 mt-auto">
          <button
            onClick={() => onView(product)}
            className="w-full h-8 rounded-full text-xs font-semibold tracking-wide transition-colors"
            style={{ border: `1.5px solid ${T.accent}`, color: T.accent, background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = T.accentGlow; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >View Product</button>
        </div>
      </div>
    </motion.div>
  );
}
