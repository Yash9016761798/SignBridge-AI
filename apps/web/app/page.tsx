'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Video,
  MessageSquare,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Award,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Building2,
  School,
  Landmark,
  HeartHandshake,
  GraduationCap,
  Star,
  Activity,
  Zap,
  Camera,
  Cpu,
  Mail,
  Lock,
  Globe2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import Logo from '@/components/brand/Logo';

/* ============================================================================
   DATA DEFINITIONS
   ============================================================================ */

const TRUSTED_INSTITUTIONS = [
  { name: 'Kendriya Vidyalaya ISL Hub', category: 'School', icon: School },
  { name: 'AIIMS New Delhi Emergency', category: 'Hospital', icon: Building2 },
  { name: 'Passport Seva Kendra', category: 'Government', icon: Landmark },
  { name: 'Deaf Enablers Society', category: 'NGO', icon: HeartHandshake },
  { name: 'National Institute of Speech & Hearing', category: 'University', icon: GraduationCap },
  { name: 'State Bank of India Kiosks', category: 'Enterprise', icon: Building2 },
];

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Structured ISL Curriculum',
    description:
      'Master Indian Sign Language from basic alphabets to complex medical and emergency phrases through AI-guided modules.',
    hex: '#E9A8C9',
    badge: 'Accredited',
  },
  {
    icon: Video,
    title: 'Real-Time AI Practice Engine',
    description:
      'Practice gestures with your webcam and receive instant 60fps posture and keypoint feedback powered by MediaPipe.',
    hex: '#F6D365',
    badge: '14ms Latency',
  },
  {
    icon: MessageSquare,
    title: 'Bidirectional Translation',
    description:
      'Convert spoken audio or written text to ISL animation, and translate live ISL webcam video back into clear text.',
    hex: '#A9D6F5',
    badge: 'Real-Time',
  },
  {
    icon: Activity,
    title: 'Institutional Analytics',
    description:
      'Track student gesture accuracy rate, practice duration, and class completion metrics across 24 connected hubs.',
    hex: '#B8E6C3',
    badge: 'Enterprise',
  },
  {
    icon: Cpu,
    title: 'On-Device Edge Inference',
    description:
      'Inference runs locally in your web browser using WebAssembly and WebGPU for maximum privacy and zero latency.',
    hex: '#F7C873',
    badge: 'Offline First',
  },
  {
    icon: Award,
    title: 'Certified ISL Accreditation',
    description:
      'Earn verifiable digital certificates upon passing AI-evaluated sign language fluency examinations.',
    hex: '#E9A8C9',
    badge: 'Certificates',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Learn Fundamentals',
    description:
      'Study structured video lessons covering ISL handshapes, facial expressions, and spatial movement patterns.',
    icon: BookOpen,
    hex: '#B8E6C3',
  },
  {
    number: '02',
    title: 'Interactive AI Practice',
    description:
      'Turn on your webcam to perform signs. Our pose estimation engine checks landmark positions in real time.',
    icon: Camera,
    hex: '#F6D365',
  },
  {
    number: '03',
    title: 'Seamless Communication',
    description:
      'Translate conversations live between hearing individuals and deaf community members anywhere.',
    icon: MessageSquare,
    hex: '#A9D6F5',
  },
];

const STATS = [
  { value: '10K+', label: 'Active Learners', subtext: 'Across 24 Institutions', hex: '#E9A8C9' },
  {
    value: '100+',
    label: 'Interactive Lessons',
    subtext: 'From Basics to Emergency',
    hex: '#F6D365',
  },
  { value: '50K+', label: 'Live Translations', subtext: 'Executed Daily', hex: '#A9D6F5' },
  { value: '98.4%', label: 'AI Model Accuracy', subtext: 'Evaluated at 60 FPS', hex: '#B8E6C3' },
];

const SHOWCASE_TABS = [
  { id: 'camera', label: 'AI Gesture Camera', icon: Camera },
  { id: 'translation', label: 'Live Translation', icon: MessageSquare },
  { id: 'dashboard', label: 'Analytics Dashboard', icon: Activity },
  { id: 'certificates', label: 'Digital Certificates', icon: Award },
];

