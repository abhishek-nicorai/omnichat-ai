"use client";
import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import IdentityCard from "@/components/IdentityCard";
import KnowledgeBase from "@/components/KnowledgeBase";
import ChatPlayground from "@/components/ChatPlayground";

export default function Home() {
  const { user, isLoaded } = useUser();
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => {
    if (isLoaded && user) syncUser();
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
    } catch (err) { console.error("Sync failed", err); }
  };

  if (!isLoaded || !tenant) return <div className="flex h-screen items-center justify-center bg-black text-zinc-500 font-mono">LOADING_SYSTEM...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight italic">OMNICHAT AI</h1>
          <p className="text-zinc-500 text-sm">Dashboard for {tenant.bot_name}</p>
        </div>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          <IdentityCard tenant={tenant} onUpdate={setTenant} />
          <KnowledgeBase tenantId={tenant.api_key} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8">
          <ChatPlayground tenantId={tenant.api_key} />
        </div>
      </div>
    </main>
  );
}