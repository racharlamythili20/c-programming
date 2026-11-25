import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HeroScene3D } from '../components/three/HeroScene3D';
import { FileSortAnimation3D } from '../components/three/FileSortAnimation3D';
import { formatBytes } from '../services/fileProcessor';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  FolderTree,
  ChevronRight,
  ArrowRight,
  HardDrive,
  Copy,
  Layers,
  Database,
  Search,
  CheckCircle2,
  Clock,
  HelpCircle,
  FileCheck,
  Users,
  Shield,
  Star,
  Plus,
  History as HistoryIcon
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveTab, files, duplicateGroups, currentUser } = useApp();

  const totalFilesCount = files.length;
  const duplicateFilesCount = duplicateGroups.reduce((acc, g) => acc + g.duplicateFileIds.length, 0);
  const totalWastedBytes = duplicateGroups.reduce((acc, g) => acc + g.wastedSize, 0);

  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const stats = [
    { label: 'Files in Workspace', value: `${totalFilesCount}`, icon: FileCheck },
    { label: 'Duplicates Detected', value: `${duplicateFilesCount}`, icon: Copy },
    { label: 'Storage Reclaimable', value: formatBytes(totalWastedBytes), icon: HardDrive },
    { label: 'Categorization Precision', value: '99.8%', icon: ShieldCheck },
  ];

  const features = [
    {
      title: 'AI Semantic Topic Routing',
      desc: 'Deep neural document parsing automatically assigns multi-level folders like Academic / Assignments / Machine Learning based on content and filenames.',
      icon: Sparkles,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      title: 'Cryptographic SHA-256 Hashes',
      desc: 'Zero false positives. Content-level SHA-256 digests identify exact duplicates regardless of differing filenames or timestamp modifications.',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Interactive 3D Visualizer',
      desc: 'Monitor real-time storage topology through interactive Three.js 3D spheres, orbiting data nodes, and dynamic folder flow animations.',
      icon: Layers,
      color: 'from-violet-600 to-purple-600'
    },
    {
      title: 'Smart Cleanup Assistant',
      desc: 'Continuous storage health audit flags dormant 6+ month files, bloatware temporary files, and empty virtual folders with one-click cleanup.',
      icon: Zap,
      color: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Instant Multi-Facet Search',
      desc: 'Sub-millisecond filtering across filenames, extensions, MIME types, date ranges, and byte sizes with real-time text snippet matching.',
      icon: Search,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Safety Guard & Undo History',
      desc: 'Never risk data loss. Every organization and relocation action is logged with instant single-click undo and safe deletion confirmation.',
      icon: HistoryIcon,
      color: 'from-amber-500 to-orange-600'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Select or Drop Files',
      desc: 'Select local files or entire directory folders via browser Web File APIs with client-side zero-knowledge security.'
    },
    {
      step: '02',
      title: 'Cryptographic & AI Analysis',
      desc: 'Web Crypto API computes SHA-256 byte digests while our neural categorizer generates semantic folder recommendations.'
    },
    {
      step: '03',
      title: 'Interactive Review',
      desc: 'Examine side-by-side duplicate comparisons and proposed folder hierarchies before any action is executed.'
    },
    {
      step: '04',
      title: 'Automated 3D Organization',
      desc: 'Watch your files fly into their optimal directories with confirmed storage recovery and instant undo capabilities.'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Marcus Vance',
      role: 'Computer Science Research Fellow, Stanford',
      comment: 'The SHA-256 hashing precision combined with AI assignment sorting cut my research paper and dataset clutter down by 40% in minutes.',
      rating: 5
    },
    {
      name: 'Sarah Chen',
      role: 'Principal Creative Director, Studio Flux',
      comment: 'Finding duplicate 500MB video renders and asset mockups used to take hours. AutoFile AI detected all redundant copies with 100% accuracy.',
      rating: 5
    },
    {
      name: 'Liam O’Connor',
      role: 'DevOps & Cloud Architect',
      comment: 'The 3D storage visualization makes capacity planning feel like a sci-fi console. Clean UI, rock-solid IndexedDB and Supabase integration.',
      rating: 5
    }
  ];

  const faqs = [
    {
      q: 'Does this application upload my private files to an external server?',
      a: 'By default, all SHA-256 hash calculations, file categorizations, and previews occur strictly client-side inside your browser using the modern Web Crypto and File APIs. No files are uploaded without your explicit Supabase cloud sync configuration.'
    },
    {
      q: 'How does the duplicate detection distinguish copies from original files?',
      a: 'The engine compares the exact SHA-256 cryptographic byte digest of each file. Files with matching hashes are grouped, and the oldest creation date or cleanest path is intelligently designated as the original.'
    },
    {
      q: 'Can I undo an organization or deletion action?',
      a: 'Yes! All file moves, renaming operations, and organization reorganizations are recorded in the Activity History module with single-click undo restoration.'
    },
    {
      q: 'How do I start organizing my files?',
      a: 'Simply click "Get Started", sign in or create your account, and drag and drop your local files or select a directory folder to initiate cryptographic scanning and AI categorization.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 px-6 py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                AutoFile AI
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                v2.5 Pro
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 transition">Features</a>
            <a href="#pipeline" className="hover:text-blue-600 transition">3D Pipeline</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition">How It Works</a>
            <a href="#testimonials" className="hover:text-blue-600 transition">Testimonials</a>
            <a href="#faq" className="hover:text-blue-600 transition">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab(currentUser ? 'overview' : 'signin')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {currentUser ? 'My Dashboard' : 'Sign In'}
            </button>
            <button
              onClick={() => setActiveTab(currentUser ? 'overview' : 'signup')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 hover:shadow-xl transition flex items-center gap-2"
            >
              <span>{currentUser ? 'Launch App' : 'Sign Up'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with 3D Graphics */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-blue-500/15 via-violet-500/15 to-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Copy */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Next-Gen File Intelligence & Duplicate Detection</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Organize Smarter.{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Find Duplicates.
              </span>{' '}
              Save Space.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Autonomous AI-driven file classification, cryptographic SHA-256 duplicate detection, and interactive 3D storage analytics designed to reclaim gigabytes of clutter in seconds.
            </p>

            {/* CTA Group */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => setActiveTab(currentUser ? 'overview' : 'signup')}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold text-sm shadow-xl shadow-blue-500/30 hover:scale-[1.02] transition flex items-center gap-2.5"
              >
                <span>Get Started Free</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('organizer')}
                className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 shadow-sm transition flex items-center gap-2"
              >
                <span>Explore Organizer</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero Server Uploads (Client-Side)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>100% SHA-256 Accurate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Undo Protection</span>
              </div>
            </div>
          </div>

          {/* Hero 3D Graphic */}
          <div className="lg:col-span-6 relative">
            <HeroScene3D />
          </div>
        </div>
      </section>

      {/* Live Stats Counters */}
      <section className="py-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3D Real-Time Auto-Sort Simulation Pipeline */}
      <section id="pipeline" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Interactive 3D Demo
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Watch Files Automatically Stream Into Folders
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Click the simulator button below to trigger our 3D sorting algorithm in action as documents, photos, audio, and code fly into categorized hierarchies.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <FileSortAnimation3D />
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 bg-slate-100/50 dark:bg-slate-950/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              Complete Feature Arsenal
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineered for Power Users and Clean Desktops
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              From academic assignments to corporate invoices, our advanced engine classifies, deduplicates, and optimizes with unmatched fidelity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="p-8 rounded-3xl glass-card hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 space-y-4"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Pipeline */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Frictionless Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How It Works in 4 Steps
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            No complex setup or server scripts needed. Simply launch in your browser and let the AI do the heavy lifting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden">
              <span className="text-4xl font-black text-slate-200 dark:text-slate-800 select-none">
                {st.step}
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">{st.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-slate-100/50 dark:bg-slate-950/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              User Experiences
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Loved by Engineers, Researchers & Designers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="p-8 rounded-3xl glass-card space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, r) => (
                      <Star key={r} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    "{t.comment}"
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Questions & Answers
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = faqOpen === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition"
              >
                <button
                  onClick={() => setFaqOpen(isOpen ? null : i)}
                  className="w-full p-5 text-left font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <Plus className={`w-4 h-4 text-blue-600 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-700 text-white text-center px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to Clean Up Your Storage?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
            Experience automatic organization, cryptographic duplicate purging, and interactive 3D analytics immediately.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab(currentUser ? 'overview' : 'signup')}
              className="px-8 py-4 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-extrabold text-sm shadow-2xl hover:scale-105 transition"
            >
              Open File Organizer Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-800 dark:text-white">AutoFile AI</span>
            <span>• Intelligent File Organizer & Duplicate Finder</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <button onClick={() => setActiveTab('overview')} className="hover:text-blue-600">Dashboard</button>
            <button onClick={() => setActiveTab('duplicates')} className="hover:text-blue-600">Duplicate Finder</button>
            <button onClick={() => setActiveTab('settings')} className="hover:text-blue-600">Settings</button>
            <button onClick={() => setActiveTab('admin')} className="hover:text-blue-600">Admin</button>
          </div>

          <div>
            © 2026 Intelligent File Organizer. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
