"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CyberpunkPalette =
  | "synthwave"
  | "cyberpunk-2077"
  | "blade-runner"
  | "matrix"
  | "none";

interface CyberpunkPaletteContextType {
  palette: CyberpunkPalette;
  setPalette: (palette: CyberpunkPalette) => void;
  isEnabled: boolean;
}

const CYBERPUNK_PALETTE_STORAGE_KEY = "cyberpunk-palette";
const DEFAULT_PALETTE: CyberpunkPalette = "none";

const CyberpunkPaletteContext = createContext<
  CyberpunkPaletteContextType | undefined
>(undefined);

export function CyberpunkPaletteProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [palette, setPaletteState] = useState<CyberpunkPalette>(DEFAULT_PALETTE);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedPalette = localStorage.getItem(
      CYBERPUNK_PALETTE_STORAGE_KEY
    ) as CyberpunkPalette | null;

    if (storedPalette && isValidPalette(storedPalette)) {
      setPaletteState(storedPalette);
      applyPaletteToDocument(storedPalette);
    } else {
      applyPaletteToDocument(DEFAULT_PALETTE);
    }

    setMounted(true);
  }, []);

  const setPalette = (novaPaleta: CyberpunkPalette) => {
    if (!isValidPalette(novaPaleta)) {
      console.warn(`Invalid palette: ${novaPaleta}`);
      return;
    }

    setPaletteState(novaPaleta);
    localStorage.setItem(CYBERPUNK_PALETTE_STORAGE_KEY, novaPaleta);
    applyPaletteToDocument(novaPaleta);
  };

  if (!mounted) {
    return null;
  }

  return (
    <CyberpunkPaletteContext.Provider
      value={{
        palette,
        setPalette,
        isEnabled: palette !== "none",
      }}
    >
      {children}
    </CyberpunkPaletteContext.Provider>
  );
}

export function useCyberpunkPalette(): CyberpunkPaletteContextType {
  const context = useContext(CyberpunkPaletteContext);

  if (context === undefined) {
    throw new Error(
      "useCyberpunkPalette must be used within CyberpunkPaletteProvider"
    );
  }

  return context;
}

function isValidPalette(value: unknown): value is CyberpunkPalette {
  return (
    value === "synthwave" ||
    value === "cyberpunk-2077" ||
    value === "blade-runner" ||
    value === "matrix" ||
    value === "none"
  );
}

function applyPaletteToDocument(palette: CyberpunkPalette) {
  const htmlElement = document.documentElement;

  if (palette === "none") {
    htmlElement.removeAttribute("data-cyberpunk-palette");
  } else {
    htmlElement.setAttribute("data-cyberpunk-palette", palette);
  }
}
