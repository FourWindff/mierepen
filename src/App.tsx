/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowUpRight, User, Sun, Moon } from "lucide-react";
import { getAllPosts } from "./lib/blog";
import { getAllTutorials } from "./lib/docs";
import { formatArchiveDate } from "./lib/content";
import { useTheme } from "./lib/useTheme";
import BlogPost from "./pages/BlogPost";
import Archive from "./pages/Archive";
import DocsTutorial from "./pages/DocsTutorial";
import LogoMark from "./components/LogoMark";

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
      className="absolute inset-0 bg-linear-to-b from-[#e5e5e5] to-[#f5f5f5] dark:from-[#111] dark:to-bg-primary-dark font-mono text-[10px] leading-tight overflow-hidden select-none"
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

const NavItem = ({ label, to }: { label: string; to: string }) => (
  <Link
    to={to}
    className="text-sm uppercase tracking-[0.2em] font-bold text-black dark:text-white mix-blend-difference hover:opacity-70 transition-opacity"
  >
    {label}
  </Link>
);

const GitHubMark = ({ size = 16 }: { size?: number }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="fill-current"
    style={{ width: size, height: size }}
  >
    <path d="M12 0C5.37 0 0 5.5 0 12.3c0 5.44 3.44 10.06 8.2 11.69.6.11.82-.27.82-.6 0-.3-.01-1.08-.02-2.12-3.34.75-4.05-1.67-4.05-1.67-.55-1.43-1.33-1.82-1.33-1.82-1.09-.77.08-.75.08-.75 1.2.09 1.84 1.27 1.84 1.27 1.08 1.9 2.82 1.35 3.5 1.03.11-.8.42-1.35.76-1.67-2.67-.31-5.47-1.37-5.47-6.08 0-1.34.47-2.43 1.24-3.29-.13-.31-.54-1.56.12-3.26 0 0 1.01-.33 3.3 1.26A11.2 11.2 0 0 1 12 5.68c1.02 0 2.05.14 3.01.42 2.29-1.59 3.3-1.26 3.3-1.26.66 1.7.25 2.95.12 3.26.77.86 1.24 1.95 1.24 3.29 0 4.72-2.8 5.76-5.48 6.07.43.38.82 1.12.82 2.26 0 1.63-.02 2.94-.02 3.34 0 .33.21.72.83.6C20.57 22.35 24 17.74 24 12.3 24 5.5 18.63 0 12 0Z" />
  </svg>
);

