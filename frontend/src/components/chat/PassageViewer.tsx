'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronDown, ChevronUp, BookOpen, HelpCircle } from 'lucide-react';

interface PassageViewerProps {
  passageData: any;
}

export default function PassageViewer({ passageData }: PassageViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'passage' | 'questions'>('passage');

  if (!passageData) return null;

  const { textbooks, set, questions } = passageData;
  
  // 새로운 구조에서는 textbooks 배열, 기존 구조에서는 textbook 객체
  const textbook = passageData.textbook || (textbooks && textbooks[0]);

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-900">{set?.title || '지문'}</h2>
              <p className="text-xs text-gray-600">
                {textbook ? `${textbook.title} - ${textbook.subject} (${textbook.level})` : '독립 지문세트'}
                {textbooks && textbooks.length > 1 && ` (+${textbooks.length - 1}개 교재)`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Tabs */}
          <div className="flex space-x-1 mb-4">
            <button
              onClick={() => setActiveTab('passage')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'passage'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="h-4 w-4 inline mr-2" />
              지문
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'questions'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <HelpCircle className="h-4 w-4 inline mr-2" />
              문제 ({questions?.length || 0}개)
            </button>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {activeTab === 'passage' ? (
              <div className="space-y-4">
                {/* 지문 내용 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">지문</h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {set?.passage || '지문 내용을 불러올 수 없습니다.'}
                  </p>
                </div>

                {/* 지문 해설 */}
                {set?.passageComment && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">지문 해설</h3>
                    <div className="text-sm prose prose-sm max-w-none prose-headings:text-blue-900 prose-p:text-blue-800 prose-strong:text-blue-900 prose-em:text-blue-700 prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:rounded prose-ul:text-blue-800 prose-ol:text-blue-800 prose-li:text-blue-800">
                      <ReactMarkdown>{set.passageComment}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {(questions || []).map((question: any, index: number) => (
                  <div key={question._id} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      문제 {question.questionNumber}
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      {question.questionText}
                    </p>
                    
                    <div className="space-y-1 mb-3">
                      {question.options.map((option: string, optionIndex: number) => (
                        <div 
                          key={optionIndex}
                          className={`text-xs p-2 rounded ${
                            option === question.correctAnswer
                              ? 'bg-green-100 text-green-800 font-medium'
                              : 'bg-white text-gray-600'
                          }`}
                        >
                          {String.fromCharCode(9312 + optionIndex)} {option}
                          {option === question.correctAnswer && (
                            <span className="ml-2 text-xs bg-green-200 px-1 rounded">정답</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {question.explanation && (
                      <div className="bg-purple-50 p-2 rounded">
                        <div className="text-xs font-medium text-purple-900 mb-1">해설:</div>
                        <div className="text-xs prose prose-xs max-w-none prose-headings:text-purple-900 prose-p:text-purple-800 prose-strong:text-purple-900 prose-em:text-purple-700 prose-code:text-purple-600 prose-code:bg-purple-100 prose-code:px-1 prose-code:rounded prose-ul:text-purple-800 prose-ol:text-purple-800 prose-li:text-purple-800">
                          <ReactMarkdown>{question.explanation}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}