'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, FileText, HelpCircle, TrendingUp } from 'lucide-react';

interface StatItem {
  name: string;
  value: string;
  icon: any;
  change: string;
  changeType: string;
}

interface Activity {
  type: string;
  action: string;
  title: string;
  timestamp: string;
  icon: string;
  description: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<StatItem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yuriaichatbot-production-1f9d.up.railway.app/api';
      
      // 통계 데이터 가져오기
      const statsResponse = await fetch(`${apiUrl}/admin/dashboard/stats`);
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        // 아이콘 매핑
        const statsWithIcons = statsData.data.stats.map((stat: any) => ({
          ...stat,
          icon: stat.name === '총 교재' ? BookOpen :
                stat.name === '지문세트' ? FileText :
                stat.name === '등록된 문제' ? HelpCircle :
                TrendingUp
        }));
        setStats(statsWithIcons);
      }
      
      // 최근 활동 데이터 가져오기
      const activityResponse = await fetch(`${apiUrl}/admin/dashboard/recent-activity`);
      const activityData = await activityResponse.json();
      
      if (activityData.success) {
        setActivities(activityData.data.activities);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError('대시보드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return BookOpen;
      case 'FileText': return FileText;
      case 'HelpCircle': return HelpCircle;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <div className="px-6 mx-auto max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">대시보드를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 mx-auto max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </div>
    );
  }

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
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">최근 활동이 없습니다.</p>
                </div>
              ) : (
                activities.map((activity, index) => {
                  const IconComponent = getIconComponent(activity.icon);
                  const iconColor = activity.type === 'textbook' ? 'blue' :
                                  activity.type === 'passageSet' ? 'green' : 'purple';
                  
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`h-8 w-8 rounded-full bg-${iconColor}-100 flex items-center justify-center`}>
                          <IconComponent className={`h-4 w-4 text-${iconColor}-600`} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-sm text-gray-500">{getTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">빠른 작업</h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/admin/textbooks')}
                className="w-full flex items-center justify-between p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">새 교재 추가</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button 
                onClick={() => router.push('/admin/passage-sets')}
                className="w-full flex items-center justify-between p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">지문세트 생성</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button 
                onClick={() => router.push('/admin/passage-sets')}
                className="w-full flex items-center justify-between p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <HelpCircle className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">문제 등록</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button 
                onClick={() => router.push('/admin/prompts')}
                className="w-full flex items-center justify-between p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-900">프롬프트 관리</span>
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