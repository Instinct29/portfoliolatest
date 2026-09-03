"use client";

import { useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import SpeechBubble from "./SpeechBubble";
import type { BoyPose, BubbleSide } from "./types";
import "./boy.css";

export type { BoyPose };

function poseClass(pose: BoyPose): string {
  switch (pose) {
    case "walk-left":
    case "walk-right":
    case "walk":
      return "boy-pose-walk";
    case "quick-walk":
      return "boy-pose-quick-walk";
    case "run":
      return "boy-pose-run";
    case "carry":
    case "carry-toolbox":
      return "boy-pose-carry";
    case "use-wrench":
    case "unscrew":
      return "boy-pose-wrench";
    case "wipe":
    case "sweep":
      return "boy-pose-wipe";
    case "pick-up":
      return "boy-pose-pickup";
    case "throw":
      return "boy-pose-throw";
    case "cheer":
      return "boy-pose-cheer";
    case "panic":
      return "boy-pose-panic";
    case "look":
    case "look-left":
    case "look-right":
      return "boy-pose-look";
    case "think":
      return "boy-pose-think";
    case "reach":
    case "pull":
      return "boy-pose-reach";
    case "enter":
      return "boy-pose-enter";
    case "exit":
      return "boy-pose-exit";
    default:
      return `boy-pose-${pose}`;
  }
}

export default function Boy({
  pose = "idle",
  scale = 1,
  className = "",
  style,
  facing = "right",
  flip,
  say,
  showTools,
  tool,
  bubbleSide = "auto",
}: {
  pose?: BoyPose;
  scale?: number;
  className?: string;
  style?: CSSProperties;
  facing?: "left" | "right";
  flip?: boolean;
  say?: string;
  showTools?: boolean;
  tool?: "wrench" | "screwdriver" | "cloth" | "toolbox" | "none";
  bubbleSide?: BubbleSide;
}) {
  const reduce = useReducedMotion();
  const anim = reduce ? "boy-pose-static" : poseClass(pose);
  const faceLeft =
    flip === true ||
    facing === "left" ||
    pose === "walk-left" ||
    pose === "look-left";
  const toolsOn =
    showTools ||
    tool === "toolbox" ||
    tool === "wrench" ||
    pose === "carry-toolbox" ||
    pose === "carry" ||
    pose === "use-wrench" ||
    pose === "unscrew";
  const clothOn = tool === "cloth" || pose === "wipe" || pose === "sweep";
  const driverOn = tool === "screwdriver" || pose === "unscrew";

  return (
    <div
      aria-hidden={!say}
      className={`boy-root pointer-events-none select-none relative ${anim} ${className}`}
      style={{
        ...style,
        transform: `${style?.transform ?? ""} scaleX(${faceLeft ? -1 : 1}) scale(${scale})`.trim(),
        transformOrigin: "center bottom",
      }}
    >
      {say ? (
        <div style={{ transform: faceLeft ? "scaleX(-1)" : undefined }}>
          <SpeechBubble text={say} side={bubbleSide} />
        </div>
      ) : null}
      <svg
        width="44"
        height="60"
        viewBox="0 0 44 60"
        fill="none"
        className="text-foreground overflow-visible"
      >
        {/* Head */}
        <g className="boy-head">
          <circle cx="22" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.5" />
          <circle className="boy-eye-l" cx="19.2" cy="10" r="0.9" fill="currentColor" />
          <circle className="boy-eye-r" cx="24.8" cy="10" r="0.9" fill="currentColor" />
        </g>
        {/* Torso */}
        <line
          className="boy-torso"
          x1="22"
          y1="18.5"
          x2="22"
          y2="36"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Arms */}
        <line
          className="boy-arm-l"
          x1="22"
          y1="23"
          x2="11"
          y2="30"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          className="boy-arm-r"
          x1="22"
          y1="23"
          x2="33"
          y2="30"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Legs */}
        <line
          className="boy-leg-l"
          x1="22"
          y1="36"
          x2="14"
          y2="52"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          className="boy-leg-r"
          x1="22"
          y1="36"
          x2="30"
          y2="52"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {toolsOn && (
          <g className="boy-tool-box">
            <rect
              x="28"
              y="26"
              width="11"
              height="8"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <line x1="30" y1="28" x2="37" y2="28" stroke="currentColor" strokeWidth="1" />
          </g>
        )}
        {driverOn && (
          <g className="boy-tool-driver">
            <line x1="32" y1="22" x2="38" y2="16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="37" y1="15" x2="40" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        )}
        {clothOn && (
          <path
            className="boy-tool-cloth"
            d="M30 28c3-1 6 1 7 4"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </svg>
    </div>
  );
}
