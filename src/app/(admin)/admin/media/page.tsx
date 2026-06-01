"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/utils"
import {
  Search,
  Upload,
  Trash2,
  X,
  Film,
  Image as ImageIcon,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Layers,
  RefreshCw,
} from "lucide-react"
import type { MediaVariants } from "@/lib/image-variants"

interface MediaItem {
  id: string
  fileName: string
  filePath: string
  mimeType: string
  alt: string | null
  caption: string | null
  width: number | null
  height: number | null
  fileSize: number
  variants: MediaVariants | null
  createdAt: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/")
}

function isVideo(mimeType: string): boolean {
  return mimeType.startsWith("video/")
}

function VariantRow({
  label,
  sublabel,
  path,
  width,
  height,
  size,
}: {
  label: string
  sublabel: string
  path: string
  width: number | null
  height: number | null
  size: number
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{label}</span>
          <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
            {sublabel}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {width && height ? `${width} x ${height} - ` : ""}
          {path}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs font-medium tabular-nums">
          {formatFileSize(size)}
        </span>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(path)}
          className="text-xs text-muted-foreground hover:text-foreground"
          title="Copy path"
        >
          Copy
        </button>
        <a
          href={path}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          Open
        </a>
      </div>
    </div>
  )
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(24)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Upload state
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Detail overlay state
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [editAlt, setEditAlt] = useState("")
  const [editCaption, setEditCaption] = useState("")
  const [savingMeta, setSavingMeta] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Variant generation state
  const [generatingAll, setGeneratingAll] = useState(false)
  const [genRemaining, setGenRemaining] = useState<number | null>(null)
  const [pendingCount, setPendingCount] = useState<number | null>(null)
  const [generatingItem, setGeneratingItem] = useState(false)

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      })
      if (search) params.set("search", search)
      if (typeFilter && typeFilter !== "all") params.set("type", typeFilter)

      const res = await fetch(`/api/admin/media?${params}`)
      if (!res.ok) throw new Error("Failed to fetch media")
      const data = await res.json()
      setItems(data.media)
      setTotal(data.pagination?.total ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, typeFilter])

  useEffect(() => {
    Promise.resolve().then(() => fetchMedia())
  }, [fetchMedia])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchMedia()
  }

  const [isDragging, setIsDragging] = useState(false)

  async function uploadFiles(files: FileList) {
    if (files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append("file", files[i])

        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Failed to upload ${files[i].name}`)
        }
      }

      setShowUpload(false)
      fetchMedia()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) uploadFiles(e.target.files)
  }

  function openDetail(item: MediaItem) {
    setSelectedItem(item)
    setEditAlt(item.alt || "")
    setEditCaption(item.caption || "")
  }

  function closeDetail() {
    setSelectedItem(null)
    setEditAlt("")
    setEditCaption("")
  }

  async function handleSaveMeta() {
    if (!selectedItem) return

    setSavingMeta(true)
    try {
      const res = await fetch(`/api/admin/media/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alt: editAlt.trim() || null,
          caption: editCaption.trim() || null,
        }),
      })

      if (!res.ok) throw new Error("Failed to update media")

      const data = await res.json()
      setItems((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? { ...item, alt: data.alt, caption: data.caption }
            : item
        )
      )
      setSelectedItem((prev) =>
        prev ? { ...prev, alt: data.alt, caption: data.caption } : null
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update media")
    } finally {
      setSavingMeta(false)
    }
  }

  async function handleDelete(itemId: string) {
    if (deleting) return
    if (!confirm("Are you sure you want to delete this media file? This cannot be undone.")) return

    setDeleting(itemId)
    try {
      const res = await fetch(`/api/admin/media/${itemId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete media")

      if (selectedItem?.id === itemId) {
        closeDetail()
      }
      fetchMedia()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete media")
    } finally {
      setDeleting(null)
    }
  }

  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media/variants")
      if (!res.ok) return
      const data = await res.json()
      setPendingCount(data.pending ?? 0)
    } catch {
      // Non-critical
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => fetchPendingCount())
  }, [fetchPendingCount])

  async function generateAllVariants() {
    if (generatingAll) return
    setGeneratingAll(true)
    setError(null)
    try {
      // Loop the batch endpoint until nothing remains.
      // Safety cap prevents an infinite loop if a file repeatedly fails.
      for (let i = 0; i < 500; i++) {
        const res = await fetch("/api/admin/media/variants", { method: "POST" })
        if (!res.ok) throw new Error("Failed to generate variants")
        const data = await res.json()
        setGenRemaining(data.remaining)
        if (data.remaining <= 0 || data.processed === 0) break
      }
      await fetchMedia()
      await fetchPendingCount()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate variants")
    } finally {
      setGeneratingAll(false)
      setGenRemaining(null)
    }
  }

  async function generateItemVariants(itemId: string) {
    setGeneratingItem(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/media/${itemId}/variants`, {
        method: "POST",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to generate variants")
      }
      const data = await res.json()
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, variants: data.variants } : item
        )
      )
      setSelectedItem((prev) =>
        prev && prev.id === itemId ? { ...prev, variants: data.variants } : prev
      )
      fetchPendingCount()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate variants")
    } finally {
      setGeneratingItem(false)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage images and videos for your pages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={generateAllVariants}
            disabled={generatingAll || pendingCount === 0}
            variant="outline"
            title="Generate WebP + B&W sizes for images that don't have them yet"
          >
            {generatingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Layers className="h-4 w-4" />
            )}
            {generatingAll
              ? genRemaining != null
                ? `Generating... ${genRemaining} left`
                : "Generating..."
              : pendingCount && pendingCount > 0
                ? `Generate Variants (${pendingCount})`
                : "Generate Variants"}
          </Button>
          <Button
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        <Tabs
          value={typeFilter}
          onValueChange={(val) => {
            setTypeFilter(val)
            setPage(1)
          }}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Media Grid */}
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          {loading ? "Loading..." : `${total} file${total !== 1 ? "s" : ""}`}
        </p>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {search
                ? "No media files match your search."
                : "No media files yet. Upload your first file to get started."}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openDetail(item)}
                className="group relative aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-50 hover:ring-2 hover:ring-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {isImage(item.mimeType) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.filePath}
                    alt={item.alt || item.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : isVideo(item.mimeType) ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                    <Film className="h-8 w-8 text-white/60" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">{item.fileName}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}--{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !uploading && setShowUpload(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upload Media</h2>
              <button
                type="button"
                onClick={() => !uploading && setShowUpload(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragging(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragging(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragging(false)
                if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files)
              }}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-blue-600 bg-blue-600/5"
                  : "border-gray-300"
              }`}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-3">
                Drag files here or choose below
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.svg,video/*"
                multiple
                onChange={handleUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
              />
            </div>

            {uploading && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Overlay */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeDetail}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold truncate pr-4">
                {selectedItem.fileName}
              </h2>
              <button
                type="button"
                onClick={closeDetail}
                className="p-1 text-gray-400 hover:text-gray-600 rounded flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Preview */}
              <div className="rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {isImage(selectedItem.mimeType) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedItem.filePath}
                    alt={selectedItem.alt || selectedItem.fileName}
                    className="max-h-80 object-contain"
                  />
                ) : isVideo(selectedItem.mimeType) ? (
                  <video
                    src={selectedItem.filePath}
                    controls
                    className="max-h-80 w-full"
                  />
                ) : (
                  <div className="py-12">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  </div>
                )}
              </div>

              {/* File info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">File name:</span>
                  <p className="font-medium truncate">{selectedItem.fileName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <p className="font-medium">{formatFileSize(selectedItem.fileSize)}</p>
                </div>
                {selectedItem.width && selectedItem.height && (
                  <div>
                    <span className="text-muted-foreground">Dimensions:</span>
                    <p className="font-medium">
                      {selectedItem.width} x {selectedItem.height}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Uploaded:</span>
                  <p className="font-medium">{formatDate(selectedItem.createdAt)}</p>
                </div>
              </div>

              {/* Sizes & Variants */}
              {isImage(selectedItem.mimeType) && (
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Sizes &amp; Variants</h3>
                    {selectedItem.mimeType !== "image/svg+xml" &&
                      selectedItem.mimeType !== "image/gif" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateItemVariants(selectedItem.id)}
                          disabled={generatingItem}
                        >
                          {generatingItem ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          {selectedItem.variants ? "Regenerate" : "Generate"}
                        </Button>
                      )}
                  </div>

                  <div className="rounded-lg border divide-y text-sm">
                    {/* Original */}
                    <VariantRow
                      label="Original"
                      sublabel={selectedItem.mimeType.replace("image/", "").toUpperCase()}
                      path={selectedItem.filePath}
                      width={selectedItem.width}
                      height={selectedItem.height}
                      size={selectedItem.fileSize}
                    />

                    {selectedItem.variants?.full && (
                      <VariantRow
                        label="Full WebP"
                        sublabel="color"
                        path={selectedItem.variants.full.path}
                        width={selectedItem.variants.full.width}
                        height={selectedItem.variants.full.height}
                        size={selectedItem.variants.full.size}
                      />
                    )}

                    {selectedItem.variants?.color.map((v) => (
                      <VariantRow
                        key={`c-${v.path}`}
                        label={`${v.width}w`}
                        sublabel="color"
                        path={v.path}
                        width={v.width}
                        height={v.height}
                        size={v.size}
                      />
                    ))}

                    {selectedItem.variants?.bw.map((v) => (
                      <VariantRow
                        key={`bw-${v.path}`}
                        label={`${v.width}w`}
                        sublabel="B&W"
                        path={v.path}
                        width={v.width}
                        height={v.height}
                        size={v.size}
                      />
                    ))}
                  </div>

                  {!selectedItem.variants &&
                    selectedItem.mimeType !== "image/svg+xml" &&
                    selectedItem.mimeType !== "image/gif" && (
                      <p className="text-xs text-muted-foreground">
                        No responsive variants yet. Click Generate to create WebP
                        and black &amp; white sizes.
                      </p>
                    )}
                </div>
              )}

              {/* Editable fields */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="detail-alt">Alt Text</Label>
                  <Input
                    id="detail-alt"
                    value={editAlt}
                    onChange={(e) => setEditAlt(e.target.value)}
                    placeholder="Describe this image for accessibility"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="detail-caption">Caption</Label>
                  <Input
                    id="detail-caption"
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Optional caption"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedItem.id)}
                  disabled={deleting === selectedItem.id}
                >
                  {deleting === selectedItem.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveMeta}
                  disabled={savingMeta}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {savingMeta && <Loader2 className="h-4 w-4 animate-spin" />}
                  {savingMeta ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
