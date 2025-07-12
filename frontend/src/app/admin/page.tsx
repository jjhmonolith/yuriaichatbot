'use client';

import React from 'react';
import { BookOpen, FileText, HelpCircle, TrendingUp } from 'lucide-react';

const stats = [
  { name: '총 교재', value: '12', icon: BookOpen, change: '+2', changeType: 'positive' },
  { name: '지문세트', value: '245', icon: FileText, change: '+12', changeType: 'positive' },
  { name: '등록된 문제', value: '1,230', icon: HelpCircle, change: '+48', changeType: 'positive' },
  { name: '이번 달 질문', value: '2,847', icon: TrendingUp, change: '+127', changeType: 'positive' },
];

export default function AdminDashboard() {
  return (
    <div className="px-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="mt-2 text-gray-600">
          EduChat AI 학습 시스템 관리 현황
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white overflow-hidden rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">최근 활동</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900">
                    새 교재 <span className="font-medium">"고등 문학 심화"</span> 추가됨
                  </p>
                  <p className="text-sm text-gray-500">2분 전</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900">
                    지문세트 <span className="font-medium">"현대시 분석"</span> 수정됨
                  </p>
                  <p className="text-sm text-gray-500">15분 전</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <HelpCircle className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900">
                    문제 3개가 새로 등록됨
                  </p>
                  <p className="text-sm text-gray-500">1시간 전</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">빠른 작업</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">새 교재 추가</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button className="w-full flex items-center justify-between p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">지문세트 생성</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button className="w-full flex items-center justify-between p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <HelpCircle className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">문제 등록</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button className="w-full flex items-center justify-between p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-900">사용 통계</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}