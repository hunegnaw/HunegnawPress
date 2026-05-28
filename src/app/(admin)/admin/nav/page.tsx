"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Check, Palette, Navigation } from "lucide-react";
import { ColorPicker } from "@/components/admin/color-picker";
import { DEFAULT_NAV, mergeNav, type NavConfig } from "@/lib/nav";

export default function AdminNavPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [nav, setNav] = useState<NavConfig>(DEFAULT_NAV);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setNav(mergeNav(data.nav));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nav }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save navigation settings");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof NavConfig>(key: K, value: NavConfig[K]) {
    setNav((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Navigation</h1>
        <p className="text-muted-foreground mt-1">
          Configure the marketing site navigation header colors.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>Navigation settings saved successfully.</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Desktop Colors */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Header Colors</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              These colors apply when the header is in its solid state (scrolled or non-transparent pages).
              On hero sections, the header starts transparent and uses white link colors until the user scrolls.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label>Background Color</Label>
                <ColorPicker
                  value={nav.backgroundColor}
                  onChange={(hex) => updateField("backgroundColor", hex)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Link Color</Label>
                <ColorPicker
                  value={nav.linkColor}
                  onChange={(hex) => updateField("linkColor", hex)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Link Hover Color</Label>
                <ColorPicker
                  value={nav.linkHoverColor}
                  onChange={(hex) => updateField("linkHoverColor", hex)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Button Border Color</Label>
                <ColorPicker
                  value={nav.buttonBorderColor}
                  onChange={(hex) => updateField("buttonBorderColor", hex)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Button Hover Background</Label>
                <ColorPicker
                  value={nav.buttonHoverBgColor}
                  onChange={(hex) => updateField("buttonHoverBgColor", hex)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Menu Colors */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Mobile Menu Colors</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label>Menu Background</Label>
                <ColorPicker
                  value={nav.mobileMenuBgColor}
                  onChange={(hex) => updateField("mobileMenuBgColor", hex)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Menu Border Color</Label>
                <ColorPicker
                  value={nav.mobileMenuBorderColor}
                  onChange={(hex) => updateField("mobileMenuBorderColor", hex)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving && <Loader2 className="animate-spin" />}
            {success ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              "Save Navigation Settings"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
