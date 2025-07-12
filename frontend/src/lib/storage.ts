// localStorage를 사용한 채팅 세션 관리

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  qrCode: string;
  title: string;
  messages: ChatMessage[];
  lastActivity: number;
}

const STORAGE_KEY = 'edutech_chat';

export class ChatStorage {
  // 모든 세션 가져오기
  static getAllSessions(): Record<string, ChatSession> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data).sessions || {} : {};
    } catch (error) {
      console.error('Failed to get sessions:', error);
      return {};
    }
  }

  // 특정 세션 가져오기
  static getSession(qrCode: string): ChatSession | null {
    const sessions = this.getAllSessions();
    return sessions[qrCode] || null;
  }

  // 세션 저장/업데이트
  static saveSession(session: ChatSession): void {
    try {
      const sessions = this.getAllSessions();
      sessions[session.qrCode] = {
        ...session,
        lastActivity: Date.now()
      };

      const data = {
        sessions,
        recentSessions: this.updateRecentSessions(session.qrCode),
        settings: this.getSettings()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  // 메시지 추가
  static addMessage(qrCode: string, message: ChatMessage): void {
    const session = this.getSession(qrCode);
    if (session) {
      session.messages.push(message);
      this.saveSession(session);
    }
  }

  // 세션 생성
  static createSession(qrCode: string, title: string): ChatSession {
    const session: ChatSession = {
      qrCode,
      title,
      messages: [],
      lastActivity: Date.now()
    };
    
    this.saveSession(session);
    return session;
  }

  // 최근 세션 목록 업데이트
  static updateRecentSessions(qrCode: string): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : {};
      const recent = parsed.recentSessions || [];
      
      // 현재 QR 코드를 맨 앞으로 이동
      const filtered = recent.filter((code: string) => code !== qrCode);
      const updated = [qrCode, ...filtered].slice(0, 10); // 최대 10개 유지
      
      return updated;
    } catch (error) {
      console.error('Failed to update recent sessions:', error);
      return [qrCode];
    }
  }

  // 최근 세션 목록 가져오기
  static getRecentSessions(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data).recentSessions || [] : [];
    } catch (error) {
      console.error('Failed to get recent sessions:', error);
      return [];
    }
  }

  // 설정 가져오기
  static getSettings(): any {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data).settings || {} : {};
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {};
    }
  }

  // 설정 저장
  static saveSettings(settings: any): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : {};
      
      parsed.settings = { ...parsed.settings, ...settings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  // 오래된 세션 정리 (2주)
  static cleanupOldSessions(): void {
    try {
      const sessions = this.getAllSessions();
      const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
      const cleanedSessions: Record<string, ChatSession> = {};

      Object.entries(sessions).forEach(([qrCode, session]) => {
        if (session.lastActivity > twoWeeksAgo) {
          cleanedSessions[qrCode] = session;
        }
      });

      const data = {
        sessions: cleanedSessions,
        recentSessions: this.getRecentSessions().filter(qrCode => cleanedSessions[qrCode]),
        settings: this.getSettings()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to cleanup old sessions:', error);
    }
  }

  // 고유 메시지 ID 생성
  static generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}