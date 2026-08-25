import { Brain, ArrowRight, Activity, GitBranch, MessageSquare } from "lucide-react";

export function Landing({ onTryDemo }: { onTryDemo: () => void }) {
  return (
    <div className="border-b border-border bg-background">
      {/* Hero */}
      <section className="mx-auto max-w-[1120px] px-5 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
              Powered by a Mind
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl text-4xl font-medium tracking-tight text-foreground sm:text-5xl md:text-6xl"
              style={{ letterSpacing: "-0.025em", lineHeight: 1.05 }}>
            A Mind that watches your community{" "}
            <span className="text-primary">and catches conflicts before they escalate.</span>
          </h1>

          {/* Subhead */}
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
             style={{ lineHeight: 1.5 }}>
            Sentinel remembers interaction patterns over weeks. It detects brewing conflicts,
            matches them to prior trajectories, and drafts interventions — autonomously, across
            persistent monitoring sessions.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <button
              onClick={onTryDemo}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Try the demo
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="https://github.com/DruxAMB/sentinel"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              View the code
            </a>
          </div>
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section className="mx-auto max-w-[1120px] px-5 pb-16 sm:pb-24">
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
      <section className="mx-auto max-w-[1120px] px-5 pb-16 sm:pb-24">
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
