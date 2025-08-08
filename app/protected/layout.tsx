export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 max-w-screen-xl flex flex-col gap-20 items-center mt-16">
        <div className="flex-1 flex flex-col gap-20 max-w-screen-xl p-5">
          {children}
        </div>
      </div>
    </main>
  );
}
