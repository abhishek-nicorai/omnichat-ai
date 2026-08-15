"use client";
import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, isLoaded } = useUser();
  const [tenant, setTenant] = useState<any>(null);
  
  // Settings States
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ bot_name: "", primary_color: "#4F46E5" });

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      syncUser();
    }
  }, [isLoaded, user]);

  const syncUser = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.fullName || user?.username || "New User",
          clerk_id: user?.id,
        }),
      });
      const data = await res.json();
      setTenant(data);
      setFormData({ bot_name: data.bot_name, primary_color: data.primary_color });
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  const handleUpdateSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const updated = await res.json();
      setTenant(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user) return;
    const file = e.target.files[0];
    const data = new FormData();
    data.append("file", file);

    setIsUploading(true);
    setUploadStatus("Processing knowledge...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ingestion/upload?tenant_id=${user.id}`, {
        method: "POST",
        body: data,
      });
      if (res.ok) {
        const result = await res.json();
        setUploadStatus(`Success! Added ${result.chunks_processed} knowledge chunks.`);
      } else { setUploadStatus("Upload failed."); }
    } catch (err) { setUploadStatus("Connection error."); }
    finally { setIsUploading(false); }
  };

  if (!isLoaded || !tenant) return <div className="flex h-screen items-center justify-center bg-black text-zinc-500 font-mono">LOADING_SYSTEM...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">OmniChat AI</h1>
          <p className="text-zinc-500 text-sm">Dashboard for {tenant.bot_name}</p>
        </div>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Module 1: Bot Identity & Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Bot Identity</h2>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {isEditing ? "CANCEL" : "EDIT"}
              </button>
            </div>

            <div className="space-y-4">
              <div 
                className="w-16 h-16 rounded-2xl shadow-lg border border-white/10 transition-all" 
                style={{ backgroundColor: isEditing ? formData.primary_color : tenant.primary_color }}
              ></div>
              
              {isEditing ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                  <input 
                    type="text"
                    value={formData.bot_name}
                    onChange={(e) => setFormData({...formData, bot_name: e.target.value})}
                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    placeholder="Bot Name"
                  />
                  <input 
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                    className="w-full h-8 bg-black border border-zinc-700 rounded cursor-pointer"
                  />
                  <button 
                    onClick={handleUpdateSettings}
                    disabled={isSaving}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                  >
                    {isSaving ? "SAVING..." : "SAVE CHANGES"}
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xl font-medium">{tenant.bot_name}</p>
                  <p className="text-zinc-500 text-[10px] font-mono break-all uppercase">API_KEY: {tenant.api_key}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Module 2: Knowledge Base */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl h-full">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Knowledge Base</h2>
            <div className="border-2 border-dashed border-zinc-800 rounded-xl p-10 text-center hover:border-zinc-700 transition-colors">
              <input type="file" id="pdf-upload" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={isUploading}/>
              <label htmlFor="pdf-upload" className={`cursor-pointer group ${isUploading ? 'pointer-events-none' : ''}`}>
                <div className="bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-600 transition-colors">
                  <svg className="w-6 h-6 text-zinc-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="text-sm font-medium text-zinc-300">{isUploading ? "Uploading..." : "Click to upload training data (PDF)"}</p>
              </label>
            </div>
            {uploadStatus && <div className="mt-6 p-4 rounded-lg text-sm bg-zinc-800/50 border border-zinc-800 text-zinc-400">{uploadStatus}</div>}
          </div>
        </div>

      </div>
    </main>
  );
}