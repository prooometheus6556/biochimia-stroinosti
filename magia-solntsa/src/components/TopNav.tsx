"use client";

export default function TopNav() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#fbf9f1]/70 backdrop-blur-md flex justify-between items-center px-6 h-16 shadow-[0_4px_30px_rgba(129,85,18,0.06)]">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-amber-800">menu</span>
        <span className="font-headline font-bold text-amber-900 uppercase tracking-widest text-lg">
          МАГИЯ СОЛНЦА
        </span>
      </div>
      <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20 shadow-sm bg-primary-container/30 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary">person</span>
      </div>
    </nav>
  );
}
