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
import AutoHideHeaderShell from "./components/AutoHideHeaderShell";

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
      className="absolute inset-0 bg-linear-to-b from-[#e7e1d7] to-bg-primary dark:from-[#151513] dark:to-bg-primary-dark font-mono text-[10px] leading-tight overflow-hidden select-none"
      aria-hidden="true"
    >
      <pre className="theme-text-muted absolute inset-0 w-full h-full whitespace-pre overflow-hidden bg-transparent opacity-80">
        {generateBeach()}
      </pre>
      <pre className="theme-text-dim absolute inset-0 w-full h-full whitespace-pre overflow-hidden bg-transparent opacity-50">
        {generateASCII(0.08, 12, 4, 0.02)}
      </pre>
      <pre className="theme-text-muted absolute inset-0 w-full h-full whitespace-pre overflow-hidden bg-transparent opacity-70">
        {generateASCII(0.12, 6, 3, 0.04)}
      </pre>
      <pre className="theme-text-soft absolute inset-0 w-full h-full whitespace-pre overflow-hidden bg-transparent opacity-100">
        {generateASCII(0.18, 2, 2, 0.06)}
      </pre>
      <div className="absolute inset-0 bg-linear-to-r from-bg-primary/30 via-transparent to-bg-primary/30 dark:from-bg-primary-dark/30 dark:to-bg-primary-dark/30" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-bg-primary/70 dark:to-bg-primary-dark/70" />
    </div>
  );
};

// --- Navigation Item ---