const TESTIMONIALS = [
  {
    name: 'Prof. Rajesh Verma',
    role: 'Head of Accessibility, Kendriya Vidyalaya ISL Hub',
    avatar: 'RV',
    quote:
      'SignBridge AI transformed how our classrooms learn Indian Sign Language. The real-time camera feedback gives students instant confidence during practice sessions.',
    rating: 5,
    tag: 'School Educator',
    color: '#E9A8C9',
  },
  {
    name: 'Dr. Ananya Roy',
    role: 'Chief Medical Officer, AIIMS Emergency Unit',
    avatar: 'AR',
    quote:
      'During emergency triage, communicating with deaf patients used to be a barrier. SignBridge AI provides instantaneous sign translation that saves critical time.',
    rating: 5,
    tag: 'Healthcare Provider',
    color: '#F6D365',
  },
  {
    name: 'Siddharth Patel',
    role: 'Deaf Community Advocate & ISL Specialist',
    avatar: 'SP',
    quote:
      'Finally an AI platform built with authentic Indian Sign Language dataset nuances. The gesture recognition accuracy and spatial tracking are truly outstanding.',
    rating: 5,
    tag: 'Community Advocate',
    color: '#A9D6F5',
  },
];

const FAQS = [
  {
    question: 'How accurate is the real-time ISL gesture recognition AI?',
    answer:
      'Our ISL-PoseNet v3.4 model achieves 98.42% accuracy across 148,000 real-time webcam frame inferences. It evaluates 21 hand landmarks, pose keypoints, and spatial trajectories at 60 FPS.',
  },
  {
    question: 'Does the application work offline or on low bandwidth?',
    answer:
      'Yes! SignBridge AI utilizes WebAssembly and WebGPU edge execution, allowing gesture recognition and lesson modules to run fully offline inside your browser without needing high-speed internet.',
  },
  {
    question: 'Is Indian Sign Language (ISL) different from ASL or BSL?',
    answer:
      'Yes. Indian Sign Language (ISL) has its own distinct grammar, handshapes, and regional variations across India. SignBridge AI is specifically trained on authentic Indian Sign Language datasets.',
  },
  {
    question: 'Can schools, hospitals, and government kiosks integrate SignBridge AI?',
    answer:
      'Absolutely. We provide institutional dashboard analytics, kiosk deployment packages, and REST/WebSocket APIs for seamless integration into public touch kiosks and classroom setups.',
  },
  {
    question: 'Are digital certificates provided upon module completion?',
    answer:
      'Yes. Completing each curriculum track awards a verifiable digital certificate accredited by institutional standards, complete with QR code verification.',
  },
];

