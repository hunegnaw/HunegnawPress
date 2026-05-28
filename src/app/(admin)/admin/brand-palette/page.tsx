"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DEFAULT_BRAND_PALETTE,
  type BrandColor,
  type BrandColorCategory,
} from "@/lib/brand-palette";
import {
  Palette,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Check,
  Loader2,
  RefreshCw,
  GripVertical,
} from "lucide-react";
import { useSavedColors } from "@/components/providers/saved-colors-provider";

function hexToRgb(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return "";
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "";
  return `${r}, ${g}, ${b}`;
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
}

function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

function hexToRgba(hex: string, opacity: number): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const CHECKERBOARD_BG =
  "repeating-conic-gradient(#e2e2e2 0% 25%, transparent 0% 50%) 0 0 / 12px 12px";

function ColorRow({
  color,
  onChange,
  onDelete,
}: {
  color: BrandColor;
  onChange: (updated: BrandColor) => void;
  onDelete: () => void;
}) {
  const light = isValidHex(color.hex) ? isLightColor(color.hex) : true;
  const opacity = color.opacity ?? 1;

  return (
    <div className="flex items-center gap-2 group">
      <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
      <div
        className="w-10 h-10 rounded-md border border-gray-200 shrink-0 relative overflow-hidden"
        style={{ background: CHECKERBOARD_BG }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: isValidHex(color.hex)
              ? hexToRgba(color.hex, opacity)
              : "transparent",
          }}
        />
        <input
          type="color"
          value={isValidHex(color.hex) ? color.hex : "#000000"}
          onChange={(e) =>
            onChange({ ...color, hex: e.target.value, rgb: hexToRgb(e.target.value) })
          }
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        {isValidHex(color.hex) && (
          <span
            className="absolute inset-0 flex items-center justify-center text-[7px] font-mono pointer-events-none"
            style={{ color: light && opacity > 0.5 ? "#1e293b" : "#ffffff" }}
          >
            {color.hex}
          </span>
        )}
      </div>
      <Input
        value={color.name}
        onChange={(e) => onChange({ ...color, name: e.target.value })}
        placeholder="Name"
        className="w-32"
      />
      <Input
        value={color.hex}
        onChange={(e) => {
          const hex = e.target.value;
          onChange({ ...color, hex, rgb: isValidHex(hex) ? hexToRgb(hex) : color.rgb });
        }}
        placeholder="#000000"
        className="w-28 font-mono text-xs"
      />
      <span className="text-[11px] text-muted-foreground font-mono w-24 shrink-0">
        {color.rgb || "—"}
      </span>
      <div className="flex items-center gap-1.5 w-28 shrink-0">
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(opacity * 100)}
          onChange={(e) =>
            onChange({ ...color, opacity: Number(e.target.value) / 100 })
          }
          className="flex-1 h-1.5 accent-blue-600"
        />
        <Input
          value={Math.round(opacity * 100)}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) {
              onChange({ ...color, opacity: Math.min(100, Math.max(0, v)) / 100 });
            }
          }}
          className="w-14 text-xs text-center font-mono px-1"
        />
        <span className="text-[10px] text-muted-foreground">%</span>
      </div>
      <Input
        value={color.usage}
        onChange={(e) => onChange({ ...color, usage: e.target.value })}
        placeholder="Usage description"
        className="flex-1 text-xs"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export default function BrandPalettePage() {
  const [palette, setPalette] = useState<BrandColorCategory[]>(DEFAULT_BRAND_PALETTE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { refetch } = useSavedColors();

  const loadPalette = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      const data = await res.json();
      if (data.brandPalette && Array.isArray(data.brandPalette) && data.brandPalette.length > 0) {
        setPalette(data.brandPalette);
      } else {
        setPalette(DEFAULT_BRAND_PALETTE);
      }
      setDirty(false);
    } catch {
      setMessage({ type: "error", text: "Failed to load palette" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
    loadPalette();
  }, [loadPalette]);

  function updatePalette(updated: BrandColorCategory[]) {
    setPalette(updated);
    setDirty(true);
  }

  function updateCategory(catIndex: number, updates: Partial<BrandColorCategory>) {
    const updated = palette.map((cat, i) => (i === catIndex ? { ...cat, ...updates } : cat));
    updatePalette(updated);
  }

  function deleteCategory(catIndex: number) {
    if (!confirm("Delete this entire category and all its colors?")) return;
    updatePalette(palette.filter((_, i) => i !== catIndex));
  }

  function addCategory() {
    const id = `custom-${Date.now()}`;
    updatePalette([
      ...palette,
      { id, label: "New Category", colors: [] },
    ]);
  }

  function updateColor(catIndex: number, colorIndex: number, updated: BrandColor) {
    const newColors = [...palette[catIndex].colors];
    newColors[colorIndex] = updated;
    updateCategory(catIndex, { colors: newColors });
  }

  function deleteColor(catIndex: number, colorIndex: number) {
    const newColors = palette[catIndex].colors.filter((_, i) => i !== colorIndex);
    updateCategory(catIndex, { colors: newColors });
  }

  function addColor(catIndex: number) {
    const newColors = [
      ...palette[catIndex].colors,
      { name: "New Color", hex: "#000000", rgb: "0, 0, 0", usage: "", opacity: 1 },
    ];
    updateCategory(catIndex, { colors: newColors });
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandPalette: palette }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      setDirty(false);
      refetch();
      setMessage({ type: "success", text: "Brand palette saved." });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (!confirm("Reset palette to built-in defaults? Unsaved changes will be lost.")) return;
    updatePalette(DEFAULT_BRAND_PALETTE);
  }

  async function handleSync() {
    if (!confirm("This will replace all saved colors with the current brand palette hex values. Continue?")) return;
    if (dirty) {
      if (!confirm("You have unsaved palette changes. Save them first before syncing?")) return;
      await handleSave();
    }
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/saved-colors/seed", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to sync colors");
      }
      refetch();
      setMessage({ type: "success", text: "All brand colors synced to saved colors palette." });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Sync failed" });
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brand Palette</h1>
          <p className="text-muted-foreground mt-1">
            Edit your brand color system. Changes are saved to the database.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button variant="outline" onClick={handleSync} disabled={syncing || saving}>
            {syncing ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
            Sync to Saved Colors
          </Button>
          <Button onClick={handleSave} disabled={saving || !dirty}>
            {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
            Save Palette
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "success" && <Check className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {dirty && (
        <Alert>
          <AlertDescription className="text-amber-700">
            You have unsaved changes. Click &quot;Save Palette&quot; to persist them.
          </AlertDescription>
        </Alert>
      )}

      {palette.map((category, catIndex) => (
        <Card key={category.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-muted-foreground" />
                <Input
                  value={category.label}
                  onChange={(e) => updateCategory(catIndex, { label: e.target.value })}
                  className="text-base font-semibold w-64"
                />
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addColor(catIndex)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Color
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteCategory(catIndex)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {category.colors.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No colors in this category. Click &quot;Add Color&quot; to add one.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-6">
                  <span className="w-10">Color</span>
                  <span className="w-32">Name</span>
                  <span className="w-28">Hex</span>
                  <span className="w-24">RGB</span>
                  <span className="w-28">Opacity</span>
                  <span className="flex-1">Usage</span>
                  <span className="w-8" />
                </div>
                {category.colors.map((color, colorIndex) => (
                  <ColorRow
                    key={colorIndex}
                    color={color}
                    onChange={(updated) => updateColor(catIndex, colorIndex, updated)}
                    onDelete={() => deleteColor(catIndex, colorIndex)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addCategory}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4" />
        Add Category
      </Button>
    </div>
  );
}
