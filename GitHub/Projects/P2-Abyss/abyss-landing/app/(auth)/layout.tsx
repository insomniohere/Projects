export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05445E] via-[#0A4D68] to-[#088395] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Abyss</h1>
          <p className="text-cyan-200">Protecting Human Artistry</p>
        </div>

        {/* Auth Form Container */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8">
          {children}
        </div>

        {/* Back to home link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-cyan-200 hover:text-white transition-colors text-sm"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
