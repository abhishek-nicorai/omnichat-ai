"use client";
import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, isLoaded } = useUser();
  const [tenant, setTenant] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Local form state
  const [formData, setFormData] = useState({
    bot_name: "",
    primary_color: "#4F46E5",
  });

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
      setFormData({
        bot_name: data.bot_name,
        primary_color: data.primary_color,
      });
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  const handleSave = async () => {
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

  if (!isLoaded || !tenant) return <div className="flex h-screen items-center justify-center bg-black text-zinc-500">Initializing...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12">
      {/* Header Area */}
      <div className="max-w-3xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold">OmniChat Dashboard</h1>
          <p className="text-zinc-500 text-sm">Manage your AI assistant settings</p>
        </div>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Top Bar with Status */}
          <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
            <span className="flex items-center gap-2 text-xs font-medium text-emerald-500 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live & Active
            </span>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isEditing ? "Cancel" : "Edit Configuration"}
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* Bot Name Section */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">Assistant Name</label>
              {isEditing ? (
                <input 
                  type="text"
                  value={formData.bot_name}
                  onChange={(e) => setFormData({...formData, bot_name: e.target.value})}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              ) : (
                <p className="text-xl font-medium">{tenant.bot_name}</p>
              )}
            </div>

            {/* API Key (Read Only) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">Public API Key</label>
              <div className="flex gap-2">
                <code className="flex-1 bg-black border border-zinc-800 rounded-lg px-4 py-2 text-zinc-400 font-mono text-sm overflow-x-auto">
                  {tenant.api_key}
                </code>
              </div>
            </div>

            {/* Theme Color Section */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">Brand Identity</label>
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl shadow-inner border border-white/10" 
                  style={{ backgroundColor: isEditing ? formData.primary_color : tenant.primary_color }}
                ></div>
                {isEditing ? (
                  <input 
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                    className="h-10 w-20 bg-black border border-zinc-700 rounded cursor-pointer"
                  />
                ) : (
                  <span className="font-mono text-zinc-400">{tenant.primary_color}</span>
                )}
              </div>
            </div>

            {/* Action Footer */}
            {isEditing && (
              <div className="pt-6 border-t border-zinc-800 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold px-8 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                >
                  {isSaving ? "Updating..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}