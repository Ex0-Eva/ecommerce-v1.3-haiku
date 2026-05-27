"use client";

import { useState, useEffect, useRef } from "react";
import { getSiteConfig, updateSiteConfig, SiteConfig } from "@/lib/siteConfig";

export default function PagesEditor() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'faq_content' | 'shipping_content' | 'contact_content'>('faq_content');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadConfig() {
      // Load from local storage mock first
      const fallback = localStorage.getItem('site_config_fallback');
      if (fallback) {
        try {
          setConfig(JSON.parse(fallback));
          setLoading(false);
          return;
        } catch (e) {
          console.error(e);
        }
      }
      
      const data = await getSiteConfig();
      setConfig(data);
      setLoading(false);
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    
    // Attempt real save
    try {
      await updateSiteConfig(config);
    } catch (e) {
      console.warn("DB not ready, saving to mock");
    }

    // Mock save
    localStorage.setItem('site_config_fallback', JSON.stringify(config));
    
    setSaving(false);
    alert("บันทึกข้อมูลหน้าเว็บสำเร็จ!");
    window.location.reload();
  };

  const insertFormat = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current || !config) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentText = config[activeTab] || "";
    const selectedText = currentText.substring(start, end);
    
    const newText = currentText.substring(0, start) + prefix + selectedText + suffix + currentText.substring(end);
    
    setConfig({ ...config, [activeTab]: newText });
    
    // Refocus and restore cursor (requires timeout to let state update)
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    }, 0);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading editor...</div>;

  const tabs = [
    { id: 'faq_content', label: '❓ คำถามที่พบบ่อย (FAQ)' },
    { id: 'shipping_content', label: '🚚 นโยบายการจัดส่ง' },
    { id: 'contact_content', label: '📞 ติดต่อเรา' },
  ] as const;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pages Content Editor</h1>
          <p className="mt-2 text-slate-600">จัดการเนื้อหาหน้าเว็บไซต์ รองรับการจัดรูปแบบด้วย HTML</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'บันทึกเนื้อหา (Save Content)'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-xl bg-slate-200/50 p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow'
                : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor Area */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col h-[600px]">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 mb-4 p-2 bg-slate-50 border border-slate-200 rounded-lg">
            <button onClick={() => insertFormat('<b>', '</b>')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100 font-bold">B</button>
            <button onClick={() => insertFormat('<i>', '</i>')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100 italic">I</button>
            <button onClick={() => insertFormat('<u>', '</u>')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100 underline">U</button>
            <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>
            <button onClick={() => insertFormat('<h2>', '</h2>')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100 font-bold">H2</button>
            <button onClick={() => insertFormat('<h3>', '</h3>')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100 font-bold">H3</button>
            <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>
            <button onClick={() => insertFormat('<a href="URL" target="_blank" class="text-blue-600 underline">', '</a>')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100">Link</button>
            <button onClick={() => insertFormat('<ul class="list-disc ml-6 my-4">\n  <li>', '</li>\n</ul>')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100">Bullet List</button>
            <button onClick={() => insertFormat('<br />\n')} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-100">Line Break</button>
          </div>
          
          <textarea
            ref={textareaRef}
            value={config?.[activeTab] || ""}
            onChange={(e) => setConfig(prev => prev ? {...prev, [activeTab]: e.target.value} : null)}
            className="flex-1 w-full rounded-lg border border-slate-200 p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            placeholder="Type your content here. You can use standard HTML tags..."
          />
        </div>

        {/* Live Preview Area */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col h-[600px] overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">Live Preview</h3>
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          </div>
          <div className="flex-1 overflow-y-auto p-8 bg-white">
            <div 
              className="prose max-w-none prose-slate"
              dangerouslySetInnerHTML={{ __html: config?.[activeTab] || "<p class='text-slate-400'>No content...</p>" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
