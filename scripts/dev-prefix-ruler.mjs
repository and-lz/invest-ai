#!/usr/bin/env node
// Pipes stdin, inserting a ruler line whenever the concurrently prefix switches.
// Strips ANSI codes for prefix detection but passes original lines through.

import { createInterface } from "node:readline";

const RULER =
  "\x1b[2m════════════════════════════════════════════════════════════════\x1b[0m";
const ANSI_RE = /\x1b\[[0-9;]*m/g;
const PREFIX_RE = /^\[([^\]]+)\]/;

let lastPrefix = null;

const rl = createInterface({ input: process.stdin });

rl.on("line", (line) => {
  const clean = line.replace(ANSI_RE, "");
  const match = clean.match(PREFIX_RE);
  const prefix = match?.[1] ?? null;

  if (prefix && prefix !== lastPrefix && lastPrefix !== null) {
    process.stdout.write(RULER + "\n");
  }

  if (prefix) lastPrefix = prefix;
  process.stdout.write(line + "\n");
});

rl.on("close", () => process.exit(0));

// Don't crash on broken pipe
process.stdout.on("error", () => process.exit(0));
