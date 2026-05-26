"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/utils"
import {
  Search,
  Pencil,
  Trash2,
  AlertCircle,
  ExternalLink,
  GripVertical,
  Eye,
  FolderOpen,
  Tags,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface BlogPostRecord {
  id: string
  title: string
  slug: string
  excerpt: string | null
  isPublished: boolean
  isDraft: boolean
  publishedAt: string | null
  readTime: number | null
  viewCount: number
  sortOrder: number
  heroImageUrl: string | null
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string | null
    email: string
  }
  categories: {
    category: {
      id: string
      name: string
      slug: string
      color: string | null
    }
  }[]
  tags: {
    tag: {
      id: string
      name: string
      slug: string
      color: string | null
    }
  }[]
}

interface CategoryOption {
  id: string
  name: string
  slug: string
}

function SortableRow({
  post,
  deleting,
  onDelete,
}: {
  post: BlogPostRecord
  deleting: string | null
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: post.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-8">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="font-medium max-w-[250px] truncate">{post.title}</TableCell>
      <TableCell className="text-muted-foreground font-mono text-sm">
        /blog/{post.slug}
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={
            post.isPublished
              ? "bg-[#eaf3de] text-[#3b6d11] border-[#3b6d11]/20"
              : "bg-gray-100 text-gray-800 border-gray-200"
          }
        >
          {post.isPublished ? "Published" : "Draft"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {post.categories.map(({ category }) => (
            <Badge
              key={category.id}
              variant="outline"
              className="text-[11px]"
              style={category.color ? { borderColor: category.color, color: category.color } : undefined}
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {post.author.name || post.author.email}
      </TableCell>
      <TableCell className="text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          {post.viewCount}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.updatedAt)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <a
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="View post"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <Link
            href={`/admin/blog/${post.id}/edit`}
            className="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(post.id)}
            disabled={deleting === post.id}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostRecord[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (categoryFilter) params.set("categoryId", categoryFilter)

      const res = await fetch(`/api/admin/blog?${params}`)
      if (!res.ok) throw new Error("Failed to fetch blog posts")
      const data = await res.json()
      setPosts(data.posts)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, categoryFilter])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/blog/categories")
      if (!res.ok) return
      const data = await res.json()
      setCategories(data.categories || [])
    } catch {
      // silently ignore
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => fetchPosts())
  }, [fetchPosts])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchPosts()
  }

  async function handleDelete(postId: string) {
    if (deleting) return
    if (!confirm("Are you sure you want to delete this blog post? This cannot be undone.")) return

    setDeleting(postId)
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete blog post")
      fetchPosts()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete blog post")
    } finally {
      setDeleting(null)
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = posts.findIndex((p) => p.id === active.id)
    const newIndex = posts.findIndex((p) => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(posts, oldIndex, newIndex).map((p, i) => ({
      ...p,
      sortOrder: i,
    }))

    setPosts(reordered)

    try {
      const res = await fetch("/api/admin/blog/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posts: reordered.map((p, i) => ({ id: p.id, sortOrder: i })),
        }),
      })
      if (!res.ok) throw new Error("Failed to save post order")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post order")
      fetchPosts()
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground mt-1">
            Manage blog posts, categories, and tags.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/blog/categories"
            className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium border hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            <FolderOpen className="h-4 w-4" />
            Categories
          </Link>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            New Post
          </Link>
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
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        {categories.length > 0 && (
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {loading ? "Loading..." : `${total} post${total !== 1 ? "s" : ""}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-800">
              <TableRow className="border-b-0 hover:bg-slate-800">
                <TableHead className="w-8 text-white/80"></TableHead>
                <TableHead className="text-white">Title</TableHead>
                <TableHead className="text-white">Slug</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Categories</TableHead>
                <TableHead className="text-white">Author</TableHead>
                <TableHead className="text-center text-white">Views</TableHead>
                <TableHead className="text-white">Date</TableHead>
                <TableHead className="text-right text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    {search || statusFilter !== "all" || categoryFilter
                      ? "No posts match your filters."
                      : "No blog posts yet. Create your first post to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={posts.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {posts.map((post) => (
                      <SortableRow
                        key={post.id}
                        post={post}
                        deleting={deleting}
                        onDelete={handleDelete}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
