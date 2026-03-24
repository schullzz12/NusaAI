export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-nusa-bg flex flex-col items-center justify-center px-5">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">
          <span className="text-nusa-primary">Nusa</span>
          <span className="text-nusa-text">AI</span>
        </h1>
        <p className="text-sm text-nusa-muted mt-1">Teman Chat AI Dewasa</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
