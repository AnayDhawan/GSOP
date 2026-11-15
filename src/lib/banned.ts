// The banned terms (decision E32) are read from data/banned_words.txt, so no source file has to spell them out.
import fs from "node:fs";
import path from "node:path";

export function bannedTerms(): string[] {
  const text = fs.readFileSync(path.join(process.cwd(), "data/banned_words.txt"), "utf-8");
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

/** Whole-word, case-insensitive match for any banned term. */
export function bannedRegex(): RegExp {
  return new RegExp(`\\b(${bannedTerms().map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "i");
}
