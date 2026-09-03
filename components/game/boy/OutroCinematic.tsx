"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { socialLinks } from "@/lib/siteLinks";
import Boy from "./Boy";
import type { BoyPose, BoySceneBeat } from "./types";
import "./boy.css";

const FreedomRunner = dynamic(() => import("./FreedomRunner"), {
  ssr: false,
});

const LINKEDIN =
  socialLinks.find((l) => l.name === "LinkedIn")?.href ??
  "https://www.linkedin.com/in/manthan-gour/";

type PieceKey = "screw" | "frame" | "finish" | "title" | "subtitle" | "leftover";

const BEATS: BoySceneBeat[] = [
  { id: "enter", pose: "enter", say: "Well…", minMs: 1400, tool: "toolbox", showTools: true },
  { id: "wave", pose: "wave", say: "You actually finished it.", minMs: 1600 },
  { id: "hundred", pose: "point", say: "100 levels.", minMs: 1400 },
  { id: "walk-frame", pose: "walk", say: "That was quite a journey.", minMs: 1500, showTools: true },
  { id: "unscrew", pose: "unscrew", say: "I had fun.", minMs: 1600, tool: "screwdriver" },
  { id: "carry", pose: "carry", say: "Mostly watching you suffer.", minMs: 1700, tool: "toolbox", showTools: true },
  { id: "pull", pose: "pull", say: "Anyway… my job here is done.", minMs: 1600 },
  { id: "wipe", pose: "wipe", say: "Oh, before I forget…", minMs: 1500, tool: "cloth" },
  { id: "credit", pose: "point", say: "This ridiculous thing was made by Manthan Gour.", minMs: 2200 },
  { id: "talk", pose: "wave", say: "If you liked it, you should probably talk to him.", minMs: 2000 },
  { id: "work", pose: "point", say: "Maybe even work with him.", minMs: 1800 },
  { id: "look", pose: "look", say: undefined, minMs: 1100 },
  { id: "notice", pose: "inspect", say: undefined, minMs: 900 },
  { id: "pickup", pose: "pick-up", say: "There.", minMs: 1200 },
  { id: "clean", pose: "stomp", say: "Clean.", minMs: 1100 },
  { id: "why", pose: "look-right", say: "Why are you still here?", minMs: 1500 },
  { id: "go", pose: "point", say: "Go see the actual website.", minMs: 1600 },
  { id: "home", pose: "idle", say: undefined, minMs: 800 },
];

const REDUCED_BEATS: BoySceneBeat[] = [
  { id: "enter", pose: "idle", say: "You actually finished it.", minMs: 1200 },
  { id: "credit", pose: "point", say: "Made by Manthan Gour.", minMs: 1800 },
  { id: "work", pose: "wave", say: "Work with him.", minMs: 1400 },
  { id: "clean", pose: "idle", say: "Clean.", minMs: 900 },
  { id: "go", pose: "point", say: "Go see the actual website.", minMs: 1400 },
  { id: "home", pose: "idle", say: undefined, minMs: 600 },
];

function piecesForBeat(id: string): Partial<Record<PieceKey, boolean>> {
  const gone: Partial<Record<PieceKey, boolean>> = {};
  const order = [
    "enter",
    "wave",
    "hundred",
    "walk-frame",
    "unscrew",
    "carry",
    "pull",
    "wipe",
    "credit",
    "talk",
    "work",
    "look",
    "notice",
    "pickup",
    "clean",
    "why",
    "go",
    "home",
  ];
  const i = order.indexOf(id);
  if (i >= order.indexOf("unscrew")) gone.screw = true;
  if (i >= order.indexOf("carry")) gone.frame = true;
  if (i >= order.indexOf("pull")) gone.finish = true;
  if (i >= order.indexOf("wipe")) {
    gone.title = true;
    gone.subtitle = true;
  }
  if (i >= order.indexOf("pickup")) gone.leftover = true;
  return gone;
}

