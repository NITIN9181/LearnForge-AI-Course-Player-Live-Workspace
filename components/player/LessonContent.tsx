import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { Clock, BookOpen } from "lucide-react";
import { Callout } from "@/components/mdx/Callout";
import { Quiz } from "@/components/mdx/Quiz";
import { CodeBlock } from "@/components/mdx/CodeBlock";

const mdxComponents = {
  Callout,
  Quiz,
  CodeBlock,
};

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

function TaskObjectiveBadge({ objective }: { objective: string }) {
  return (
    <div className="mb-6 rounded-lg border border-forge-violet/25 bg-forge-violet/7 p-[14px_18px]">
      <p className="mb-1 text-label text-forge-violet">▸ TASK</p>
      <p className="text-body-s text-forge-ink">{objective}</p>
    </div>
  );
}

type LessonWithModule = {
  id: string;
  title: string;
  slug: string;
  content: string;
  taskObjective: string | null;
  module: {
    title: string;
    order: number;
    course: {
      title: string;
    };
  };
};

export function LessonContent({ lesson }: { lesson: LessonWithModule }) {
  const readTime = estimateReadTime(lesson.content);

  return (
    <article className="h-full overflow-y-auto bg-forge-document">
      <div className="mx-auto max-w-3xl px-8 py-12">
        <div className="mb-2 flex items-center gap-2 text-label text-forge-muted">
          <BookOpen className="h-3.5 w-3.5" />
          {lesson.module.course.title}
          <span className="text-forge-border">·</span>
          Module {lesson.module.order}
        </div>

        <h1 className="mb-3 text-heading-1 text-forge-ink">{lesson.title}</h1>

        <div className="mb-6 flex items-center gap-4 text-body-s text-forge-muted">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {readTime} min read
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            {lesson.module.title}
          </span>
        </div>

        {lesson.taskObjective && <TaskObjectiveBadge objective={lesson.taskObjective} />}

        <div className="prose prose-sm max-w-none prose-headings:text-forge-ink prose-headings:font-semibold prose-h1:text-heading-1 prose-h2:text-heading-2 prose-h3:text-heading-3 prose-p:text-body-l prose-p:leading-[1.75] prose-p:text-forge-ink prose-a:text-forge-violet prose-strong:text-forge-ink prose-code:rounded prose-code:bg-forge-code-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:text-body-s prose-code:text-forge-text prose-pre:bg-transparent prose-pre:p-0 prose-pre:font-mono prose-ol:text-body-l prose-ol:text-forge-ink prose-ul:text-body-l prose-ul:text-forge-ink prose-li:text-body-l prose-li:text-forge-ink prose-img:rounded-lg prose-blockquote:border-l-forge-violet prose-blockquote:text-forge-muted">
          <MDXRemote
            source={lesson.content}
            options={{
              mdxOptions: {
                rehypePlugins: [rehypeHighlight],
                remarkPlugins: [remarkGfm],
              },
            }}
            components={mdxComponents}
          />
        </div>
      </div>
    </article>
  );
}
