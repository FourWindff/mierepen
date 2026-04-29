/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { ArrowUpRight, User } from "lucide-react";
import { getAllPosts } from "./lib/blog";
import { getAllTutorials } from "./lib/docs";
import { formatArchiveDate } from "./lib/content";
import BlogPost from "./pages/BlogPost";
import Archive from "./pages/Archive";
import DocsTutorial from "./pages/DocsTutorial";
import Header from "./components/Header";

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

// --- Home Page Component ---

function Home() {
  const posts = getAllPosts();
  const tutorials = getAllTutorials();
  const latestTutorials = tutorials.slice(0, 4);
  const hasMoreTutorials = tutorials.length > latestTutorials.length;

  return (
    <div className="theme-page min-h-screen font-sans">
      <Header variant="home" />

      <div
        className="theme-border relative border-b"
        style={{
          paddingTop: 'var(--header-shell-height, 0px)',
          paddingBottom: 'calc(var(--header-shell-height, 0px) * 2)',
        }}
      >
        <ASCIIWave />

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