// --- Home Page Component ---

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const posts = getAllPosts();
  const tutorials = getAllTutorials();
  const latestTutorials = tutorials.slice(0, 4);
  const hasMoreTutorials = tutorials.length > latestTutorials.length;

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-bg-primary-dark text-black dark:text-white font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <div className="relative border-b border-black/10 dark:border-white/10">
        <ASCIIWave />

        <nav className="relative z-10 border-b border-black/5 dark:border-white/5">
          <div className="max-w-7xl mx-auto flex items-center px-4 sm:px-6 lg:px-12 py-6">
            <button
              className="mr-3 p-4 text-black dark:text-white mix-blend-difference md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex items-center gap-3">
              <LogoMark className="block h-9 w-9 shrink-0 mix-blend-difference" />
              <h1 className="text-xl font-black uppercase tracking-tighter mix-blend-difference">Mierepen</h1>
            </div>

            <div className="ml-auto hidden md:flex items-center gap-12">
              <NavItem label="Archive" to="/archive" />
              <a
                href="https://github.com/FourWindff"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] font-bold text-black dark:text-white mix-blend-difference hover:opacity-70 transition-opacity"
              >
                <GitHubMark size={16} />
                Github
              </a>
              <button
                onClick={toggleTheme}
                className="p-2 text-black dark:text-white mix-blend-difference hover:opacity-70 transition-opacity"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

          </div>
        </nav>

        {/* Mobile menu overlay (Home) */}
        <AnimatePresence>
          {isMenuOpen ? (
            <motion.div
              key="home-mobile-menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-50 flex"
            >
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-[min(82vw,22rem)] h-full bg-[#f5f5f5] dark:bg-[#080808] border-r border-black/10 dark:border-white/10 shadow-[18px_0_48px_rgba(0,0,0,0.18)] dark:shadow-[18px_0_48px_rgba(0,0,0,0.55)]"
              >
                <div className="flex items-center gap-3 px-4 sm:px-6 py-6 border-b border-black/10 dark:border-white/10">
                  <button
                    className="p-4 text-black dark:text-white"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <X size={24} />
                  </button>
                  <div className="flex items-center gap-3 text-xl font-black uppercase tracking-tighter text-black dark:text-white">
                    <LogoMark className="block h-9 w-9 shrink-0" />
                    Mierepen
                  </div>
                </div>
                <div className="flex flex-col px-4 sm:px-6 py-8 gap-8">
                  <Link
                    to="/archive"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-base uppercase tracking-[0.2em] font-bold text-black dark:text-white"
                  >
                    Archive
                  </Link>
                  <a
                  href="https://github.com/FourWindff"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 text-base uppercase tracking-[0.2em] font-bold text-black dark:text-white"
                >
                  <GitHubMark size={18} />
                  Github
                </a>
                  <button
                    onClick={() => {
                      toggleTheme()
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center gap-3 text-base uppercase tracking-[0.2em] font-bold text-black dark:text-white text-left"
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>
              </motion.aside>
              <button
                type="button"
                className="flex-1 bg-black/5 dark:bg-black/20 backdrop-blur-[1px]"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-24 lg:py-32 xl:py-48">
          <div className="flex justify-between items-end">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[40px] sm:text-[80px] lg:text-[120px] font-black uppercase tracking-tighter leading-[0.85] mix-blend-difference"
            >
              MIEREPEN
            </motion.h2>
          </div>
        </header>
      </div>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-24 border-x border-black/5 dark:border-white/5 bg-black/2 dark:bg-white/2">
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
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 leading-tight">
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

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-24 border-t border-x border-black/10 dark:border-white/10">
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
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1} / {formatArchiveDate(post.date).toUpperCase()}
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
              state={{ filter: 'blog' }}
              className="inline-block bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs py-4 px-8 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors tracking-[0.2em]"
            >
              More
            </Link>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-24 border-t border-x border-black/10 dark:border-white/10 bg-black/1 dark:bg-white/1">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/40 dark:text-white/40 mb-16 font-bold text-center">
            [ 02 // DOCS_LIBRARY ]
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 px-1 bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10">
            {latestTutorials.map((tutorial) => (
              <Link
                key={tutorial.slug}
                to={`/docs/${tutorial.slug}`}
                className="bg-[#f5f5f5] dark:bg-bg-primary-dark p-6 sm:p-8 lg:p-12 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group relative block"
              >
                <div className="flex justify-between items-start mb-12">
                  <span className="font-mono text-[10px] text-black/30 dark:text-white/30">
                    {tutorial.label.toUpperCase()} / {formatArchiveDate(tutorial.date).toUpperCase()}
                  </span>
                  <ArrowUpRight size={20} className="text-black/20 dark:text-white/20 group-hover:text-black dark:group-hover:text-white transition-colors group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <h4 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase mb-4 break-words">{tutorial.title}</h4>
                <p className="text-neutral-500 font-mono text-xs max-w-sm mb-8">{tutorial.summary}</p>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/30 dark:text-white/30">
                  {tutorial.chapters.length} chapters
                </div>
              </Link>
            ))}
          </div>
          {hasMoreTutorials ? (
            <div className="mt-16 text-center">
              <Link
                to="/archive"
                state={{ filter: 'docs' }}
                className="inline-block bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs py-4 px-8 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors tracking-[0.2em]"
              >
                More
              </Link>
            </div>
          ) : null}
        </section>

      </main>

      <footer className="px-4 sm:px-6 lg:px-12 py-10 border-t border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50">
            &copy; 2024 MIEREPEN BLOG
          </p>
        </div>
      </footer>
    </div>
  );
}

// --- Scroll to top on route change ---

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// --- Main App Component ---

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/docs/:tutorialSlug" element={<DocsTutorial />} />
        <Route path="/docs/:tutorialSlug/:chapterSlug" element={<DocsTutorial />} />
        <Route path="/archive" element={<Archive />} />
      </Routes>
    </>
  );
}
