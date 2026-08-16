"use client";
import { useState } from "react";

export default function KnowledgeBase({ tenantId }: { tenantId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const data = new FormData();
    data.append("file", file);

    setIsUploading(true);
    setStatus("Processing knowledge...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ingestion/upload?tenant_id=${tenantId}`, {
        method: "POST",
        body: data,
      });
      if (res.ok) {
        const result = await res.json();
        setStatus(`Success! Added ${result.chunks_processed} knowledge chunks.`);
      } else { setStatus("Upload failed."); }
    } catch (err) { setStatus("Connection error."); }
    finally { setIsUploading(false); }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl h-full">
      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Knowledge Base</h2>
      <div className="border-2 border-dashed border-zinc-800 rounded-xl p-10 text-center hover:border-zinc-700 transition-colors">
        <input type="file" id="pdf-up" className="hidden" accept=".pdf" onChange={handleUpload} disabled={isUploading}/>
        <label htmlFor="pdf-up" className={`cursor-pointer group ${isUploading ? 'pointer-events-none' : ''}`}>
          <div className="bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-600">
            <svg className="w-6 h-6 text-zinc-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          </div>
          <p className="text-sm font-medium text-zinc-300">{isUploading ? "Uploading..." : "Click to upload training data (PDF)"}</p>
        </label>
      </div>
      {status && <div className="mt-6 p-4 rounded-lg text-sm bg-zinc-800/50 border border-zinc-800 text-zinc-400">{status}</div>}
    </div>
  );
}