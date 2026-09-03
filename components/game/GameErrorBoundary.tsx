"use client";

import type { ReactNode } from "react";
import { Component, type ErrorInfo } from "react";

export class GameErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };

  static getDerivedStateFromError() {
    return { error: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Game error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <p className="text-sm text-muted-foreground">
          Something went wrong in the game. The rest of the portfolio is fine.
        </p>
      );
    }
    return this.props.children;
  }
}
