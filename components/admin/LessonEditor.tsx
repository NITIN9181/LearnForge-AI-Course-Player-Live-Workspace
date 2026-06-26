"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

type LessonFormData = {
  title: string;
  slug: string;
  order: number;
  moduleId: string;
  content: string;
  systemPrompt: string;
  hintSystemPrompt: string;
  taskObjective: string;
};

type LessonEditorProps = {
  initialData?: LessonFormData;
  lessonId?: string;
  modules: Array<{ id: string; title: string; order: number }>;
  mode: "create" | "edit";
  courseId: string;
  nextOrder: number;
};

export function LessonEditor({
  initialData,
  lessonId,
  modules,
  mode,
  courseId,
  nextOrder,
}: LessonEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<LessonFormData>(
    initialData ?? {
      title: "",
      slug: "",
      order: nextOrder,
      moduleId: modules[0]?.id ?? "",
      content: "",
      systemPrompt: "",
      hintSystemPrompt: "",
      taskObjective: "",
    },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: mode === "create" ? slugify(title) : prev.slug,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = mode === "create" ? "/api/lessons" : `/api/lessons/${lessonId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save lesson");
      }

      router.push(`/admin/courses/${courseId}`);
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-body-s text-forge-muted font-medium">
            Title
          </label>
          <input
            id="title"
            required
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded-md bg-forge-void border border-forge-border px-3 py-2 text-body-m text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-violet"
            placeholder="Lesson title"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-body-s text-forge-muted font-medium">
            Slug
          </label>
          <input
            id="slug"
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full rounded-md bg-forge-void border border-forge-border px-3 py-2 text-body-m text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-violet font-mono text-body-s"
            placeholder="lesson-slug"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="moduleId" className="text-body-s text-forge-muted font-medium">
            Module
          </label>
          <select
            id="moduleId"
            value={form.moduleId}
            onChange={(e) => setForm({ ...form, moduleId: e.target.value })}
            className="w-full rounded-md bg-forge-void border border-forge-border px-3 py-2 text-body-m text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-violet"
          >
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="order" className="text-body-s text-forge-muted font-medium">
            Order
          </label>
          <input
            id="order"
            type="number"
            min={0}
            value={form.order}
            onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
            className="w-full rounded-md bg-forge-void border border-forge-border px-3 py-2 text-body-m text-forge-text focus:outline-none focus:ring-2 focus:ring-forge-violet"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-body-s text-forge-muted font-medium">
          MDX Content
        </label>
        <textarea
          id="content"
          rows={20}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full rounded-md bg-forge-void border border-forge-border px-3 py-2 text-body-m text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-violet font-mono text-body-s resize-y"
          placeholder="Write lesson content in MDX..."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="systemPrompt" className="text-body-s text-forge-muted font-medium">
          System Prompt (AI Tutor Persona)
        </label>
        <textarea
          id="systemPrompt"
          rows={10}
          value={form.systemPrompt}
          onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
          className="w-full rounded-md bg-forge-void border border-forge-border px-3 py-2 text-body-m text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-violet font-mono text-body-s resize-y"
          placeholder="You are an AI tutor teaching..."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="hintSystemPrompt" className="text-body-s text-forge-muted font-medium">
          Hint System Prompt (optional)
        </label>
        <textarea
          id="hintSystemPrompt"
          rows={6}
          value={form.hintSystemPrompt}
          onChange={(e) => setForm({ ...form, hintSystemPrompt: e.target.value })}
          className="w-full rounded-md bg-forge-void border border-forge-border px-3 py-2 text-body-m text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-violet font-mono text-body-s resize-y"
          placeholder="You are a Socratic tutor. Ask guiding questions..."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="taskObjective" className="text-body-s text-forge-muted font-medium">
          Task Objective (optional)
        </label>
        <textarea
          id="taskObjective"
          rows={3}
          value={form.taskObjective}
          onChange={(e) => setForm({ ...form, taskObjective: e.target.value })}
          className="w-full rounded-md bg-forge-void border border-forge-border px-3 py-2 text-body-m text-forge-text placeholder:text-forge-muted focus:outline-none focus:ring-2 focus:ring-forge-violet resize-y"
          placeholder="Write a zero-shot prompt that..."
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="bg-forge-violet text-white hover:bg-forge-violet/90"
        >
          {saving ? "Saving…" : mode === "create" ? "Create Lesson" : "Save Changes"}
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
