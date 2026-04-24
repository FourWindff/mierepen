export default function Footer() {
  return (
    <footer className="px-12 py-10 border-t border-black/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50">
            System Status: Optimal
          </span>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50">
          &copy; 2024 MIEREPEN BLOG
        </p>
      </div>
    </footer>
  )
}
