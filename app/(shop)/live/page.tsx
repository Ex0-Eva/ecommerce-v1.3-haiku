"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getActiveLiveStream, type LiveStream } from "@/lib/liveCommerce";
import { getProductById, type Product } from "@/lib/products";
import { useCartStore } from "@/store/useCartStore";

export default function LivePage() {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ id: number; user: string; text: string }[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function initLive() {
      try {
        const liveData = await getActiveLiveStream();
        setStream(liveData);

        if (liveData?.featured_product_id) {
          const product = await getProductById(liveData.featured_product_id);
          setFeaturedProduct(product);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลได้";
        setError(message);
        console.error("Failed to load live data:", err);
      }
    }
    initLive();
  }, []);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setChatMessages([...chatMessages, { id: Date.now(), user: "You", text: newMsg }]);
    setNewMsg("");
  };

  if (error) return <div className="p-10 text-center text-red-600 bg-red-50 rounded-2xl m-6">⚠️ {error}</div>;
  if (!stream) return <div className="p-10 text-center">กำลังเชื่อมต่อสัญญาณสด...</div>;

  return (
    <main className="min-h-screen bg-slate-900 text-white overflow-hidden">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        
        {/* Video Player Section */}
        <div className="relative flex-1 bg-black flex items-center justify-center">
          <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
            <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">LIVE</span>
            <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium">
              👥 {stream.current_viewers.toLocaleString()} viewers
            </span>
          </div>

          {/* Placeholder for Video */}
          <div className="w-full h-full bg-slate-800 flex items-center justify-center overflow-hidden">
             <div className="text-center space-y-4">
                <div className="text-6xl animate-bounce">🎥</div>
                <h2 className="text-2xl font-semibold">{stream.title}</h2>
                <p className="text-slate-400">Video Stream Placeholder (Mux / Agora)</p>
             </div>
          </div>

          {/* Featured Product Overlay */}
          {featuredProduct && (
            <div className="absolute bottom-6 left-6 right-6 lg:right-auto lg:w-96 animate-slide-up">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-custom flex gap-4 items-center shadow-2xl">
                <div className="w-24 h-24 bg-slate-100 rounded-2xl flex-shrink-0 relative overflow-hidden">
                  {featuredProduct.image_url ? (
                    <Image src={featuredProduct.image_url} alt={featuredProduct.name} fill className="object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-2xl">📦</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate text-white">{featuredProduct.name}</h3>
                  <p className="text-xl font-bold text-blue-400">฿{featuredProduct.price.toLocaleString()}</p>
                  <button 
                    onClick={() => addItem({
                      id: featuredProduct.id,
                      name: featuredProduct.name,
                      price: featuredProduct.price,
                      stock: featuredProduct.stock,
                      type: featuredProduct.product_type,
                      quantity: 1,
                    })}
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-xl text-xs font-bold transition-all transform active:scale-95"
                  >
                    ใส่ตะกร้าทันที
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Section */}
        <div className="w-full lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-semibold">Live Chat</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {chatMessages.map(msg => (
              <div key={msg.id} className="animate-fade-in">
                <span className="font-bold text-blue-400 text-sm">{msg.user}: </span>
                <span className="text-sm text-slate-300">{msg.text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="p-4 border-t border-slate-800 flex gap-2">
            <input 
              type="text" 
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="พูดคุย..."
              className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button className="bg-slate-700 p-2 rounded-xl">🚀</button>
          </form>
        </div>
      </div>
    </main>
  );
}
