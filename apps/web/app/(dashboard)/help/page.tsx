'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  MessageSquare,
  Mail,
  FileText,
  ChevronDown,
  Send,
  Loader2,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Video,
  Settings,
  Shield,
} from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';

const faqs = [
  {
    question: 'How do I start learning ISL?',
    answer:
      'Navigate to the Learn ISL section from the sidebar. Choose a course that matches your level and start with the first module. Each lesson includes video demonstrations and interactive quizzes.',
  },
  {
    question: 'How does AI-powered practice work?',
    answer:
      'The AI Practice feature uses your camera to detect hand signs in real-time. It compares your signs against our trained model and provides instant feedback on accuracy and form.',
  },
  {
    question: 'Can I translate text to sign language?',
    answer:
      'Yes! The Translation feature converts text into animated sign language representations. Simply type or paste your text and click Translate to see the result.',
  },
  {
    question: 'How do I earn certificates?',
    answer:
      'Complete all modules and pass the final assessment of any course to earn a certificate. Your certificates are stored in the Certificates section and include a unique verification code.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes, we use industry-standard encryption and Firebase Authentication to secure your data. We never share your personal information with third parties.',
  },
];

const supportLinks = [
  {
    label: 'Documentation',
    icon: BookOpen,
    href: '#',
    description: 'Browse our comprehensive guides',
  },
  { label: 'Video Tutorials', icon: Video, href: '#', description: 'Watch step-by-step tutorials' },
  { label: 'Privacy Policy', icon: Shield, href: '#', description: 'Review our privacy practices' },
  {
    label: 'Account Settings',
    icon: Settings,
    href: '/settings',
    description: 'Manage your account',
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>('general');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendFeedback = async () => {
    if (!feedback.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
    setFeedback('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Help & Support"
        description="Find answers and get help"
        icon={HelpCircle}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-card bg-white p-6 shadow-card dark:bg-surface-900"
          >
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-1 text-sm text-surface-500">Quick answers to common questions</p>
            <div className="mt-4 space-y-2">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-[16px] border border-surface-200 dark:border-surface-700"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between p-4 text-left"
                    aria-expanded={openFaq === i}
                  >
                    <span className="text-sm font-semibold text-surface-900 dark:text-white">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 flex-shrink-0 text-surface-400 transition-transform ${
                        openFaq === i ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm text-surface-600 dark:text-surface-400">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-card bg-white p-6 shadow-card dark:bg-surface-900"
          >
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">
              Send Us a Message
            </h2>
            <p className="mt-1 text-sm text-surface-500">
              Describe your issue or suggestion and we&apos;ll get back to you
            </p>

            {sent ? (
              <div className="mt-6 flex items-center gap-3 rounded-[16px] border border-success-100 bg-success-50 p-4 dark:border-success-800 dark:bg-success-500/10">
                <CheckCircle2 className="h-5 w-5 text-success-500" />
                <p className="text-sm font-medium text-success-700 dark:text-success-400">
                  Message sent! We&apos;ll respond within 24 hours.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
                    Type
                  </label>
                  <div className="mt-2 flex gap-2">
                    {(['general', 'bug', 'feature'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFeedbackType(type)}
                        className={`rounded-[12px] px-3 py-1.5 text-xs font-medium transition-colors ${
                          feedbackType === type
                            ? 'bg-gradient-brand-soft text-primary-700 dark:text-primary-400'
                            : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700'
                        }`}
                      >
                        {type === 'general'
                          ? 'General'
                          : type === 'bug'
                            ? 'Bug Report'
                            : 'Feature Request'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
                    Message
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    placeholder="Tell us what's on your mind..."
                    className="mt-2 block w-full rounded-[18px] border border-surface-200 px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-surface-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900 dark:text-white dark:placeholder:text-surface-500"
                  />
                </div>
                <button
                  onClick={handleSendFeedback}
                  disabled={sending || !feedback.trim()}
                  className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-card bg-white p-6 shadow-card dark:bg-surface-900"
          >
            <h3 className="text-sm font-bold text-surface-900 dark:text-white">Quick Links</h3>
            <div className="mt-3 space-y-2">
              {supportLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="group flex items-center gap-3 rounded-[14px] p-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-surface-100 text-surface-500 transition-colors group-hover:bg-gradient-brand-soft group-hover:text-primary-600 dark:bg-surface-800 dark:text-surface-400">
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">
                      {link.label}
                    </p>
                    <p className="text-xs text-surface-500">{link.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-surface-300 dark:text-surface-600" />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-card bg-white p-6 shadow-card dark:bg-surface-900"
          >
            <h3 className="text-sm font-bold text-surface-900 dark:text-white">Contact Us</h3>
            <div className="mt-3 space-y-3">
              <a
                href="mailto:support@signbridge.ai"
                className="flex items-center gap-3 rounded-[14px] p-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800"
              >
                <Mail className="h-5 w-5 text-surface-400" />
                <div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">
                    Email Support
                  </p>
                  <p className="text-xs text-surface-500">support@signbridge.ai</p>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 rounded-[14px] p-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800"
              >
                <MessageSquare className="h-5 w-5 text-surface-400" />
                <div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">
                    Live Chat
                  </p>
                  <p className="text-xs text-surface-500">Available Mon-Fri, 9am-6pm</p>
                </div>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-card bg-gradient-brand p-6 relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
            <div className="relative z-10">
              <FileText className="h-6 w-6 text-surface-900" />
              <h3 className="mt-2 text-sm font-bold text-surface-900">Need more help?</h3>
              <p className="mt-1 text-xs text-surface-800/70">
                Check our comprehensive documentation for detailed guides and API references.
              </p>
              <a
                href="#"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-surface-900 hover:underline"
              >
                View Docs <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
