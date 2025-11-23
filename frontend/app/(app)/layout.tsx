import { Header } from "@/components/Header";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-1 container max-w-screen-2xl mx-auto py-6 px-4">
        {children}
      </main>
    </>
  );
}