export default function OutroCinematic({
  onFinished,
}: {
  onFinished: () => void;
}) {
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;
  const beats = reduced ? REDUCED_BEATS : BEATS;
  const [index, setIndex] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [showHome, setShowHome] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [freedomOpen, setFreedomOpen] = useState(false);
  const finishedRef = useRef(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearTimers();
    onFinished();
  }, [onFinished]);

  const beat = beats[Math.min(index, beats.length - 1)]!;
  const gone = piecesForBeat(beat.id);

  useEffect(() => {
    schedule(() => setCanSkip(true), reduced ? 2000 : 4500);
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (finishedRef.current) return;
    const hold = reduced ? Math.min(beat.minMs, 1100) : beat.minMs;
    const t = window.setTimeout(() => {
      if (beat.id === "credit" || beat.id === "work" || beat.id === "talk") {
        setShowCta(true);
      }
      if (beat.id === "home" || index >= beats.length - 1) {
        setShowHome(true);
        return;
      }
      setIndex((i) => Math.min(i + 1, beats.length - 1));
    }, hold);
    return () => window.clearTimeout(t);
  }, [beat.id, beat.minMs, beats.length, index, reduced]);

  const boyX =
    beat.id === "walk-frame" || beat.id === "unscrew"
      ? "12%"
      : beat.id === "carry"
        ? "70%"
        : beat.id === "pull"
          ? "55%"
          : beat.id === "wipe" || beat.id === "credit"
            ? "40%"
            : beat.id === "notice" || beat.id === "pickup"
              ? "78%"
              : "18%";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/95 backdrop-blur-[2px]">
      <div className="relative mx-4 flex min-h-[22rem] w-full max-w-xl flex-col items-center justify-center overflow-hidden rounded-lg border border-border bg-card px-6 py-10 shadow-sm md:min-h-[26rem]">
        {/* Frame pieces */}
        <span
          aria-hidden
          className={`absolute left-3 top-3 h-2.5 w-2.5 rounded-full border border-border-strong transition-all duration-[var(--duration-med)] ease-[var(--ease-out)] ${
            gone.screw ? "translate-x-10 -translate-y-8 rotate-180 opacity-0" : ""
          }`}
        />
        <span
          aria-hidden
          className={`absolute right-3 top-3 h-2.5 w-2.5 rounded-full border border-border-strong transition-opacity duration-[var(--duration-med)] ${
            gone.screw ? "opacity-20" : ""
          }`}
        />
        <div
          aria-hidden
          className={`absolute left-4 right-4 top-8 h-10 rounded-md border border-border bg-elevated transition-all duration-[var(--duration-med)] ease-[var(--ease-out)] ${
            gone.frame ? "translate-x-[120%] opacity-0" : ""
          }`}
        />

        <div className="relative z-[1] flex w-full max-w-sm flex-col items-center gap-3 pt-10">
          <p
            className={`text-center text-lg font-medium text-foreground transition-all duration-[var(--duration-med)] ${
              gone.title
                ? "origin-left scale-x-0 opacity-0"
                : beat.id === "wipe"
                  ? "origin-left scale-x-50 opacity-70"
                  : ""
            }`}
            style={{
              clipPath:
                beat.id === "wipe"
                  ? "inset(0 35% 0 0)"
                  : gone.title
                    ? "inset(0 100% 0 0)"
                    : undefined,
            }}
          >
            Congratulations.
          </p>
          <p
            className={`text-center text-sm text-muted-foreground transition-all duration-[var(--duration-med)] ${
              gone.subtitle ? "opacity-0" : ""
            }`}
          >
            You completed all 100 levels.
          </p>

          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className={`mt-2 rounded-md border border-border bg-card px-10 py-3 text-base font-medium text-foreground transition-all duration-[var(--duration-med)] ease-[var(--ease-out)] ${
              gone.finish
                ? "translate-x-[140%] rotate-12 opacity-0"
                : beat.id === "pull"
                  ? "translate-x-6 -translate-y-1"
                  : ""
            }`}
          >
            FINISH
          </button>

          {!gone.leftover ? (
            <span
              aria-hidden
              className={`absolute bottom-2 right-8 h-1.5 w-1.5 rounded-sm bg-muted-foreground transition-opacity ${
                beat.id === "notice" ? "opacity-100" : "opacity-50"
              }`}
            />
          ) : null}

          {showCta ? (
            <div className="mt-6 text-center">
              <p className="text-sm font-medium text-foreground">Manthan Gour</p>
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground"
              >
                Connect with Manthan
              </a>
            </div>
          ) : null}

          {showHome ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  finish();
                  router.push("/");
                }}
                className="rounded-md border border-border-strong px-5 py-2.5 text-sm font-medium text-foreground hover:bg-elevated"
              >
                TAKE ME HOME
              </button>
              <button
                type="button"
                onClick={() => setFreedomOpen(true)}
                className="rounded-md border border-dashed border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:border-border-strong hover:text-foreground"
              >
                FREEDOM
              </button>
            </div>
          ) : null}
        </div>

        <div
          className="pointer-events-none absolute bottom-6 transition-[left] duration-[var(--duration-med)] ease-[var(--ease-out)]"
          style={{ left: boyX }}
        >
          <Boy
            pose={beat.pose as BoyPose}
            say={beat.say}
            showTools={beat.showTools}
            tool={beat.tool}
            bubbleSide="right"
            scale={reduced ? 1.35 : 1.7}
          />
        </div>
      </div>

      {canSkip ? (
        <button
          type="button"
          onClick={finish}
          className="absolute bottom-6 right-6 text-2xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Skip outro
        </button>
      ) : null}

      {freedomOpen ? (
        <FreedomRunner onClose={() => setFreedomOpen(false)} />
      ) : null}
    </div>
  );
}
