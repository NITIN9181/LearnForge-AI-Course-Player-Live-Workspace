"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type QuizOption = {
  id: string;
  text: string;
  correct: boolean;
};

export function Quiz({ question, options }: { question: string; options: QuizOption[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const selectedOption = options.find((o) => o.id === selected);
  const isCorrect = selectedOption?.correct ?? false;

  const handleCheck = () => {
    if (selected) setChecked(true);
  };

  const handleRetry = () => {
    setSelected(null);
    setChecked(false);
  };

  return (
    <div className="my-6 rounded-lg border border-forge-border bg-forge-surface p-5">
      <p className="mb-3 text-body-m font-semibold text-forge-text">{question}</p>

      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const isSelected = selected === option.id;
          let borderColor = "border-forge-border";
          let bgColor = "bg-transparent";

          if (checked) {
            if (option.correct) {
              borderColor = "border-forge-mint";
              bgColor = "bg-forge-mint/10";
            } else if (isSelected && !option.correct) {
              borderColor = "border-forge-red";
              bgColor = "bg-forge-red/10";
            }
          } else if (isSelected) {
            borderColor = "border-forge-violet";
            bgColor = "bg-forge-violet/10";
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                if (!checked) {
                  setSelected(option.id);
                  setChecked(false);
                }
              }}
              disabled={checked}
              className={`flex items-center gap-3 rounded-md border px-4 py-3 text-left text-body-s text-forge-text transition-colors disabled:cursor-default ${borderColor} ${bgColor} ${
                !checked ? "hover:border-forge-violet-dim cursor-pointer" : ""
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected && !checked
                    ? "border-forge-violet bg-forge-violet"
                    : checked && option.correct
                      ? "border-forge-mint bg-forge-mint"
                      : checked && isSelected && !option.correct
                        ? "border-forge-red bg-forge-red"
                        : "border-forge-border"
                }`}
              >
                {isSelected && !checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                {checked && option.correct && <CheckCircle2 className="h-3 w-3 text-white" />}
                {checked && isSelected && !option.correct && (
                  <XCircle className="h-3 w-3 text-white" />
                )}
              </span>
              {option.text}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {!checked ? (
          <button
            type="button"
            onClick={handleCheck}
            disabled={!selected}
            className="rounded-md bg-forge-violet px-4 py-2 text-body-s font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-38 disabled:cursor-not-allowed"
          >
            Check Answer
          </button>
        ) : (
          <div className="flex items-center gap-3">
            {isCorrect ? (
              <span className="flex items-center gap-1.5 text-body-s text-forge-mint">
                <CheckCircle2 className="h-4 w-4" />
                Correct!
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-body-s text-forge-red">
                <XCircle className="h-4 w-4" />
                Not quite — review the lesson content and try again.
              </span>
            )}
            {!isCorrect && (
              <button
                type="button"
                onClick={handleRetry}
                className="text-body-s text-forge-violet underline-offset-2 hover:underline"
              >
                Try again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
