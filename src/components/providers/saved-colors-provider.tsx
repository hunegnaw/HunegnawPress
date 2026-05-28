"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  DEFAULT_BRAND_PALETTE,
  mergeBrandPalette,
  findBrandColor as findBrandColorFn,
  type BrandColorCategory,
  type BrandColor,
} from "@/lib/brand-palette";

interface SavedColorsContextValue {
  colors: string[];
  addColor: (color: string) => void;
  removeColor: (color: string) => void;
  refetch: () => void;
  brandPalette: BrandColorCategory[];
  findBrandColor: (hex: string) => BrandColor | undefined;
}

const SavedColorsContext = createContext<SavedColorsContextValue>({
  colors: [],
  addColor: () => {},
  removeColor: () => {},
  refetch: () => {},
  brandPalette: DEFAULT_BRAND_PALETTE,
  findBrandColor: findBrandColorFn,
});

export function useSavedColors() {
  return useContext(SavedColorsContext);
}

export function SavedColorsProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<string[]>([]);
  const [brandPalette, setBrandPalette] = useState<BrandColorCategory[]>(DEFAULT_BRAND_PALETTE);

  const refetch = useCallback(() => {
    fetch("/api/admin/saved-colors")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.colors)) {
          setColors(data.colors);
        }
        setBrandPalette(mergeBrandPalette(data.brandPalette));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const persist = useCallback((updated: string[]) => {
    fetch("/api/admin/saved-colors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colors: updated }),
    }).catch(console.error);
  }, []);

  const addColor = useCallback(
    (color: string) => {
      const normalized = color.toLowerCase();
      setColors((prev) => {
        if (prev.includes(normalized)) return prev;
        const updated = [...prev, normalized];
        persist(updated);
        return updated;
      });
    },
    [persist]
  );

  const removeColor = useCallback(
    (color: string) => {
      const normalized = color.toLowerCase();
      setColors((prev) => {
        const updated = prev.filter((c) => c !== normalized);
        persist(updated);
        return updated;
      });
    },
    [persist]
  );

  const findBrandColor = useCallback(
    (hex: string) => findBrandColorFn(hex, brandPalette),
    [brandPalette]
  );

  return (
    <SavedColorsContext.Provider
      value={{
        colors,
        addColor,
        removeColor,
        refetch,
        brandPalette,
        findBrandColor,
      }}
    >
      {children}
    </SavedColorsContext.Provider>
  );
}
