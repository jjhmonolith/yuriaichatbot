'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronLeft, ChevronRight, ChevronDown, CheckCircle, XCircle } from 'lucide-react';

interface QuestionsDrawerContentProps {
  questions: any[];
}

export default function QuestionsDrawerContent({ questions }: QuestionsDrawerContentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">문제가 없습니다</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const goToPrevious = () => {
    setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
  };

  const goToNext = () => {
    setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1));
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setIsDropdownOpen(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 네비게이션 헤더 */}
      <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 p-4">
        <button
          onClick={goToPrevious}
          disabled={currentQuestionIndex === 0}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* 문제 선택 드롭다운 */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <span className="font-medium">
              문제 {currentQuestion.questionNumber}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* 드롭다운 메뉴 */}
          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                {questions.map((question, index) => (
                  <button
                    key={question._id}
                    onClick={() => goToQuestion(index)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                      index === currentQuestionIndex ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    문제 {question.questionNumber}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={goToNext}
          disabled={currentQuestionIndex === questions.length - 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 문제 내용 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 문제 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            문제 {currentQuestion.questionNumber}
          </h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {currentQuestion.questionText}
          </p>
        </div>

        {/* 선택지 */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">선택지</h4>
          {currentQuestion.options.map((option: string, optionIndex: number) => (
            <div 
              key={optionIndex}
              className={`p-3 rounded-lg border-2 transition-colors ${
                option === currentQuestion.correctAnswer
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-700">
                  {String.fromCharCode(9312 + optionIndex)} {option}
                </span>
                {option === currentQuestion.correctAnswer && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">정답</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 정답 */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-900 mb-2 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            정답
          </h4>
          <p className="text-green-800 font-medium">
            {currentQuestion.correctAnswer}
          </p>
        </div>

        {/* 해설 */}
        {currentQuestion.explanation && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">해설</h4>
            <div className="prose max-w-none
              [&>h1]:!text-base [&>h1]:!font-bold [&>h1]:!text-blue-900 [&>h1]:mb-2 [&>h1]:mt-3
              [&>h2]:!text-sm [&>h2]:!font-bold [&>h2]:!text-blue-900 [&>h2]:mb-2 [&>h2]:mt-3  
              [&>h3]:!text-xs [&>h3]:!font-semibold [&>h3]:!text-blue-900 [&>h3]:mb-1 [&>h3]:mt-2
              [&>h4]:!text-xs [&>h4]:!font-semibold [&>h4]:!text-blue-900 [&>h4]:mb-1 [&>h4]:mt-2
              [&>p]:text-sm [&>p]:text-blue-800 [&>p]:mb-2 [&>p]:leading-relaxed
              [&>strong]:font-bold [&>strong]:text-blue-900
              [&>em]:italic [&>em]:text-blue-700
              [&>code]:text-xs [&>code]:text-purple-600 [&>code]:bg-purple-50 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded
              [&>ul]:text-sm [&>ul]:text-blue-800 [&>ul]:mb-2 [&>ul]:pl-4 [&>ul]:list-disc
              [&>ol]:text-sm [&>ol]:text-blue-800 [&>ol]:mb-2 [&>ol]:pl-4 [&>ol]:list-decimal
              [&>li]:text-blue-800 [&>li]:mb-1 [&>li]:list-item
              [&>blockquote]:border-l-4 [&>blockquote]:border-blue-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-blue-600">
              <ReactMarkdown>{currentQuestion.explanation}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* 하단 정보 */}
      <div className="bg-gray-50 border-t border-gray-200 p-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {currentQuestionIndex + 1} / {questions.length}
          </span>
          <span className="flex items-center space-x-4">
            <span>문제 {currentQuestion.questionNumber}</span>
          </span>
        </div>
      </div>
    </div>
  );
}