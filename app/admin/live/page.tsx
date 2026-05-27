"use client";

import { useState, useEffect } from "react";
import { getActiveLiveStream, updateLiveStream, type LiveStream } from "@/lib/liveCommerce";
import { getAllProducts, type Product } from "@/lib/products";

export default function LiveControlPanel() {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [liveData, productData] = await Promise.all([
          getActiveLiveStream(),
          getAllProducts()
        ]);
        setStream(liveData);
        setProducts(productData);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลได้";
        setError(message);
        console.error("Failed to load live control data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateStatus = async (status: 'idle' | 'live' | 'ended') => {
    if (!stream) return;
    setUpdating(true);
    const res = await updateLiveStream(stream.id, { status });
    if (res.success) setStream({...stream, status});
    setUpdating(false);
  };

  const handlePushProduct = async (productId: string) => {
    if (!stream) return;
    setUpdating(true);
    const res = await updateLiveStream(stream.id, { featured_product_id: productId });
    if (res.success) setStream({...stream, featured_product_id: productId});
    setUpdating(false);
  };

  if (loading) return <div className="p-10 text-center text-slate-500">กำลังโหลดระบบควบคุมไลฟ์...</div>;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-lg font-semibold text-red-700">⚠️ ไม่สามารถโหลดข้อมูลได้</p>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-custom bg-white p-8 shadow-lg shadow-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold">Live Control Panel</h1>
            <p className="mt-2 text-slate-600">จัดการสัญญาณสดและสินค้าที่แสดงบนหน้าจอผู้ชม</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${stream?.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></div>
            <span className="font-bold uppercase tracking-wider text-sm">
              Status: {stream?.status}
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          
          {/* Stream Controls */}
          <div className="lg:col-span-1 space-y-6 rounded-custom border border-slate-200 p-6 bg-slate-50">
            <h2 className="text-xl font-semibold">📺 Stream Settings</h2>
            <div className="space-y-4">
               <button 
                onClick={() => handleUpdateStatus('live')}
                disabled={stream?.status === 'live' || updating}
                className="w-full rounded-xl bg-red-600 py-3 font-bold text-white shadow-lg transition hover:bg-red-700 disabled:opacity-50"
               >
                 Go LIVE 🚀
               </button>
               <button 
                onClick={() => handleUpdateStatus('ended')}
                disabled={stream?.status === 'ended' || updating}
                className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
               >
                 Stop Stream ⏹️
               </button>
               <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Stream Key (For OBS)</p>
                  <code className="mt-2 block bg-slate-200 p-2 rounded text-xs truncate">ivs_live_2026_demo_key_xxxxxxx</code>
               </div>
            </div>
          </div>

          {/* Product Pushing */}
          <div className="lg:col-span-2 space-y-6 rounded-custom border border-slate-200 p-6 bg-slate-50">
            <h2 className="text-xl font-semibold">🛍️ Featured Product (Push to Viewers)</h2>
            <p className="text-sm text-slate-500">เลือกสินค้าเพื่อให้เด้งขึ้นบนหน้าจอของผู้ชมทุกคนทันที</p>
            
            <div className="grid gap-4 md:grid-cols-2 max-h-[400px] overflow-y-auto pr-2">
              {products.map(product => (
                <div 
                  key={product.id} 
                  className={`relative flex items-center gap-4 rounded-2xl border p-4 transition-all cursor-pointer ${
                    stream?.featured_product_id === product.id 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                    : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                  onClick={() => handlePushProduct(product.id)}
                >
                  <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                    📦
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{product.name}</p>
                    <p className="text-sm text-slate-500">฿{product.price.toLocaleString()}</p>
                  </div>
                  {stream?.featured_product_id === product.id && (
                    <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full absolute -top-2 -right-2">
                      PUSHING
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
