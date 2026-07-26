'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import { learningApi } from '@/lib/learning-api';
import type { Quiz, QuizAttempt } from '@/types/learning';

export default function QuizPage({ params }: { params: Promise<{ id: string; quizId: string }> }) {
  const { id, quizId } = use(params);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    learningApi.getQuizById(quizId)
      .then(setQuiz)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const res = await learningApi.submitQuizAttempt({ quizId, timeTaken, answers });
      setResult(res);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => <SkeletonLoader key={i} className="h-40 rounded-xl" />)}
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <h2 className="text-xl font-semibold text-gray-900">Quiz not found</h2>
        <Link href={`/learn/${id}`} className="mt-6 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Back to Course</Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-6">
        <Link href={`/learn/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back to Course
        </Link>
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          {result.passed ? (
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
          )}
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            {result.passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h1>
          <p className="mt-2 text-gray-600">
            You scored <span className="font-semibold">{result.score}%</span> ({result.correctAnswers}/{result.totalQuestions} correct)
          </p>
          <p className="mt-1 text-sm text-gray-500">Passing score: {result.passingScore}%</p>
          {result.timeTaken && (
            <p className="mt-1 text-sm text-gray-500">Time: {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s</p>
          )}
          <div className="mt-8 flex justify-center gap-3">
            <Link href={`/learn/${id}`} className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
              Back to Course
            </Link>
            {!result.passed && (
              <button onClick={() => { setResult(null); setAnswers({}); }} className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href={`/learn/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Course
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
        {quiz.description && <p className="mt-2 text-gray-600">{quiz.description}</p>}
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
          {quiz.timeLimit && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{quiz.timeLimit} min</span>}
          <span>{quiz.questions.length} questions</span>
          <span>Pass: {quiz.passingScore}%</span>
        </div>
      </div>

      <div className="space-y-4">
        {quiz.questions.map((question, qIdx) => (
          <div key={question.id} className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-900">
              <span className="text-primary-600">Q{qIdx + 1}.</span> {question.text}
            </p>
            <div className="mt-4 space-y-2">
              {question.answerOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(question.id, option.id)}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    answers[question.id] === option.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting || Object.keys(answers).length < quiz.questions.length}
          className="rounded-lg bg-primary-600 px-8 py-3 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>
    </div>
  );
}
