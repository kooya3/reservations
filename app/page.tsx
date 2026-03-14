"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GuestForm } from "@/components/forms/GuestForm";
import { PasskeyModal } from "@/components/PasskeyModal";
import { NewsletterSection } from "@/components/NewsletterSection";

const Home = ({ searchParams }: SearchParamProps) => {
  const params = use(searchParams);
  const isAdmin = params?.admin === "true";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {isAdmin && <PasskeyModal />}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl animate-pulse delay-700" />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <section className="remove-scrollbar container my-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sub-container max-w-[600px] glass-morphism backdrop-blur-xl bg-slate-900/40 border border-amber-500/20 rounded-2xl p-10 shadow-2xl"
        >
          {/* Logo and Branding */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 blur-xl opacity-50" />
                <h1 className="relative text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                  AM | PM Lounge
                </h1>
              </div>
            </div>
            <p className="text-slate-400 text-sm">Experience Fine Dining Excellence</p>
          </motion.div>

          {/* Reservation Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">
                Reserve Your Table
              </h2>
              <p className="text-slate-400 text-sm">
                Join us for an unforgettable culinary experience
              </p>
            </div>

            <GuestForm />
          </motion.div>

          {/* Footer Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 pt-6 border-t border-slate-700/50"
          >
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-500">
                © 2025&nbsp;AM | PM Lounge
              </p>
              <div className="flex gap-4 text-xs">
                <Link
                  href="/?admin=true"
                  className="text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin Portal
                </Link>
                <Link
                  href="https://ampm.co.ke/"
                  className="text-slate-400 hover:text-amber-400 transition-colors"
                >
                  Back to Restaurant
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <NewsletterSection />
        </motion.div>
      </section>

      {/* Right Side Image */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:block relative w-full max-w-[50%]"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-950/50 z-10" />
        <div className="relative h-full w-full">
          <Image
            src="/assets/images/onboarding-img.png"
            fill
            alt="AM PM Lounge Interior"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

          {/* Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-12 z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <h3 className="text-3xl font-bold text-white mb-4">
                Why Dine With Us?
              </h3>
              <ul className="space-y-3 text-slate-200">
                <li className="flex items-center gap-3">
                  <span className="text-amber-500">✨</span>
                  Award-winning cuisine by Chef James Kanyeki
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-amber-500">🍷</span>
                  Extensive wine & cocktail selection
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-amber-500">🎵</span>
                  Live entertainment every weekend
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-amber-500">🍖</span>
                  Free Goat Meat Fridays & Saturdays 6-9pm
                </li>
              </ul>

              <div className="mt-8 p-4 bg-amber-500/10 backdrop-blur-sm rounded-lg border border-amber-500/20">
                <p className="text-amber-400 font-semibold text-sm">Operating Hours</p>
                <p className="text-slate-300 text-xs mt-1">Mon-Fri: 8:00 AM - 12:00 AM</p>
                <p className="text-slate-300 text-xs">Sat-Sun: 7:00 AM - 11:00 PM</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;