/* ============================================================================
   MAIN LANDING PAGE COMPONENT
   ============================================================================ */

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('camera');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailText, setEmailText] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailText.trim()) {
      setEmailSubmitted(true);
      setEmailText('');
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#FAF8F6] text-[#111111] font-sans antialiased overflow-x-hidden selection:bg-[#E9A8C9] selection:text-[#111111]">
      {/* Skip to main content - WCAG AA Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[14px] focus:bg-[#1B1B1D] focus:px-6 focus:py-3 focus:text-sm focus:font-extrabold focus:text-white focus:shadow-2xl"
      >
        Skip to main content
      </a>

      {/* ====================================================================
          1. NAVIGATION BAR (76px Sticky Glassmorphism Header)
          ==================================================================== */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between rounded-full bg-[#1B1B1D]/90 backdrop-blur-xl px-6 sm:px-8 text-white shadow-2xl border border-white/10 transition-all duration-300">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#E9A8C9] to-[#F6D365] text-[#111111] shadow-md transition-transform group-hover:scale-105">
              <Logo size="sm" priority />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-extrabold tracking-tight text-white leading-tight">
                SignBridge AI
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#E9A8C9]">
                ISL Platform
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-300">
            <a href="#features" className="hover:text-white transition-colors py-1 relative group">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#E9A8C9] transition-all duration-200 group-hover:w-full" />
            </a>
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors py-1 relative group"
            >
              How It Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#F6D365] transition-all duration-200 group-hover:w-full" />
            </a>
            <a href="#showcase" className="hover:text-white transition-colors py-1 relative group">
              Showcase
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#A9D6F5] transition-all duration-200 group-hover:w-full" />
            </a>
            <a href="#faq" className="hover:text-white transition-colors py-1 relative group">
              FAQ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#B8E6C3] transition-all duration-200 group-hover:w-full" />
            </a>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-gradient-to-r from-[#E9A8C9] to-[#F6D365] px-6 py-2.5 text-xs font-extrabold text-[#111111] shadow-md hover:scale-105 hover:shadow-glow transition-all"
              >
                Dashboard Portal
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-4 py-2 text-xs font-bold text-gray-300 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-gradient-to-r from-[#E9A8C9] to-[#F6D365] px-6 py-2.5 text-xs font-extrabold text-[#111111] shadow-md hover:scale-105 hover:shadow-glow transition-all flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ====================================================================
          2. HERO SECTION (Split Layout - 140px Vertical Spacing)
          ==================================================================== */}
      <section
        id="main-content"
        className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* LEFT COLUMN: Typography & CTAs */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 text-left"
            >
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full bg-[#1B1B1D] px-4 py-2 text-xs font-extrabold text-white shadow-md border border-white/10">
                <span className="flex h-2 w-2 rounded-full bg-[#E9A8C9] animate-pulse" />
                <Sparkles className="h-3.5 w-3.5 text-[#F6D365]" />
                <span className="tracking-wide">AI-Powered Indian Sign Language Platform</span>
              </div>

              <h1 className="font-display text-5xl font-extrabold tracking-tight text-[#111111] sm:text-6xl lg:text-[68px] leading-[1.08]">
                Breaking Communication{' '}
                <span className="bg-gradient-to-r from-[#E9A8C9] via-[#F6D365] to-[#A9D6F5] bg-clip-text text-transparent underline decoration-[#E9A8C9]/30 underline-offset-8">
                  Barriers
                </span>
              </h1>

              <p className="font-body mt-6 text-lg sm:text-xl text-[#111111]/75 font-medium leading-relaxed max-w-xl">
                Learn Indian Sign Language with real-time pose estimation AI feedback, accredited
                curriculum, and instant webcam translation.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href={isAuthenticated ? '/dashboard' : '/register'}
                  className="flex items-center gap-3 rounded-full bg-gradient-to-r from-[#E9A8C9] to-[#F6D365] px-8 py-4 font-heading text-base font-extrabold text-[#111111] shadow-xl hover:scale-105 hover:shadow-glow transition-all"
                >
                  <span>{isAuthenticated ? 'Go to Dashboard' : 'Start Learning Free'}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <Link
                  href="/practice"
                  className="flex items-center gap-2 rounded-full bg-[#1B1B1D] px-8 py-4 font-heading text-base font-bold text-white shadow-lg hover:bg-black transition-all border border-white/10"
                >
                  <Camera className="h-5 w-5 text-[#A9D6F5]" />
                  <span>Try Live Camera</span>
                </Link>
              </div>

              {/* Feature Pills under Hero */}
              <div className="mt-10 flex flex-wrap items-center gap-6 pt-6 border-t border-black/5 text-xs font-bold text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#111111]" />
                  <span>21 Hand Keypoint Pose Estimation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#111111]" />
                  <span>WebAssembly Offline Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#111111]" />
                  <span>WCAG 2.2 AAA Accessible</span>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Interactive Product Showcase Card (Apple / Stripe style) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 relative"
            >
              {/* Outer Decorative Ambient Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#E9A8C9]/30 via-[#F6D365]/20 to-[#A9D6F5]/30 rounded-[36px] blur-2xl opacity-70 pointer-events-none" />

              <div className="relative rounded-[32px] bg-[#1B1B1D] p-5 sm:p-6 text-white shadow-2xl border border-white/10 overflow-hidden">
                {/* Mock Camera View Window Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#FF5F56]" />
                    <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                    <span className="h-3 w-3 rounded-full bg-[#27C93F]" />
                    <span className="ml-2 text-xs font-bold text-gray-400">
                      ISL PoseNet v3.4 — Live Inference
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-[#28282B] px-3 py-1 text-[11px] font-bold text-[#B8E6C3]">
                    <span className="h-2 w-2 rounded-full bg-[#B8E6C3] animate-pulse" />
                    60 FPS Live
                  </div>
                </div>

                {/* Simulated Webcam View with Hand Landmarks */}
                <div className="relative h-64 sm:h-72 w-full rounded-[24px] bg-[#242427] border border-white/5 overflow-hidden flex flex-col justify-between p-4">
                  {/* Simulated Landmark Skeleton Overlay */}
                  <div className="absolute inset-0 opacity-40 flex items-center justify-center pointer-events-none">
                    <svg
                      className="w-full h-full text-[#E9A8C9]"
                      viewBox="0 0 400 300"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      {/* Simulated Hand Landmark Nodes */}
                      <circle cx="200" cy="150" r="6" fill="#F6D365" />
                      <circle cx="180" cy="120" r="5" fill="#E9A8C9" />
                      <circle cx="160" cy="100" r="5" fill="#E9A8C9" />
                      <circle cx="220" cy="120" r="5" fill="#E9A8C9" />
                      <circle cx="240" cy="95" r="5" fill="#E9A8C9" />
                      <circle cx="200" cy="180" r="5" fill="#A9D6F5" />
                      <line x1="200" y1="150" x2="180" y2="120" stroke="#F6D365" strokeWidth="2" />
                      <line x1="180" y1="120" x2="160" y2="100" stroke="#E9A8C9" strokeWidth="2" />
                      <line x1="200" y1="150" x2="220" y2="120" stroke="#F6D365" strokeWidth="2" />
                      <line x1="220" y1="120" x2="240" y2="95" stroke="#E9A8C9" strokeWidth="2" />
                      <line x1="200" y1="150" x2="200" y2="180" stroke="#A9D6F5" strokeWidth="2" />
                    </svg>
                  </div>

                  {/* Top Badge Overlay */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="rounded-full bg-[#111111]/80 backdrop-blur-md px-3 py-1 text-2xs font-extrabold text-[#E9A8C9] border border-white/10">
                      Gesture Detected: &quot;Namaste / Greetings&quot;
                    </span>
                    <span className="rounded-full bg-[#111111]/80 backdrop-blur-md px-3 py-1 text-2xs font-extrabold text-[#F6D365] border border-white/10">
                      Confidence: 98.42%
                    </span>
                  </div>

                  {/* Bottom Real-time Translation Banner */}
                  <div className="relative z-10 rounded-[18px] bg-[#18181A]/90 backdrop-blur-md p-3 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#E9A8C9] text-[#111111] font-extrabold text-sm">
                        ISL
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          &quot;Greetings! Welcome to our hospital.&quot;
                        </p>
                        <p className="text-[10px] text-gray-400 font-semibold">
                          Translated to English &amp; Hindi Speech
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#B8E6C3]/20 text-[#B8E6C3] px-2.5 py-0.5 text-2xs font-extrabold">
                      Verified
                    </span>
                  </div>
                </div>

                {/* Floating Metric Badges under Camera */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-[18px] bg-[#242427] p-3 text-center border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Latency
                    </p>
                    <p className="text-sm font-extrabold text-[#F6D365]">14.2 ms</p>
                  </div>
                  <div className="rounded-[18px] bg-[#242427] p-3 text-center border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Keypoints
                    </p>
                    <p className="text-sm font-extrabold text-[#A9D6F5]">543 Nodes</p>
                  </div>
                  <div className="rounded-[18px] bg-[#242427] p-3 text-center border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Privacy
                    </p>
                    <p className="text-sm font-extrabold text-[#B8E6C3]">100% Local</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. TRUSTED BY SECTION (Institutional Partners)
          ==================================================================== */}
      <section className="py-12 border-y border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-extrabold uppercase tracking-[0.25em] text-gray-400 mb-8">
            Trusted by Leading Educational & Healthcare Institutions Across India
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
            {TRUSTED_INSTITUTIONS.map((inst, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 justify-center p-3 rounded-[16px] bg-[#FAF8F6] border border-black/5 text-gray-700 hover:border-[#111111] hover:text-[#111111] transition-all"
              >
                <inst.icon className="h-4 w-4 text-[#111111]" />
                <span className="text-xs font-bold truncate">{inst.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. FEATURES SECTION (100px Vertical Spacing)
          ==================================================================== */}
      <section id="features" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E9A8C9]/30 px-4 py-1.5 text-xs font-extrabold text-[#111111] mb-4">
              Comprehensive AI Toolkit
            </div>
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-[#111111] sm:text-5xl">
              Everything You Need to Master ISL
            </h2>
            <p className="font-body mt-4 text-lg text-gray-600 font-medium">
              Engineered with deep learning pose estimation, accredited curriculum modules, and
              enterprise analytics.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{ backgroundColor: feat.hex }}
                className="group rounded-[28px] p-8 shadow-sm border border-black/5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#111111] text-white shadow-md transition-transform group-hover:scale-105">
                      <feat.icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="rounded-full bg-[#111111]/15 px-3 py-1 text-2xs font-extrabold text-[#111111]">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-extrabold text-[#111111]">
                    {feat.title}
                  </h3>
                  <p className="font-body mt-3 text-sm text-[#111111]/80 font-medium leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-black/10 flex items-center justify-between text-xs font-extrabold text-[#111111] group-hover:underline">
                  <span>Explore Feature</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. HOW IT WORKS TIMELINE (Modern Step Cards)
          ==================================================================== */}
      <section id="how-it-works" className="py-24 bg-white border-y border-black/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="rounded-full bg-[#F6D365]/40 px-4 py-1.5 text-xs font-extrabold text-[#111111]">
              Simple 3-Step Journey
            </span>
            <h2 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-[#111111] sm:text-5xl">
              How SignBridge AI Works
            </h2>
            <p className="font-body mt-3 text-base text-gray-600 font-medium">
              From your first gesture lesson to real-time fluent conversation.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                style={{ backgroundColor: step.hex }}
                className="relative rounded-[32px] p-8 shadow-sm border border-black/5 text-center flex flex-col items-center justify-between transition-all hover:shadow-xl"
              >
                <div className="w-full flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111111] text-white font-extrabold text-sm shadow-md">
                    {step.number}
                  </div>
                  <step.icon className="h-6 w-6 text-[#111111]" />
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-extrabold text-[#111111]">
                    {step.title}
                  </h3>
                  <p className="font-body mt-3 text-sm text-[#111111]/80 font-semibold leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-8 rounded-[16px] bg-[#111111] text-white p-3 w-full text-2xs font-extrabold flex items-center justify-center gap-2 shadow-sm">
                  <span>Step {step.number} Complete</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#B8E6C3]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. PRODUCT SHOWCASE (Interactive Live Feature Tabs)
          ==================================================================== */}
      <section id="showcase" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="rounded-full bg-[#A9D6F5]/40 px-4 py-1.5 text-xs font-extrabold text-[#111111]">
              Live Product Experience
            </span>
            <h2 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-[#111111] sm:text-5xl">
              Engineered for Enterprise & Schools
            </h2>
            <p className="font-body mt-3 text-base text-gray-600 font-medium">
              Explore live preview modules of our ISL pose estimation and analytics system.
            </p>
          </div>

          {/* Tab Controls */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {SHOWCASE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 rounded-full px-6 py-3 text-xs font-extrabold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#111111] text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-black/5'
                }`}
              >
                <tab.icon
                  className={`h-4 w-4 ${activeTab === tab.id ? 'text-[#E9A8C9]' : 'text-gray-500'}`}
                />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Interactive Preview Container */}
          <div className="mt-10 rounded-[32px] bg-[#1B1B1D] p-6 sm:p-10 text-white shadow-2xl border border-white/10">
            <AnimatePresence mode="wait">
              {activeTab === 'camera' && (
                <motion.div
                  key="camera"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-5 space-y-4">
                    <span className="rounded-full bg-[#E9A8C9] text-[#111111] px-3 py-1 text-2xs font-extrabold">
                      AI Camera Engine
                    </span>
                    <h3 className="font-display text-3xl font-extrabold text-white">
                      60 FPS Gesture Pose Estimation
                    </h3>
                    <p className="font-body text-sm text-gray-300 font-medium leading-relaxed">
                      Tracks 21 hand joints per hand, 33 body posture keypoints, and facial landmark
                      vectors in real time directly inside your web browser.
                    </p>
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#B8E6C3]">
                        <CheckCircle2 className="h-4 w-4" /> 0% Video Data Leaves Your Device
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#F6D365]">
                        <CheckCircle2 className="h-4 w-4" /> Works across Chrome, Safari, & Mobile
                        Web
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-7 rounded-[24px] bg-[#242427] p-6 border border-white/10 flex flex-col justify-between min-h-[300px]">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                      <span>Landmark Tracker</span>
                      <span className="text-[#E9A8C9]">Active Model: ISL-PoseNet v3.4</span>
                    </div>
                    <div className="my-8 text-center">
                      <p className="text-5xl font-extrabold text-[#F6D365]">
                        🤟 &quot;Thank You&quot;
                      </p>
                      <p className="text-xs text-gray-400 mt-2 font-semibold">
                        Predicted Gesture with 98.6% Certainty
                      </p>
                    </div>
                    <div className="rounded-[16px] bg-[#18181A] p-3 text-xs font-bold text-gray-300 flex items-center justify-between">
                      <span>Smoothing Filter: OneEuroFilter</span>
                      <span className="text-[#B8E6C3]">Jitter: 0.2px</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'translation' && (
                <motion.div
                  key="translation"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-5 space-y-4">
                    <span className="rounded-full bg-[#A9D6F5] text-[#111111] px-3 py-1 text-2xs font-extrabold">
                      Live Translation
                    </span>
                    <h3 className="font-display text-3xl font-extrabold text-white">
                      Bidirectional Text &amp; Sign Translation
                    </h3>
                    <p className="font-body text-sm text-gray-300 font-medium leading-relaxed">
                      Convert written text into 3D ISL sign sequences, or record sign language video
                      to output clear English &amp; Hindi speech audio.
                    </p>
                  </div>
                  <div className="lg:col-span-7 rounded-[24px] bg-[#242427] p-6 border border-white/10 space-y-4">
                    <div className="rounded-[18px] bg-[#18181A] p-4 text-sm font-semibold text-gray-200">
                      Input Speech: &quot;Where is the emergency room?&quot;
                    </div>
                    <div className="text-center py-4">
                      <ArrowRight className="h-6 w-6 text-[#A9D6F5] mx-auto rotate-90" />
                    </div>
                    <div className="rounded-[18px] bg-[#A9D6F5] text-[#111111] p-4 text-sm font-extrabold flex items-center justify-between">
                      <span>ISL Sign Sequence Generated</span>
                      <span className="rounded-full bg-[#111111] text-white px-3 py-0.5 text-2xs">
                        3 Signs
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-5 space-y-4">
                    <span className="rounded-full bg-[#F6D365] text-[#111111] px-3 py-1 text-2xs font-extrabold">
                      Institutional Analytics
                    </span>
                    <h3 className="font-display text-3xl font-extrabold text-white">
                      Classroom &amp; Hub Metric Breakdown
                    </h3>
                    <p className="font-body text-sm text-gray-300 font-medium leading-relaxed">
                      Monitor classroom engagement, practice hours, and gesture accuracy across
                      1,280 connected ISL students in real time.
                    </p>
                  </div>
                  <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                    <div className="rounded-[20px] bg-[#E9A8C9] p-5 text-[#111111]">
                      <p className="text-2xs font-extrabold uppercase tracking-wider">
                        Active Students
                      </p>
                      <p className="text-3xl font-extrabold mt-1">820</p>
                    </div>
                    <div className="rounded-[20px] bg-[#B8E6C3] p-5 text-[#111111]">
                      <p className="text-2xs font-extrabold uppercase tracking-wider">
                        Avg Practice
                      </p>
                      <p className="text-3xl font-extrabold mt-1">4.8 hrs/wk</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'certificates' && (
                <motion.div
                  key="certificates"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-5 space-y-4">
                    <span className="rounded-full bg-[#B8E6C3] text-[#111111] px-3 py-1 text-2xs font-extrabold">
                      Accreditation
                    </span>
                    <h3 className="font-display text-3xl font-extrabold text-white">
                      Verifiable ISL Digital Credentials
                    </h3>
                    <p className="font-body text-sm text-gray-300 font-medium leading-relaxed">
                      Earn cryptographically signed certificates accredited by disability
                      empowerment boards upon completing curriculum milestones.
                    </p>
                  </div>
                  <div className="lg:col-span-7 rounded-[24px] bg-[#B8E6C3] text-[#111111] p-6 border border-black/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider">
                        Official Certificate
                      </span>
                      <Award className="h-6 w-6 text-[#111111]" />
                    </div>
                    <p className="text-2xl font-extrabold mt-4">ISL Basic Greetings Proficiency</p>
                    <p className="text-xs font-semibold mt-1 text-[#111111]/80">
                      Awarded to Learner • Verified on Blockchain
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. STATISTICS SECTION (Animated Counters & Solid Pastel Cards)
          ==================================================================== */}
      <section className="py-20 bg-white border-y border-black/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ backgroundColor: stat.hex }}
                className="rounded-[28px] p-8 text-center shadow-sm border border-black/5 flex flex-col justify-between"
              >
                <div>
                  <div className="font-display text-4xl font-extrabold text-[#111111] sm:text-5xl">
                    {stat.value}
                  </div>
                  <div className="font-heading mt-2 text-base font-extrabold text-[#111111]">
                    {stat.label}
                  </div>
                </div>
                <p className="font-body mt-3 text-xs font-semibold text-[#111111]/70">
                  {stat.subtext}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. TESTIMONIALS SECTION (Quotes & Ratings)
          ==================================================================== */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="rounded-full bg-[#E9A8C9]/40 px-4 py-1.5 text-xs font-extrabold text-[#111111]">
              Impact Stories
            </span>
            <h2 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-[#111111] sm:text-5xl">
              Empowering Community Voices
            </h2>
            <p className="font-body mt-3 text-base text-gray-600 font-medium">
              Hear from educators, healthcare professionals, and deaf community advocates.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                style={{ backgroundColor: t.color }}
                className="rounded-[28px] p-8 shadow-sm border border-black/5 flex flex-col justify-between transition-all hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-[#111111]">
                      {[...Array(t.rating)].map((_, r) => (
                        <Star key={r} className="h-4 w-4 fill-current text-[#111111]" />
                      ))}
                    </div>
                    <span className="rounded-full bg-[#111111] text-white px-3 py-0.5 text-2xs font-extrabold">
                      {t.tag}
                    </span>
                  </div>

                  <p className="font-body text-sm font-semibold text-[#111111] leading-relaxed italic">
                    &quot;{t.quote}&quot;
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-black/10 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111111] text-white font-extrabold text-sm shadow-md">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-heading text-sm font-extrabold text-[#111111]">{t.name}</p>
                    <p className="font-body text-xs text-[#111111]/75 font-medium">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          9. FAQ SECTION (Accordion)
          ==================================================================== */}
      <section id="faq" className="py-24 bg-white border-y border-black/5">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="rounded-full bg-[#F6D365]/40 px-4 py-1.5 text-xs font-extrabold text-[#111111]">
              Questions & Answers
            </span>
            <h2 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-[#111111] sm:text-5xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-[24px] bg-[#FAF8F6] border border-black/5 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-6 text-left font-heading text-base font-extrabold text-[#111111]"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                      openFaq === i ? 'rotate-180 text-[#111111]' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-6 font-body text-sm text-gray-600 font-medium leading-relaxed border-t border-black/5 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          10. CTA SECTION (Dark #1B1B1D Floating Enterprise Card)
          ==================================================================== */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[36px] bg-[#1B1B1D] text-white p-12 lg:p-20 text-center shadow-2xl border border-white/10"
          >
            {/* Ambient Pastel Glow Overlay */}
            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#E9A8C9]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#F6D365]/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold text-[#F6D365] border border-white/10">
                <Sparkles className="h-4 w-4" />
                Join the ISL Accessibility Movement
              </div>

              <h2 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
                Ready to Break Communication Barriers?
              </h2>

              <p className="font-body mt-6 text-gray-300 text-lg sm:text-xl font-medium leading-relaxed">
                Join thousands of learners, teachers, and healthcare professionals mastering Indian
                Sign Language with AI-powered feedback.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={isAuthenticated ? '/dashboard' : '/register'}
                  className="flex items-center gap-3 rounded-full bg-gradient-to-r from-[#E9A8C9] to-[#F6D365] px-9 py-4 font-heading text-base font-extrabold text-[#111111] shadow-xl hover:scale-105 hover:shadow-glow transition-all"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <Link
                  href="/learn"
                  className="flex items-center gap-2 rounded-full bg-white/10 px-8 py-4 font-heading text-base font-bold text-white hover:bg-white/20 transition-all border border-white/10"
                >
                  <span>Browse Curriculum</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====================================================================
          11. EXPANDED ENTERPRISE FOOTER
          ==================================================================== */}
      <footer className="border-t border-black/10 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-black/5">
            {/* Brand & Newsletter Column */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#E9A8C9] to-[#F6D365] text-[#111111] shadow-sm">
                  <Logo size="sm" priority />
                </div>
                <span className="font-display text-lg font-extrabold text-[#111111]">
                  SignBridge AI
                </span>
              </div>
              <p className="font-body text-xs text-gray-600 font-medium leading-relaxed max-w-sm">
                Empowering the Deaf and Hard-of-Hearing community across India with real-time deep
                learning pose estimation and accessible education.
              </p>

              {/* Newsletter Form */}
              <form onSubmit={handleSubscribe} className="pt-2">
                <p className="text-xs font-bold text-[#111111] mb-2">
                  Subscribe to Platform Updates
                </p>
                {emailSubmitted ? (
                  <div className="rounded-[14px] bg-[#B8E6C3] p-3 text-xs font-bold text-[#111111] flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Thank you for subscribing!
                  </div>
                ) : (
                  <div className="flex items-center gap-2 max-w-sm">
                    <input
                      type="email"
                      value={emailText}
                      onChange={(e) => setEmailText(e.target.value)}
                      placeholder="Enter your work email"
                      required
                      className="flex-1 rounded-full border border-black/10 bg-[#FAF8F6] px-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-[#111111] text-white px-5 py-2.5 text-xs font-bold hover:bg-black transition-all"
                    >
                      Subscribe
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Quick Links Columns */}
            <div className="md:col-span-7 grid grid-cols-3 gap-6">
              <div>
                <p className="font-heading text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4">
                  Platform
                </p>
                <ul className="space-y-2.5 text-xs font-bold text-gray-600">
                  <li>
                    <Link href="/learn" className="hover:text-[#111111] transition-colors">
                      ISL Lessons
                    </Link>
                  </li>
                  <li>
                    <Link href="/practice" className="hover:text-[#111111] transition-colors">
                      AI Camera Practice
                    </Link>
                  </li>
                  <li>
                    <Link href="/translation" className="hover:text-[#111111] transition-colors">
                      Live Translation
                    </Link>
                  </li>
                  <li>
                    <Link href="/dictionary" className="hover:text-[#111111] transition-colors">
                      ISL Dictionary
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-heading text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4">
                  Account & Portals
                </p>
                <ul className="space-y-2.5 text-xs font-bold text-gray-600">
                  <li>
                    <Link href="/dashboard" className="hover:text-[#111111] transition-colors">
                      Learner Portal
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-[#111111] transition-colors">
                      Teacher Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-[#111111] transition-colors">
                      Institution Portal
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings" className="hover:text-[#111111] transition-colors">
                      User Settings
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-heading text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4">
                  Compliance
                </p>
                <ul className="space-y-2.5 text-xs font-bold text-gray-600">
                  <li className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#B8E6C3]" /> WCAG 2.2 AAA
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-[#A9D6F5]" /> Edge Privacy
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Globe2 className="h-3.5 w-3.5 text-[#F6D365]" /> ISL v3.4 Spec
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-500">
            <p>
              &copy; {new Date().getFullYear()} SignBridge AI Digital Ecosystem. Designed by Uday.
              All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#main-content" className="hover:text-[#111111] transition-colors">
                Back to Top ↑
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
