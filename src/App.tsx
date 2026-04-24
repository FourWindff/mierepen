/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Search, Menu, Code, AtSign, Mail, ArrowUpRight, User, Sun, Moon } from "lucide-react";
import { getAllPosts } from "./lib/blog";
import { useTheme } from "./lib/theme";
import BlogPost from "./pages/BlogPost";
import Archive from "./pages/Archive";

// --- ASCII Wave Component ---

const ASCII_CHARS = [" ", ".", ":", "-", "=", "+", "*", "#", "%", "@"];

const ASCIIWave = () => {
  const [frame, setFrame] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ cols: 80, rows: 20 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        const cols = Math.floor(width / 6);
        const rows = Math.floor(height / 10);
        setDimensions({ cols, rows });
      }
    };

    updateDimensions();
    const timer = setTimeout(updateDimensions, 100);
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((f) => f + 1);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const generateASCII = (speed: number, offset: number, amplitude: number, washSpeed: number) => {
    const { cols, rows } = dimensions;
    let result = "";

    for (let r = 0; r < rows; r++) {
      let line = "";
      for (let c = 0; c < cols; c++) {
        const time = frame * speed;
        const xFreq = 0.08;

        const h1 = Math.sin(c * 0.15 + time * 0.7) * (amplitude * 0.4);
        const h2 = Math.cos(c * 0.04 - time * 0.3) * (amplitude * 0.3);
        const h3 = Math.sin(c * 0.25 + time * 1.2) * (amplitude * 0.15);

        const waveHeight = Math.sin(c * xFreq + time) * amplitude + offset + h1 + h2 + h3;

        const washCycle = (Math.sin(frame * washSpeed) + 1) / 2;
        const maxWash = rows * 0.4;
        const currentWashBound = washCycle * maxWash;

        const noise = Math.sin(c * 0.3 + r * 0.2 + time * 1.5) * 0.5;

        if (r < currentWashBound + waveHeight + noise) {
            const depth = (currentWashBound + waveHeight + noise) - r;
            const charIdx = Math.min(Math.floor(depth), ASCII_CHARS.length - 1);
            line += ASCII_CHARS[charIdx];
        } else {
            line += " ";
        }
      }
      result += line + "\n";
    }
    return result;
  };

  const generateBeach = () => {
    const { cols, rows } = dimensions;
    let result = "";
    for (let r = 0; r < rows; r++) {
      let line = "";
      for (let c = 0; c < cols; c++) {
        const sandDensity = (r / rows) * 1.2;
        const noise = Math.abs(Math.sin(c * 133.7 + r * 42.1));
        const beachLine = rows * 0.5 + Math.sin(c * 0.03) * 5;

        if (r > beachLine) {
          if (noise < sandDensity * 0.8) line += ".";
          else if (noise < sandDensity) line += ":";
          else line += " ";
        } else {
          line += " ";
        }
      }
      result += line + "\n";
    }
    return result;
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 bg-linear-to-b from-[#e5e5e5] to-[#f5f5f5] dark:from-[#111] dark:to-bg-primary-dark font-mono text-[8px] sm:text-[10px] leading-tight overflow-hidden select-none"
      aria-hidden="true"
    >
      <pre className="absolute inset-0 w-full h-full whitespace-pre overflow-hidden bg-transparent text-black/40 dark:text-white/40 opacity-80">
        {generateBeach()}
      </pre>
      <pre className="absolute inset-0 w-full h-full whitespace-pre overflow-hidden bg-transparent text-black/30 dark:text-white/30 opacity-50">
        {generateASCII(0.08, 12, 4, 0.02)}
      </pre>
      <pre className="absolute inset-0 w-full h-full whitespace-pre overflow-hidden bg-transparent text-black/50 dark:text-white/50 opacity-70">
        {generateASCII(0.12, 6, 3, 0.04)}
      </pre>
      <pre className="absolute inset-0 w-full h-full whitespace-pre overflow-hidden bg-transparent text-black/80 dark:text-white/80 opacity-100">
        {generateASCII(0.18, 2, 2, 0.06)}
      </pre>
      <div className="absolute inset-0 bg-linear-to-r from-[#f5f5f5]/30 via-transparent to-[#f5f5f5]/30 dark:from-bg-primary-dark/30 dark:to-bg-primary-dark/30" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-[#f5f5f5]/70 dark:to-bg-primary-dark/70" />
    </div>
  );
};

// --- Navigation Item ---

const NavItem = ({ label, href }: { label: string; href: string }) => (
  <a
    href={href}
    className="text-sm uppercase tracking-[0.2em] font-bold text-black dark:text-white mix-blend-difference hover:opacity-70 transition-opacity"
  >
    {label}
  </a>
);

// --- Home Page Component ---

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const posts = getAllPosts();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-bg-primary-dark text-black dark:text-white font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <div className="relative border-b border-black/10 dark:border-white/10">
        <ASCIIWave />

        <nav className="relative z-10 border-b border-black/5 dark:border-white/5">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-12 py-6">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black uppercase tracking-tighter mix-blend-difference">Cyber.Tides</h1>
            </div>

            <div className="hidden md:flex items-center gap-12">
              <NavItem label="Archive" href="#" />
              <NavItem label="About" href="#" />
              <NavItem label="Connect" href="#" />
              <button
                onClick={toggleTheme}
                className="p-2 text-black dark:text-white mix-blend-difference hover:opacity-70 transition-opacity"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            <button
              className="md:hidden p-4 text-black dark:text-white mix-blend-difference"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        </nav>

        <header className="relative z-10 max-w-7xl mx-auto px-12 py-32 lg:py-48">
          <div className="flex justify-between items-end">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[120px] font-black uppercase tracking-tighter leading-[0.85] mix-blend-difference"
            >
              CYBER<br />TIDES
            </motion.h2>
          </div>
        </header>
      </div>

      <main>
        <section className="max-w-7xl mx-auto px-12 py-24 border-x border-black/5 dark:border-white/5 bg-black/2 dark:bg-white/2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-6 font-bold flex items-center gap-2">
                <span className="w-4 h-px bg-black/20 dark:bg-white/20"></span> IDENTITY_MODULE
              </h3>
              <div className="w-32 h-32 bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 flex items-center justify-center mb-6">
                <User size={48} className="text-black/20 dark:text-white/20" />
              </div>
            </div>
            <div className="lg:col-span-8">
              <h2 className="text-4xl font-bold mb-8 leading-tight">
                I'm a digital architect bridging the gap between <span className="text-neutral-600 dark:text-neutral-400 italic">low-fidelity aesthetics</span> and <span className="text-neutral-600 dark:text-neutral-400 italic">high-performance systems.</span>
              </h2>
              <div className="prose prose-invert max-w-2xl text-neutral-500 font-mono text-sm leading-relaxed space-y-4">
                <p>
                  Based in the intersection of code and art, I spend my time exploring kinetic typography, generative patterns, and the raw beauty of monospace environments.
                </p>
                <p>
                  My work focuses on building interfaces that don't just function, but breathe with the data they represent. Currently obsessed with ASCII simulations and the return of minimalist brutalism.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-12 py-24 border-t border-x border-black/10 dark:border-white/10">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/40 dark:text-white/40 mb-16 font-bold text-center">
            [ 01 // SELECTED_WRITINGS ]
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {posts.slice(0, 6).map((post, idx) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="block"
              >
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="pt-8 border-t border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white transition-colors cursor-pointer group"
                >
                  <div className="font-mono text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50 mb-6 font-bold">
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1} / {formatDate(post.date).toUpperCase()}
                  </div>
                  <h2 className="text-2xl font-bold leading-tight mb-4 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-black/30 dark:text-white/30 uppercase tracking-widest font-bold">
                    <span>{post.category}</span>
                    <span>/</span>
                    <span>{post.readTime}</span>
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link
              to="/archive"
              className="inline-block bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs py-4 px-8 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors tracking-[0.2em]"
            >
              More
            </Link>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-12 py-24 border-t border-x border-black/10 dark:border-white/10 bg-black/1 dark:bg-white/1">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/40 dark:text-white/40 mb-16 font-bold text-center">
            [ 02 // RECENT_LAB_PROJECTS ]
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 px-1 bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10">
            {[
              { name: "Nebula OS", type: "Experimental UI", desc: "A browser-based operating system designed for focus." },
              { name: "Flux Engine", type: "Canvas Engine", desc: "Real-time fluid simulation using character grids." },
              { name: "Mono-Type", type: "Typography", desc: "A custom variable font for terminal enthusiasts." },
              { name: "Void-Space", type: "Social Hub", desc: "A minimal, encrypted community platform." }
            ].map((proj, idx) => (
              <div key={idx} className="bg-[#f5f5f5] dark:bg-bg-primary-dark p-12 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group relative">
                <div className="flex justify-between items-start mb-12">
                  <span className="font-mono text-[10px] text-black/30 dark:text-white/30">{proj.type.toUpperCase()}</span>
                  <ArrowUpRight size={20} className="text-black/20 dark:text-white/20 group-hover:text-black dark:group-hover:text-white transition-colors group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <h4 className="text-4xl font-black uppercase mb-4">{proj.name}</h4>
                <p className="text-neutral-500 font-mono text-xs max-w-sm">{proj.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-12 py-24 border-t border-x border-black/10 dark:border-white/10">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/40 dark:text-white/40 mb-16 font-bold text-center">
            [ 03 // ARCHIVE_REGISTRY ]
          </h3>
          <div className="space-y-4">
            {[
              "The Ethics of Generative Entropy",
              "Subsurface Scattering in ASCII Environments",
              "Mental Models for Grid-Based Layouts",
              "Legacy Systems: Why We Can't Let Go",
              "The Sound of Code: Auditory Feedback in IDEs"
            ].map((title, i) => (
              <a key={i} href="#" className="flex items-center justify-between p-6 border border-black/5 dark:border-white/5 hover:border-black/40 dark:hover:border-white/40 transition-colors group">
                <div className="flex items-center gap-8">
                  <span className="font-mono text-[10px] text-black/20 dark:text-white/20">#{122 - i}</span>
                  <span className="text-lg font-bold group-hover:translate-x-2 transition-transform">{title}</span>
                </div>
                <span className="font-mono text-[10px] text-black/20 dark:text-white/20">01.2024</span>
              </a>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-12 py-24 border-t border-x border-black/10 dark:border-white/10 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <aside className="space-y-12">
            <section>
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50 mb-6 font-bold">
                Search_Registry
              </h4>
              <div className="relative border-b border-black/20 dark:border-white/20 focus-within:border-black dark:focus-within:border-white transition-colors">
                <input
                  type="text"
                  placeholder="QUERY_DATABASE..."
                  className="w-full bg-transparent py-4 font-mono text-sm focus:outline-none text-black dark:text-white placeholder:text-neutral-400"
                />
                <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 text-black dark:text-white" />
              </div>
            </section>
          </aside>

          <section className="bg-black/5 dark:bg-white/5 p-12">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50 mb-6 font-bold">
              Newsletter_Sub
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed max-w-sm">
              Keep the data flowing. Sub for laboratory updates.
            </p>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="USER@DOMAIN.TLD"
                className="w-full bg-transparent border-b border-black/20 dark:border-white/20 py-4 font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors text-black dark:text-white placeholder:text-neutral-400"
              />
              <button className="w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs py-4 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors tracking-[0.2em]">
                Initialize_Sub
              </button>
            </div>
          </section>
        </section>
      </main>

      <footer className="px-12 py-10 border-t border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50">System Status: Optimal</span>
          </div>

          <div className="flex gap-8">
            <a href="#" className="p-2 text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors"><Code size={20} /></a>
            <a href="#" className="p-2 text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors"><AtSign size={20} /></a>
            <a href="#" className="p-2 text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors"><Mail size={20} /></a>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50">
            &copy; 2024 CYBER_TIDES BLOG
          </p>
        </div>
      </footer>
    </div>
  );
}

// --- Main App Component ---

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/archive" element={<Archive />} />
    </Routes>
  );
}
