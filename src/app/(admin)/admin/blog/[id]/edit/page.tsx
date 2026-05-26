"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { MediaPicker } from "@/components/admin/media-picker"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, ImageIcon, X } from "lucide-react"

interface CategoryOption {
  id: string
  name: string
  slug: string
  color: string | null
}

interface TagOption {
  id: string
  name: string
  slug: string
  color: string | null
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function toDateInputValue(dateStr: string | null): string {
  if (!dateStr) return ""
  try {
    const d = new Date(dateStr)
    return d.toISOString().split("T")[0]
  } catch {
    return ""
  }
}

export default function AdminEditBlogPostPage() {
  const params = useParams()
  const postId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(true)

  // Post fields
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [heroImageUrl, setHeroImageUrl] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [publishDate, setPublishDate] = useState("")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [ogImageUrl, setOgImageUrl] = useState("")
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"hero" | "og">("hero")

  // Categories & Tags
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [tags, setTags] = useState<TagOption[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  const fetchCategoriesAndTags = useCallback(async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        fetch("/api/admin/blog/categories"),
        fetch("/api/admin/blog/tags"),
      ])
      if (catRes.ok) {
        const data = await catRes.json()
        setCategories(data.categories || [])
      }
      if (tagRes.ok) {
        const data = await tagRes.json()
        setTags(data.tags || [])
      }
    } catch {
      // silently ignore
    }
  }, [])

  const fetchPost = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/blog/${postId}`)
      if (!res.ok) throw new Error("Failed to fetch blog post")
      const post = await res.json()

      setTitle(post.title)
      setSlug(post.slug)
      setContent(post.content || "")
      setExcerpt(post.excerpt || "")
      setHeroImageUrl(post.heroImageUrl || "")
      setIsPublished(post.isPublished || false)
      setPublishDate(toDateInputValue(post.publishedAt))
      setMetaTitle(post.metaTitle || "")
      setMetaDescription(post.metaDescription || "")
      setOgImageUrl(post.ogImageUrl || "")

      // Map categories
      if (post.categories && Array.isArray(post.categories)) {
        setSelectedCategoryIds(post.categories.map((c: { categoryId?: string; category?: { id: string } }) => c.categoryId || c.category?.id).filter(Boolean))
      }

      // Map tags
      if (post.tags && Array.isArray(post.tags)) {
        setSelectedTagIds(post.tags.map((t: { tagId?: string; tag?: { id: string } }) => t.tagId || t.tag?.id).filter(Boolean))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blog post")
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchCategoriesAndTags()
  }, [fetchCategoriesAndTags])

  useEffect(() => {
    Promise.resolve().then(() => fetchPost())
  }, [fetchPost])

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugManuallyEdited) {
      setSlug(slugify(value))
    }
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true)
    setSlug(slugify(value))
  }

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError("Title, slug, and content are required.")
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          content,
          excerpt: excerpt.trim() || null,
          heroImageUrl: heroImageUrl.trim() || null,
          isPublished,
          publishedAt: publishDate || null,
          categoryIds: selectedCategoryIds,
          tags: selectedTagIds,
          metaTitle: metaTitle.trim() || null,
          metaDescription: metaDescription.trim() || null,
          ogImageUrl: ogImageUrl.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to save blog post")
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded" />
          <div>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-56 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/blog"
          className="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Blog Post</h1>
          <p className="text-muted-foreground mt-1">
            Update post content and settings.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>Blog post saved successfully.</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Main content area */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Post title"
                    className="text-xl font-semibold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">/blog/</span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="post-slug"
                      className="font-mono text-sm"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your blog post..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Excerpt</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary of the post (used in listings and SEO)"
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isPublished"
                    checked={isPublished}
                    onCheckedChange={(checked) => setIsPublished(checked === true)}
                  />
                  <Label htmlFor="isPublished" className="cursor-pointer">
                    Published
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publishDate">Publish Date</Label>
                  <Input
                    type="date"
                    id="publishDate"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Leave blank to use current date when published.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hero Image</CardTitle>
              </CardHeader>
              <CardContent>
                {heroImageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={heroImageUrl}
                      alt="Hero preview"
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setHeroImageUrl("")}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setMediaPickerTarget("hero"); setMediaPickerOpen(true) }}
                    className="w-full h-32 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-600 hover:text-blue-600 transition-colors"
                  >
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-sm">Choose image</span>
                  </button>
                )}
              </CardContent>
            </Card>

            {categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`cat-${cat.id}`}
                          checked={selectedCategoryIds.includes(cat.id)}
                          onCheckedChange={() => toggleCategory(cat.id)}
                        />
                        <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer text-sm">
                          {cat.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          selectedTagIds.includes(tag.id)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-300 hover:border-blue-600 hover:text-blue-600"
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="SEO title (defaults to post title)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Brief description for search engines"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogImageUrl">OG Image URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="ogImageUrl"
                      value={ogImageUrl}
                      onChange={(e) => setOgImageUrl(e.target.value)}
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={() => { setMediaPickerTarget("og"); setMediaPickerOpen(true) }}
                      className="p-2 border rounded-md hover:bg-gray-50 shrink-0"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>
                  </div>
                  {ogImageUrl && (
                    <div className="relative rounded-lg overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ogImageUrl} alt="OG preview" className="w-full h-24 object-cover" />
                      <button
                        type="button"
                        onClick={() => setOgImageUrl("")}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save Post"}
            </Button>
          </div>
        </div>
      </form>

      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(media) => {
          if (mediaPickerTarget === "og") {
            setOgImageUrl(media.filePath)
          } else {
            setHeroImageUrl(media.filePath)
          }
          setMediaPickerOpen(false)
        }}
        accept="image"
      />
    </div>
  )
}