const NavItem = ({ label, to }: { label: string; to: string }) => (
  <Link
    to={to}
    className="theme-text-primary text-sm uppercase tracking-[0.2em] font-bold mix-blend-difference hover:opacity-70 transition-opacity"
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
  const backdropGradient =
    theme === "dark"
      ? "linear-gradient(90deg, rgba(15,16,16,0.52) 0%, rgba(15,16,16,0.34) 32%, rgba(15,16,16,0.18) 68%, rgba(15,16,16,0.08) 100%)"
      : "linear-gradient(90deg, rgba(22,22,21,0.18) 0%, rgba(22,22,21,0.11) 32%, rgba(22,22,21,0.06) 68%, rgba(22,22,21,0.03) 100%)";

  return (
    <div className="theme-page min-h-screen font-sans">
      <AutoHideHeaderShell
        freeze={isMenuOpen}
        reserveSpace={false}
        shellClassName="theme-header-shell-home"
      >
        <nav className="relative z-10">
          <div className="flex items-center px-4 sm:px-6 xl:px-12 2xl:px-16 py-6">
            <button
              className="theme-text-primary mr-3 p-4 mix-blend-difference md:hidden"
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
                className="theme-text-primary flex items-center gap-2 text-sm uppercase tracking-[0.2em] font-bold mix-blend-difference hover:opacity-70 transition-opacity"
              >
                <GitHubMark size={16} />
                Github
              </a>
              <button
                onClick={toggleTheme}
                className="theme-text-primary p-2 mix-blend-difference hover:opacity-70 transition-opacity"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </nav>
      </AutoHideHeaderShell>

      <div
        className="theme-border relative border-b"
        style={{
          paddingTop: 'var(--header-shell-height, 0px)',
          paddingBottom: 'calc(var(--header-shell-height, 0px) * 2)',
        }}
      >
        <ASCIIWave />

        {/* Mobile menu overlay (Home) */}
        <AnimatePresence>
          {isMenuOpen ? (
            <motion.div
              key="home-mobile-menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-50 overflow-hidden"
            >
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="absolute inset-0 backdrop-blur-[1px]"
                style={{ background: backdropGradient }}
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="relative z-10 h-full w-[min(82vw,22rem)]"
              >
                <aside className="theme-panel theme-border h-full w-full border-r">
                  <div className="theme-border flex items-center gap-3 px-4 sm:px-6 py-6 border-b">
                    <button
                      className="theme-text-primary p-4"
                      onClick={() => setIsMenuOpen(false)}
                      aria-label="Close menu"
                    >
                      <X size={24} />
                    </button>
                    <div className="theme-text-primary flex items-center gap-3 text-xl font-black uppercase tracking-tighter">
                      <LogoMark className="block h-9 w-9 shrink-0" />
                      Mierepen
                    </div>
                  </div>
                  <div className="flex flex-col px-4 sm:px-6 py-8 gap-8">
                    <Link
                      to="/archive"
                      onClick={() => setIsMenuOpen(false)}
                      className="theme-text-primary text-base uppercase tracking-[0.2em] font-bold"
                    >
                      Archive
                    </Link>
                    <a
                      href="https://github.com/FourWindff"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMenuOpen(false)}
                      className="theme-text-primary flex items-center gap-3 text-base uppercase tracking-[0.2em] font-bold"
                    >
                      <GitHubMark size={18} />
                      Github
                    </a>
                    <button
                      onClick={() => {
                        toggleTheme()
                        setIsMenuOpen(false)
                      }}
                      className="theme-text-primary flex items-center gap-3 text-base uppercase tracking-[0.2em] font-bold text-left"
                      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                  </div>
                </aside>
              </motion.div>
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
        <section className="theme-border-subtle theme-surface-soft max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-24 border-x">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4">
              <h3 className="theme-text-muted font-mono text-[10px] uppercase tracking-[0.2em] mb-6 font-bold flex items-center gap-2">
                <span className="theme-rule w-4 h-px"></span> IDENTITY_MODULE
              </h3>
              <div className="theme-surface theme-border-strong w-32 h-32 border flex items-center justify-center mb-6">
                <User size={48} className="theme-text-faint" />
              </div>
            </div>
            <div className="lg:col-span-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 leading-tight">
                I'm a digital architect bridging the gap between <span className="theme-text-secondary italic">low-fidelity aesthetics</span> and <span className="theme-text-secondary italic">high-performance systems.</span>
              </h2>
              <div className="theme-text-tertiary prose prose-invert max-w-2xl font-mono text-sm leading-relaxed space-y-4">
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

        <section className="theme-border max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-24 border-t border-x">
          <h3 className="theme-text-muted font-mono text-[10px] uppercase tracking-[0.3em] mb-16 font-bold text-center">
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
                  className="theme-border-strong theme-border-active pt-8 border-t transition-colors cursor-pointer group"
                >
                  <div className="theme-text-muted font-mono text-[10px] uppercase tracking-widest mb-6 font-bold">
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1} / {formatArchiveDate(post.date).toUpperCase()}
                  </div>
                  <h2 className="theme-group-hover-soft text-2xl font-bold leading-tight mb-4 transition-colors">
                    {post.title}
                  </h2>
                  <p className="theme-text-tertiary text-sm leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="theme-text-dim flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest font-bold">
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
              className="theme-button-primary inline-block font-black uppercase text-xs py-4 px-8 tracking-[0.2em]"
            >
              More
            </Link>
          </div>
        </section>

        <section className="theme-border theme-surface max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-24 border-t border-x">
          <h3 className="theme-text-muted font-mono text-[10px] uppercase tracking-[0.3em] mb-16 font-bold text-center">
            [ 02 // DOCS_LIBRARY ]
          </h3>
          <div className="theme-surface theme-border grid grid-cols-1 md:grid-cols-2 gap-1 px-1 border">
            {latestTutorials.map((tutorial) => (
              <Link
                key={tutorial.slug}
                to={`/docs/${tutorial.slug}`}
                className="theme-panel theme-surface-hover p-6 sm:p-8 lg:p-12 group relative block"
              >
                <div className="flex justify-between items-start mb-12">
                  <span className="theme-text-dim font-mono text-[10px]">
                    {tutorial.label.toUpperCase()} / {formatArchiveDate(tutorial.date).toUpperCase()}
                  </span>
                  <ArrowUpRight size={20} className="theme-text-faint theme-group-hover-primary transition-colors group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <h4 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase mb-4 break-words">{tutorial.title}</h4>
                <p className="theme-text-tertiary font-mono text-xs max-w-sm mb-8">{tutorial.summary}</p>
                <div className="theme-text-dim font-mono text-[10px] uppercase tracking-[0.2em]">
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
                className="theme-button-primary inline-block font-black uppercase text-xs py-4 px-8 tracking-[0.2em]"
              >
                More
              </Link>
            </div>
          ) : null}
        </section>

      </main>

      <footer className="theme-border px-4 sm:px-6 lg:px-12 py-10 border-t">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <p className="theme-text-muted font-mono text-[10px] uppercase tracking-widest">
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
