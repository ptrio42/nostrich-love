import React, { useState } from "react";
import {
  BookOpen,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../hooks/useTranslation";
import { useQuizCompletion } from "../../hooks/useQuizCompletion";
import { guidePath } from "../../i18n/paths";

type Severity = "critical" | "warning" | "info";

interface Option {
  id: string;
  label: string;
  description?: string;
}

interface Question {
  id: string;
  title: string;
  prompt: string;
  options: Option[];
  correctId: string;
  explanation: string;
  severity: Severity;
}

interface WhatIsNostrQuizProps {
  className?: string;
}

export function WhatIsNostrQuiz({ className }: WhatIsNostrQuizProps) {
  const { t, getValue, locale } = useTranslation();

  // Get questions from translations using getValue to retrieve arrays/objects
  const rawQuestions = getValue("guides.whatIsNostr.quiz.questions");
  const questions: Question[] = Array.isArray(rawQuestions) ? rawQuestions : [];
  const quizTitle = t("guides.whatIsNostr.quiz.title");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  // Records the result once the reader reaches the results screen. Must stay
  // above the early return below — see useQuizCompletion for why.
  useQuizCompletion("what-is-nostr", showResults, questions, answers);
  const score = questions.reduce((acc, question) => (
    answers[question.id] === question.correctId ? acc + 1 : acc
  ), 0);

  // Handle case where translations haven't loaded yet
  if (!questions || questions.length === 0) {
    return (
      <div className={cn(
        // Keep the quiz typography separate from the surrounding article.
        "not-prose border-t border-gray-200 py-6 dark:border-gray-800",
        className
      )}>
        <div className="flex flex-col items-center text-center">
          <BookOpen aria-hidden="true" strokeWidth={1.5} className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          <p className="mt-4 text-body text-gray-600 dark:text-gray-300">{t("ui.quiz.loading")}</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;

  const handleSelect = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentIndex === total - 1) {
      setShowResults(true);
      return;
    }
    setCurrentIndex((prev) => Math.min(prev + 1, total - 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
  };

  if (showResults) {
    const successRate = Math.round((score / total) * 100);

    return (
      <div
        data-quiz
        className={cn(
          "not-prose border-t border-gray-200 py-6 dark:border-gray-800",
          className,
        )}
      >
        <div className="flex flex-col items-center text-center">
          <h3
            className="text-h2 font-bold text-gray-900 dark:text-white"
          >
            {t("ui.quiz.gradeTitle").replace("{{title}}", quizTitle).replace("{{rate}}", successRate.toString())}
          </h3>

          <p
            className="mt-2 text-body text-gray-600 dark:text-gray-300"
          >
            {t("ui.quiz.scoreDisplay").replace("{{score}}", score.toString()).replace("{{total}}", total.toString())}
          </p>

          <div className="mt-6 grid w-full gap-4 border-y border-gray-200 py-5 dark:border-gray-800">
            <ResultRow
              label={t("ui.quiz.conceptsMastered")}
              value={`${score} of ${total}`}
            />
            <ResultRow
              label={t("ui.quiz.nextSteps")}
              value={
                score === total
                  ? t("ui.quiz.perfectScore")
                  : t("ui.quiz.reviewSections")
              }
            />
          </div>

          <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
            <a
              className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-3 font-semibold text-primary-text transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:text-primary-400 dark:hover:border-gray-700 dark:hover:bg-gray-800"
              href={guidePath("keys-and-security", locale)}
            >
              {t("ui.quiz.reviewKeys")}
            </a>
            <a
              className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-3 font-semibold text-gray-800 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:border-gray-700 dark:hover:bg-gray-800"
              href={guidePath("quickstart", locale)}
            >
              {t("ui.quiz.tryQuickstart")}
            </a>
          </div>

          <button
            type="button"
            onClick={handleRestart}
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <RotateCcw aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
            {t("ui.quiz.retakeQuiz")}
          </button>
        </div>
      </div>
    );
  }

  const selectedOption = answers[currentQuestion.id];
  const isCorrect = selectedOption === currentQuestion.correctId;

  return (
    <div
      data-quiz
      className={cn(
        "not-prose border-t border-gray-200 py-6 dark:border-gray-800",
        className,
      )}
    >
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p
            className="text-micro font-semibold uppercase text-primary-text dark:text-primary-400"
          >
            {quizTitle}
          </p>
          <h3
            className="text-h3 font-bold text-gray-900 dark:text-white"
          >
            {currentQuestion.title}
          </h3>
          <p
            className="text-body-sm text-gray-500 dark:text-gray-400"
          >
            {t("ui.quiz.questionCounter").replace("{{current}}", (currentIndex + 1).toString()).replace("{{total}}", total.toString())}
          </p>
        </div>
        {/* The label used to live INSIDE the fill, which at 1 of 6 answered is
            about 17% of a 224px track — so the text spilled out over the grey
            and read as broken. `Math.max(15, …)` and `min-w-[60px]` were there
            to paper over it, and they also made the bar overstate progress.
            Label above, bar below: the fill is now the true fraction. */}
        <div className="w-full sm:w-56">
          <p className="mb-1 text-end text-caption font-semibold text-gray-600 dark:text-gray-300">
            {answeredCount}/{total} {t("ui.quiz.answered")}
          </p>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
            role="progressbar"
            aria-valuenow={answeredCount}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={t("ui.quiz.answered")}
          >
            <div
              className="h-full rounded-full bg-primary-600 transition-[width] duration-500 ease-out-quint motion-reduce:transition-none"
              style={{ width: `${(answeredCount / total) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <div key={currentIndex}>
          <p className="text-body text-gray-700 dark:text-gray-200">
            {currentQuestion.prompt}
          </p>

          <div className="mt-6 border-t border-gray-200 dark:border-gray-800">
            {currentQuestion.options.map((option) => {
              const isSelected = option.id === selectedOption;
              const isAnswer = option.id === currentQuestion.correctId;
              const showState = Boolean(selectedOption);

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => !showState && handleSelect(option.id)}
                  aria-pressed={isSelected}
                  disabled={showState}
                  className={cn(
                    "w-full border-b border-gray-200 px-2 py-4 text-start transition-colors dark:border-gray-800",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isSelected && "border-s-2 border-s-primary ps-4",
                    showState && isAnswer && "border-s-2 border-s-success-500 ps-4",
                    showState &&
                      isSelected &&
                      !isAnswer &&
                      "border-s-2 border-s-error-500 ps-4",
                    !isSelected &&
                      !showState &&
                      "hover:bg-gray-50 dark:hover:bg-gray-800",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {option.label}
                        </p>
                        {showState && isAnswer && (
                          <div>
                            <CheckCircle2 aria-hidden="true" strokeWidth={1.5} className="h-4 w-4 text-success-600 dark:text-success-400" />
                          </div>
                        )}
                        {showState && isSelected && !isAnswer && (
                          <div>
                            <XCircle aria-hidden="true" strokeWidth={1.5} className="h-4 w-4 text-error-600 dark:text-error-400" />
                          </div>
                        )}
                        <span className="sr-only">{showState && isAnswer ? t("ui.quiz.feedback.correct") : showState && isSelected && !isAnswer ? t("ui.quiz.feedback.incorrect") : ""}</span>
                      </div>
                      {option.description && (
                        <p className="text-body-sm text-gray-500 dark:text-gray-400">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div aria-live="polite">
            {selectedOption && (
              <div
                className={cn(
                  "mt-4 border-s-2 ps-4 text-body-sm",
                  isCorrect
                    ? "border-success-500 text-success-900 dark:text-success-100"
                    : "border-error-500 text-error-900 dark:text-error-100",
                )}
              >
                <div>
                  {isCorrect ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-flex">
                        <CheckCircle2 aria-hidden="true" strokeWidth={1.5} className="h-4 w-4 text-success-600 dark:text-success-400" />
                      </span>
                      <span className="font-semibold">{t("ui.quiz.feedback.correct")}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="inline-flex">
                        <XCircle aria-hidden="true" strokeWidth={1.5} className="h-4 w-4 text-error-600 dark:text-error-400" />
                      </span>
                      <span className="font-semibold">{t("ui.quiz.feedback.incorrect")}</span>
                    </span>
                  )}
                  {" "}{currentQuestion.explanation}
                </div>
              </div>
            )}
          </div>
      </div>

      <footer className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full justify-end gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-body-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 motion-reduce:transition-none"
          >
            <ChevronLeft aria-hidden="true" strokeWidth={1.5} className="h-4 w-4 rtl:rotate-180" />
            {t("ui.quiz.backButton")}
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!selectedOption}
            className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-5 py-2 text-body-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50 motion-reduce:transition-none"
          >
            {currentIndex === total - 1 ? t("ui.quiz.seeResults") : t("ui.quiz.nextButton")}
            <ChevronRight aria-hidden="true" strokeWidth={1.5} className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      </footer>
    </div>
  );
}

interface ResultRowProps {
  label: string;
  value: React.ReactNode;
}

function ResultRow({ label, value }: ResultRowProps) {
  return (
    <div className="flex items-center justify-between text-body-sm text-gray-600 dark:text-gray-300">
      <span>{label}</span>
      <span className="font-semibold text-gray-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}

export default WhatIsNostrQuiz;
