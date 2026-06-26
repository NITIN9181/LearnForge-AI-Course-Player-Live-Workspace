"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type CourseFormData = {
  title: string;
  description: string;
  imageUrl: string;
  published: boolean;
};

type CourseFormProps = {
  initialData?: CourseFormData;
  courseId?: string;
  mode: "create" | "edit";
};

export function CourseForm({ initialData, courseId, mode }: CourseFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<CourseFormData>(
    initialData ?? { title: "", description: "", imageUrl: "", published: false },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = mode === "create" ? "/api/courses" : `/api/courses/${courseId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save course");
      }

      router.push("/admin/courses");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-forge-red/10 border border-forge-red/30 px-4 py-3 text-body-s text-forge-red">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className="text-body-s text-forge-muted font-medium">
          Title
        </label>
        <input
          id="title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-md bg-forge-void border border-forge-border px-3 py-2 text-body-m text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-violet"
          placeholder="Course title"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-body-s text-forge-muted font-medium">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-md bg-forge-void border border-forge-border px-3 py-2 text-body-m text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-violet resize-y"
          placeholder="Course description"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="imageUrl" className="text-body-s text-forge-muted font-medium">
          Cover Image URL
        </label>
        <input
          id="imageUrl"
          type="url"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          className="w-full rounded-md bg-forge-void border border-forge-border px-3 py-2 text-body-m text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-violet"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
          className="size-4 rounded border-forge-border bg-forge-void text-forge-violet focus:ring-forge-violet"
        />
        <span className="text-body-m text-forge-text">Published</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="bg-forge-violet text-white hover:bg-forge-violet/90"
        >
          {saving ? "Saving…" : mode === "create" ? "Create Course" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="text-forge-muted hover:text-forge-text"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
