export default async function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  let status = "Checking backend...";

  try {
    const res = await fetch(`${apiUrl}/health`, { cache: 'no-store' });
    const data = await res.json();
    status = `Backend Status: ${data.status}`;
  } catch (e) {
    status = "Backend unreachable";
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">OmniChat Admin Dashboard</h1>
      <p className="mt-4 p-4 bg-gray-100 rounded-lg">{status}</p>
    </main>
  );
}