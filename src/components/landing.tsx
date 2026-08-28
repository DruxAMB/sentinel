"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Brain, ArrowRight, Activity, GitBranch, MessageSquare } from "lucide-react";

// Register once at module top level — guarded for SSR (useGSAP touches window)
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export function Landing({
  onTryDemo,
  isExiting,
}: {
  onTryDemo: () => void;
  isExiting?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Respect prefers-reduced-motion — no animation, just show everything
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      // Word-by-word headline reveal — documented GSAP stagger recipe
      const words = gsap.utils.toArray<HTMLElement>(".hero-word");
      gsap.from(words, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.08,
        delay: 0.2,
      });

      // Subhead fades in after headline
      gsap.from(".hero-subhead", {
        opacity: 0,
        y: 16,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.8,
      });

      // CTAs slide up — NO opacity animation (avoids the invisible-button bug)
      // gsap.from with opacity:0 + delay sets opacity:0 immediately and waits;
      // if the animation is interrupted the buttons stay invisible forever.
      gsap.from(".hero-cta", {
        y: 12,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.1,
        delay: 1.1,
      });

      // Badge fades in first
      gsap.from(".hero-badge", {
        opacity: 0,
        y: 8,
        duration: 0.4,
        ease: "power2.out",
        delay: 0.1,
      });

      // Background glow pulse — subtle, loops
      gsap.to(".hero-glow", {
        opacity: 0.15,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    },
    { scope: containerRef }
  );

  // Split headline into words for the stagger animation
  const headlineWords = ["A", "Mind", "that", "watches", "your", "community"];
  const headlineAccent = ["and", "catches", "conflicts", "before", "they", "escalate."];

  return (
    <div
      ref={containerRef}
      className="relative border-b border-border bg-background overflow-hidden"
      style={{
        transform: isExiting ? "translateY(-100%)" : "translateY(0)",
        opacity: isExiting ? 0 : 1,
        transition: "transform 350ms cubic-bezier(0.83, 0, 0.17, 1), opacity 300ms ease-out",
      }}
    >
      {/* Background glow — Neon green radial, fits "Server Room After Dark" */}
      <div
        className="hero-glow pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 opacity-5"
        style={{
          background: "radial-gradient(ellipse at center, #34d59a 0%, transparent 70%)",
        }}
      />

      {/* Hero */}
      <section className="relative mx-auto max-w-[1120px] px-5 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="hero-badge mb-6 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
              Powered by a Mind
            </span>
          </div>

          {/* Headline — split into words for stagger animation */}
          <h1
            className="max-w-3xl text-4xl font-medium tracking-tight text-foreground sm:text-5xl md:text-6xl"
            style={{ letterSpacing: "-0.025em", lineHeight: 1.05 }}
          >
            {headlineWords.map((word, i) => (
              <span key={i} className="hero-word inline-block mr-[0.25em]">
                {word}
              </span>
            ))}
            <span className="text-primary">
              {headlineAccent.map((word, i) => (
                <span key={i} className="hero-word inline-block mr-[0.25em]">
                  {word}
                </span>
              ))}
            </span>
          </h1>

          {/* Subhead */}
          <p
            className="hero-subhead mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
            style={{ lineHeight: 1.5 }}
          >
            Sentinel remembers interaction patterns over weeks. It detects brewing conflicts,
            matches them to prior trajectories, and drafts interventions — autonomously, across
            persistent monitoring sessions.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <button
              onClick={onTryDemo}
              className="hero-cta flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Try the demo
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="https://github.com/DruxAMB/sentinel"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-cta flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              View the code
            </a>
          </div>
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section className="relative mx-auto max-w-[1120px] px-5 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {/* Step 1 */}
          <div className="bg-card p-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-primary">01</span>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <h3 className="mt-3 text-sm font-medium text-foreground">Monitors continuously</h3>
            <p className="mt-1.5 text-sm text-muted-foreground" style={{ lineHeight: 1.5 }}>
              The Mind reads community messages on a schedule — every 6 hours, persistently, across
              sessions.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-card p-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-primary">02</span>
              <GitBranch className="h-4 w-4 text-primary" />
            </div>
            <h3 className="mt-3 text-sm font-medium text-foreground">Detects patterns</h3>
            <p className="mt-1.5 text-sm text-muted-foreground" style={{ lineHeight: 1.5 }}>
              It remembers prior interactions and matches new ones against escalation trajectories
              it has seen before.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-card p-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-primary">03</span>
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <h3 className="mt-3 text-sm font-medium text-foreground">Drafts interventions</h3>
            <p className="mt-1.5 text-sm text-muted-foreground" style={{ lineHeight: 1.5 }}>
              When a conflict escalates, the Mind drafts a de-escalation message — reviewed by a
              human, posted with one click.
            </p>
          </div>
        </div>
      </section>

      {/* Proof — the Mind's real output */}
      <section className="relative mx-auto max-w-[1120px] px-5 pb-16 sm:pb-24">
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
              The Mind&apos;s real assessment
            </span>
          </div>
          <blockquote className="mt-4 text-sm text-foreground sm:text-base" style={{ lineHeight: 1.6 }}>
            &ldquo;This is the third clash between Jordan and Alex... the pattern is forming fast
            enough that I want to be specific. Aug 14 was substantive and resolved cleanly. Aug 18
            broke the pattern. The argument has moved off palettes entirely and onto each other...
            I&apos;d revise the timeline to days, not weeks.&rdquo;
          </blockquote>
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            — sentinel (the Mind), session 3 of 4, live output
          </p>
        </div>
      </section>
    </div>
  );
}
