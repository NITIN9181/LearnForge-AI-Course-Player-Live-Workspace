import { PrismaClient, Role, ProgressStatus } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hash("demo-admin", 12);
  const learnerPassword = await hash("demo-learner", 12);

  await prisma.user.upsert({
    where: { email: "admin@learnforge.dev" },
    update: {},
    create: {
      email: "admin@learnforge.dev",
      name: "Admin User",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const learner = await prisma.user.upsert({
    where: { email: "demo@learnforge.dev" },
    update: {},
    create: {
      email: "demo@learnforge.dev",
      name: "Demo Learner",
      password: learnerPassword,
      role: Role.LEARNER,
    },
  });

  const course1 = await prisma.course.upsert({
    where: { slug: "prompt-engineering-fundamentals" },
    update: {},
    create: {
      title: "Prompt Engineering Fundamentals",
      slug: "prompt-engineering-fundamentals",
      description:
        "Master the core techniques of prompt engineering. Learn zero-shot, few-shot, chain-of-thought, and role prompting through hands-on exercises with an AI tutor.",
      published: true,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: "advanced-prompt-techniques" },
    update: {},
    create: {
      title: "Advanced Prompt Techniques",
      slug: "advanced-prompt-techniques",
      description:
        "Dive deeper into structured outputs, multi-step reasoning, and prompt chaining. Build production-ready prompting workflows.",
      published: true,
    },
  });

  const modules = [
    { courseSlug: "prompt-engineering-fundamentals", title: "Introduction to Prompting", order: 1 },
    { courseSlug: "prompt-engineering-fundamentals", title: "Core Techniques", order: 2 },
    { courseSlug: "prompt-engineering-fundamentals", title: "Practical Applications", order: 3 },
    { courseSlug: "advanced-prompt-techniques", title: "Structured Outputs", order: 1 },
    { courseSlug: "advanced-prompt-techniques", title: "Multi-Step Reasoning", order: 2 },
    { courseSlug: "advanced-prompt-techniques", title: "Production Workflows", order: 3 },
  ];

  const createdModules: Record<string, string> = {};

  for (const mod of modules) {
    const courseSlug = mod.courseSlug;
    const course = courseSlug === "prompt-engineering-fundamentals" ? course1 : course2;
    const key = `${courseSlug}-${mod.order}`;
    const result = await prisma.module.upsert({
      where: { id: key },
      update: {},
      create: {
        id: key,
        title: mod.title,
        order: mod.order,
        courseId: course.id,
      },
    });
    createdModules[key] = result.id;
  }

  const lessons = [
    {
      moduleKey: "prompt-engineering-fundamentals-1",
      title: "What is a Prompt?",
      slug: "what-is-a-prompt",
      order: 1,
      content: `
# What is a Prompt?

A **prompt** is the input you give to an AI language model to guide its output. Think of it as giving instructions to a very capable assistant.

## Why Prompts Matter

The quality of your prompt directly determines the quality of the AI's response. A well-crafted prompt can mean the difference between a useful answer and gibberish.

### Key Elements of a Good Prompt

1. **Clarity** — Say exactly what you want
2. **Context** — Provide necessary background
3. **Format** — Specify how you want the output structured

> 💡 Good to know: Even small changes to your prompt can dramatically change the output. Experimentation is key!

## Your Turn

In the workspace on the right, try asking the AI tutor to explain what a prompt is in your own words.
      `.trim(),
      systemPrompt:
        "You are a friendly AI tutor teaching prompt engineering. Guide the learner through the basics of what a prompt is. Use examples and ask questions to engage them.",
      taskObjective: "Write a one-sentence definition of what a prompt is in your own words.",
    },
    {
      moduleKey: "prompt-engineering-fundamentals-1",
      title: "Zero-Shot Basics",
      slug: "zero-shot-basics",
      order: 2,
      content: `
# Zero-Shot Prompting

**Zero-shot** means asking the AI to perform a task without providing any examples. The model relies entirely on its training to understand what you want.

## Example

\`\`\`
Summarize the following article in 3 bullet points:
[article text here]
\`\`\`

## When to Use Zero-Shot

- Simple, well-defined tasks
- When you want creative or varied outputs
- When you don't have good examples to share

> ⚠️ Warning: Zero-shot can be unpredictable for complex or nuanced tasks. If the output isn't right, try adding more context.
      `.trim(),
      systemPrompt:
        "You are an AI tutor helping learners understand zero-shot prompting. Explain the concept clearly and provide examples. Encourage them to try writing their own zero-shot prompts.",
      hintSystemPrompt:
        "You are a Socratic tutor. Don't give the answer directly — ask guiding questions that help the learner discover what zero-shot prompting means.",
      taskObjective:
        "Write a zero-shot prompt that asks an LLM to summarize a short paragraph into 3 bullet points.",
    },
    {
      moduleKey: "prompt-engineering-fundamentals-2",
      title: "Structuring Output",
      slug: "structuring-output",
      order: 1,
      content: `
# Structuring AI Output

One of the most powerful techniques in prompt engineering is **specifying the output format** you want.

## Common Output Formats

- JSON objects
- Markdown tables
- Bullet points
- Numbered lists
- CSV data

## Example

\`\`\`
List 3 benefits of structured prompting.
Format your response as a JSON array of objects
with "benefit" and "explanation" keys.
\`\`\`

> ✦ Tip: JSON output is especially useful when you want to feed the AI's response into another program.
      `.trim(),
      systemPrompt:
        "You are an AI tutor teaching structured output techniques. Help learners understand how to specify output formats in their prompts. Show examples of JSON, markdown tables, and list formats.",
      taskObjective:
        "Write a prompt that asks for a list of 3 cat breeds in JSON format with 'name' and 'temperament' fields.",
    },
    {
      moduleKey: "prompt-engineering-fundamentals-2",
      title: "Role Prompting",
      slug: "role-prompting",
      order: 2,
      content: `
# Role Prompting

**Role prompting** means asking the AI to adopt a specific persona or perspective. This dramatically changes how the model responds.

## Why It Works

When you assign a role, you give the model context about:
- Tone and style
- Level of expertise
- Perspective and bias
- Vocabulary and framing

## Example

\`\`\`
You are a world-class chef. Explain the
Maillard reaction to a beginner cook.
\`\`\`

> ℹ️ Good to know: The more specific your role description, the more consistent the output will be.
      `.trim(),
      systemPrompt:
        "You are an AI tutor teaching role prompting techniques. Explain how assigning a persona changes the AI's output. Demonstrate with different role examples.",
      taskObjective:
        "Write a role prompt that asks an AI to act as a career coach giving advice to someone changing industries.",
    },
    {
      moduleKey: "advanced-prompt-techniques-1",
      title: "JSON Mode",
      slug: "json-mode",
      order: 1,
      content: `
# JSON Mode

Many modern LLMs support a **JSON mode** that guarantees structured JSON output. This is essential for building reliable AI-powered applications.

## How It Works

JSON mode constrains the model to output valid JSON that matches your schema. This is different from simply asking for JSON in your prompt.

> ✦ Tip: Always include an example of the expected JSON structure in your prompt, even when using JSON mode.

## Example

\`\`\`
Extract the following fields as JSON:
- name (string)
- age (number)
- skills (array of strings)
\`\`\`
      `.trim(),
      systemPrompt:
        "You are an AI tutor teaching JSON mode and structured data extraction. Explain how JSON mode works and why it's useful for production applications.",
      taskObjective:
        "Write a prompt that extracts name, age, and occupation from a short bio into a JSON object.",
    },
    {
      moduleKey: "advanced-prompt-techniques-2",
      title: "Chain of Thought",
      slug: "chain-of-thought",
      order: 1,
      content: `
# Chain of Thought Prompting

**Chain of Thought (CoT)** is a technique where you ask the AI to show its reasoning step by step. This leads to better results on complex problems.

## How It Works

Instead of asking for a direct answer, you prompt the model to work through the problem:

\`\`\`
Solve this step by step:
If a shirt costs $25 and is 20% off,
what's the final price?
\`\`\`

> ℹ️ Good to know: CoT is especially effective for math, logic, and multi-step reasoning tasks.
      `.trim(),
      systemPrompt:
        "You are an AI tutor teaching chain-of-thought prompting. Explain how breaking down reasoning steps improves accuracy on complex problems.",
      taskObjective:
        "Write a chain-of-thought prompt that solves a multi-step math problem about calculating compound interest.",
    },
    {
      moduleKey: "advanced-prompt-techniques-2",
      title: "Few-Shot Prompting",
      slug: "few-shot-prompting",
      order: 2,
      content: `
# Few-Shot Prompting

**Few-shot prompting** means providing examples in your prompt to show the model what you want. This is one of the most reliable techniques for getting consistent outputs.

## Structure

\`\`\`
Classify the sentiment of each review:

Review: "This product is amazing!"
Sentiment: Positive

Review: "Waste of money."
Sentiment: Negative

Review: "It's okay, I guess."
Sentiment:
\`\`\`

> ✦ Tip: 3-5 examples is usually the sweet spot. Too few and the pattern isn't clear; too many and you waste tokens.
      `.trim(),
      systemPrompt:
        "You are an AI tutor teaching few-shot prompting. Explain how providing examples helps the model understand the desired output pattern.",
      taskObjective:
        "Write a few-shot prompt that classifies customer reviews as Positive, Negative, or Neutral with at least 2 examples.",
    },
    {
      moduleKey: "advanced-prompt-techniques-3",
      title: "Prompt Chaining",
      slug: "prompt-chaining",
      order: 1,
      content: `
# Prompt Chaining

**Prompt chaining** is the practice of breaking a complex task into multiple smaller prompts, where the output of one becomes the input of the next.

## When to Chain

- Complex tasks with multiple steps
- When you need to verify intermediate results
- To stay within token limits
- To isolate different reasoning stages

> ⚠️ Warning: Each chain step adds latency. Balance thoroughness with response time.
      `.trim(),
      systemPrompt:
        "You are an AI tutor teaching prompt chaining. Explain how to decompose complex tasks into a sequence of simpler prompts and why this is useful.",
      taskObjective:
        "Design a two-step prompt chain that first extracts key points from a text and then formats them as a markdown table.",
    },
  ];

  for (const lesson of lessons) {
    const moduleId = createdModules[lesson.moduleKey]!;
    const existing = await prisma.lesson.findUnique({
      where: { moduleId_slug: { moduleId: moduleId, slug: lesson.slug } },
    });

    if (existing) {
      await prisma.lesson.update({
        where: { id: existing.id },
        data: {
          title: lesson.title,
          order: lesson.order,
          content: lesson.content,
          systemPrompt: lesson.systemPrompt,
          hintSystemPrompt: lesson.hintSystemPrompt ?? null,
          taskObjective: lesson.taskObjective,
        },
      });
    } else {
      await prisma.lesson.create({
        data: {
          title: lesson.title,
          slug: lesson.slug,
          order: lesson.order,
          moduleId: moduleId,
          content: lesson.content,
          systemPrompt: lesson.systemPrompt,
          hintSystemPrompt: lesson.hintSystemPrompt ?? null,
          taskObjective: lesson.taskObjective,
        },
      });
    }
  }

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: learner.id, courseId: course1.id } },
    update: {},
    create: {
      userId: learner.id,
      courseId: course1.id,
    },
  });

  const lessonsCourse1 = await prisma.lesson.findMany({
    where: { module: { courseId: course1.id } },
    orderBy: { order: "asc" },
  });

  if (lessonsCourse1.length >= 2) {
    const firstLesson = lessonsCourse1[0]!;
    const secondLesson = lessonsCourse1[1]!;

    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: learner.id, lessonId: firstLesson.id } },
      update: {},
      create: {
        userId: learner.id,
        lessonId: firstLesson.id,
        status: ProgressStatus.COMPLETE,
        completedAt: new Date(),
      },
    });

    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: learner.id, lessonId: secondLesson.id } },
      update: {},
      create: {
        userId: learner.id,
        lessonId: secondLesson.id,
        status: ProgressStatus.IN_PROGRESS,
      },
    });
  }

  console.log("Seed completed successfully");
  console.log(`  Admin: admin@learnforge.dev / demo-admin`);
  console.log(`  Demo:  demo@learnforge.dev / demo-learner`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
