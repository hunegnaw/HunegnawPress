"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertCircle,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  GripVertical,
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

interface CategoryRecord {
  id: string
  name: string
  slug: string
  color: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
  _count: {
    posts: number
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function SortableRow({
  category,
  deleting,
  onEdit,
  onDelete,
}: {
  category: CategoryRecord
  deleting: string | null
  onEdit: (cat: CategoryRecord) => void
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

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
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {category.color && (
            <span
              className="inline-block w-3 h-3 rounded-full border border-gray-200"
              style={{ backgroundColor: category.color }}
            />
          )}
          {category.name}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground font-mono text-sm">
        {category.slug}
      </TableCell>
      <TableCell className="text-center text-sm text-muted-foreground">
        {category._count.posts}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category.id)}
            disabled={deleting === category.id}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function AdminBlogCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogSaving, setDialogSaving] = useState(false)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null)
  const [formName, setFormName] = useState("")
  const [formSlug, setFormSlug] = useState("")
  const [formColor, setFormColor] = useState("#2563eb")
  const [formSlugManuallyEdited, setFormSlugManuallyEdited] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/blog/categories")
      if (!res.ok) throw new Error("Failed to fetch categories")
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => fetchCategories())
  }, [fetchCategories])

  function openCreateDialog() {
    setEditingCategory(null)
    setFormName("")
    setFormSlug("")
    setFormColor("#2563eb")
    setFormSlugManuallyEdited(false)
    setDialogError(null)
    setDialogOpen(true)
  }

  function openEditDialog(cat: CategoryRecord) {
    setEditingCategory(cat)
    setFormName(cat.name)
    setFormSlug(cat.slug)
    setFormColor(cat.color || "#2563eb")
    setFormSlugManuallyEdited(true)
    setDialogError(null)
    setDialogOpen(true)
  }

  function handleFormNameChange(value: string) {
    setFormName(value)
    if (!formSlugManuallyEdited) {
      setFormSlug(slugify(value))
    }
  }

  function handleFormSlugChange(value: string) {
    setFormSlugManuallyEdited(true)
    setFormSlug(slugify(value))
  }

  async function handleDialogSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim() || !formSlug.trim()) {
      setDialogError("Name and slug are required.")
      return
    }

    setDialogSaving(true)
    setDialogError(null)

    try {
      if (editingCategory) {
        // Update
        const res = await fetch(`/api/admin/blog/categories/${editingCategory.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            slug: formSlug.trim(),
            color: formColor,
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "Failed to update category")
        }
      } else {
        // Create
        const res = await fetch("/api/admin/blog/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            slug: formSlug.trim(),
            color: formColor,
            sortOrder: categories.length,
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "Failed to create category")
        }
      }

      setDialogOpen(false)
      fetchCategories()
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setDialogSaving(false)
    }
  }

  async function handleDelete(categoryId: string) {
    if (deleting) return
    if (!confirm("Are you sure you want to delete this category? This cannot be undone.")) return

    setDeleting(categoryId)
    try {
      const res = await fetch(`/api/admin/blog/categories/${categoryId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete category")
      fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category")
    } finally {
      setDeleting(null)
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(categories, oldIndex, newIndex).map((c, i) => ({
      ...c,
      sortOrder: i,
    }))

    setCategories(reordered)

    // Save reorder via individual PATCHes
    try {
      await Promise.all(
        reordered.map((c, i) =>
          fetch(`/api/admin/blog/categories/${c.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder: i }),
          })
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category order")
      fetchCategories()
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Blog Categories</h1>
            <p className="text-muted-foreground mt-1">
              Manage blog post categories.
            </p>
          </div>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Category
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {loading ? "Loading..." : `${categories.length} categor${categories.length !== 1 ? "ies" : "y"}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-800">
              <TableRow className="border-b-0 hover:bg-slate-800">
                <TableHead className="w-8 text-white/80"></TableHead>
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">Slug</TableHead>
                <TableHead className="text-center text-white">Posts</TableHead>
                <TableHead className="text-right text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No categories yet. Create your first category to get started.
                  </TableCell>
                </TableRow>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={categories.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {categories.map((category) => (
                      <SortableRow
                        key={category.id}
                        category={category}
                        deleting={deleting}
                        onEdit={openEditDialog}
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDialogSubmit} className="space-y-4">
            {dialogError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{dialogError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="catName">Name</Label>
              <Input
                id="catName"
                value={formName}
                onChange={(e) => handleFormNameChange(e.target.value)}
                placeholder="Category name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catSlug">Slug</Label>
              <Input
                id="catSlug"
                value={formSlug}
                onChange={(e) => handleFormSlugChange(e.target.value)}
                placeholder="category-slug"
                className="font-mono text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catColor">Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="catColor"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0"
                />
                <Input
                  value={formColor}
                  onChange={(e) => {
                    const v = e.target.value
                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setFormColor(v)
                  }}
                  className="flex-1 font-mono text-sm"
                  placeholder="#2563eb"
                />
                <span
                  className="w-6 h-6 rounded-full border border-blue-600/30"
                  style={{ backgroundColor: formColor }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={dialogSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {dialogSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingCategory ? "Save" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
