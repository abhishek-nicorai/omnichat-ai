"use client";
import { useState } from "react";

interface IdentityProps {
  tenant: any;
  onUpdate: (updatedData: any) => void;
}

export default function IdentityCard({ tenant, onUpdate }: IdentityProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ 
    bot_name: tenant.bot_name, 
    primary_color: tenant.primary_color 
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenant.api_key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const updated = await res.json();
      onUpdate(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Bot Identity</h2>
        <button onClick={() => setIsEditing(!isEditing)} className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
          {isEditing ? "CANCEL" : "EDIT"}
        </button>
      </div>

      <div className="space-y-4">
        <div className="w-16 h-16 rounded-2xl shadow-lg border border-white/10" 
             style={{ backgroundColor: isEditing ? formData.primary_color : tenant.primary_color }}></div>
        
        {isEditing ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
            <input type="text" value={formData.bot_name} onChange={(e) => setFormData({...formData, bot_name: e.target.value})}
                   className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
            <input type="color" value={formData.primary_color} onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                   className="w-full h-8 bg-black border border-zinc-700 rounded cursor-pointer" />
            <button onClick={handleSave} disabled={isSaving} className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-lg text-sm font-bold">
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
  );
}