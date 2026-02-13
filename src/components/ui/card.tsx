"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useCyberpunkPalette } from "@/contexts/cyberpunk-palette-context";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  const { isEnabled } = useCyberpunkPalette();

  return (
    <div
      data-slot="card"
      className={cn(
        "text-card-foreground flex flex-col gap-6 rounded-xl border py-6 transition-all",
        isEnabled ? "neon-glow-sm neon-border hover:neon-glow-md" : "hover:shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { isEnabled } = useCyberpunkPalette();

  return (
    <div
      data-slot="card-header"
      className={cn(
        "relative @container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    >
      {isEnabled && (
        <div className="absolute inset-0 holographic-gradient rounded-t-xl opacity-5 pointer-events-none" />
      )}
      {props.children}
    </div>
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  const { isEnabled } = useCyberpunkPalette();

  return (
    <h3
      data-slot="card-title"
      className={cn(
        "text-2xl leading-none font-extrabold",
        isEnabled && "glitch-hover",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
