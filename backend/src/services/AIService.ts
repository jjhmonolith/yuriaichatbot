import OpenAI from 'openai';
import { SystemPrompt } from '../models';

export class AIService {
  private static openai: OpenAI | null = null;

  // OpenAI 클라이언트 초기화
  private static getClient(): OpenAI | null {
    if (!this.openai && process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this.openai;
  }

  // AI 응답 생성
  static async generateResponse(
    userMessage: string,
    passageData: any,
    previousMessages: any[] = []
  ): Promise<string> {
    const client = this.getClient();
    
    // OpenAI API가 설정되지 않은 경우 더미 응답
    if (!client) {
      return this.generateDummyResponse(userMessage, passageData);
    }

    try {
      // 시스템 프롬프트 구성
      const systemPrompt = await this.buildSystemPrompt(passageData);
      
      // 대화 히스토리 구성
      const messages: any[] = [
        { role: 'system', content: systemPrompt }
      ];

      // 이전 대화 추가 (최근 5개만)
      const recentMessages = previousMessages.slice(-5);
      for (const msg of recentMessages) {
        messages.push({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }

      // 현재 사용자 메시지 추가
      messages.push({ role: 'user', content: userMessage });

      // OpenAI API 호출
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini', // 비용 효율적인 모델
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('AI 응답을 받을 수 없습니다.');
      }

      return aiResponse;
    } catch (error) {
      console.error('OpenAI API error details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        hasApiKey: !!process.env.OPENAI_API_KEY,
        apiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0
      });
      
      // API 오류 시 더미 응답으로 폴백
      return this.generateDummyResponse(userMessage, passageData);
    }
  }

  // 시스템 프롬프트 구성
  private static async buildSystemPrompt(passageData: any): Promise<string> {
    try {
      // 데이터베이스에서 채팅 어시스턴트 프롬프트 가져오기
      const promptDoc = await SystemPrompt.findOne({ 
        key: 'chat_assistant', 
        isActive: true 
      });

      let promptTemplate = promptDoc?.content;
      
      // 프롬프트가 없으면 기본 프롬프트 사용
      if (!promptTemplate) {
        promptTemplate = `당신은 {subject} 전문 AI 학습 도우미입니다.

# 학습 자료 정보
- 교재: {textbook_title} ({subject} - {level})
- 지문 제목: {passage_title}

# 지문 내용
{passage_content}

# 지문 해설
{passage_comment}

# 관련 문제
{questions}

# 역할과 지침
1. 학생의 질문에 교육적이고 이해하기 쉽게 답변해주세요
2. 지문의 내용과 관련된 질문에 중점을 두어 답변하세요
3. 문제 풀이를 요청하면 단계적으로 설명해주세요
4. 어려운 개념은 구체적인 예시를 들어 설명해주세요
5. 학생의 수준({level})에 맞는 언어로 설명해주세요
6. 답변은 500자 이내로 간결하게 작성해주세요
7. 친근하고 격려하는 톤으로 대화해주세요

학생이 질문하면 위 자료를 바탕으로 정확하고 도움이 되는 답변을 제공해주세요.`;
      }

      // 변수 치환
      const { textbooks, set, questions } = passageData;
      const textbook = textbooks && textbooks.length > 0 ? textbooks[0] : { title: '교재', subject: '일반', level: '기본' };
      
      const questionsText = questions.map((q: any, index: number) => 
        `문제 ${q.questionNumber}: ${q.questionText}
선택지: ${q.options.join(', ')}
정답: ${q.correctAnswer}
해설: ${q.explanation}`
      ).join('\n\n');

      return promptTemplate
        .replace(/{subject}/g, textbook.subject)
        .replace(/{textbook_title}/g, textbook.title)
        .replace(/{level}/g, textbook.level)
        .replace(/{passage_title}/g, set.title)
        .replace(/{passage_content}/g, set.passage)
        .replace(/{passage_comment}/g, set.passageComment)
        .replace(/{questions}/g, questionsText);
        
    } catch (error) {
      console.error('Error building system prompt:', error);
      // 오류 시 기본 프롬프트 반환
      return this.buildFallbackPrompt(passageData);
    }
  }

  // 폴백 프롬프트 (오류 시 사용)
  private static buildFallbackPrompt(passageData: any): string {
    const { textbooks, set, questions } = passageData;
    const textbook = textbooks && textbooks.length > 0 ? textbooks[0] : { title: '교재', subject: '일반', level: '기본' };
    
    const questionsText = questions.map((q: any, index: number) => 
      `문제 ${q.questionNumber}: ${q.questionText}
선택지: ${q.options.join(', ')}
정답: ${q.correctAnswer}
해설: ${q.explanation}`
    ).join('\n\n');

    return `당신은 ${textbook.subject} 전문 AI 학습 도우미입니다.

# 학습 자료 정보
- 교재: ${textbook.title} (${textbook.subject} - ${textbook.level})
- 지문 제목: ${set.title}

# 지문 내용
${set.passage}

# 지문 해설
${set.passageComment}

# 관련 문제
${questionsText}

# 역할과 지침
1. 학생의 질문에 교육적이고 이해하기 쉽게 답변해주세요
2. 지문의 내용과 관련된 질문에 중점을 두어 답변하세요
3. 문제 풀이를 요청하면 단계적으로 설명해주세요
4. 어려운 개념은 구체적인 예시를 들어 설명해주세요
5. 학생의 수준(${textbook.level})에 맞는 언어로 설명해주세요
6. 답변은 500자 이내로 간결하게 작성해주세요
7. 친근하고 격려하는 톤으로 대화해주세요

학생이 질문하면 위 자료를 바탕으로 정확하고 도움이 되는 답변을 제공해주세요.`;
  }

  // 더미 응답 생성 (OpenAI API가 없을 때)
  private static generateDummyResponse(userMessage: string, passageData: any): string {
    const { set } = passageData;
    
    // 키워드 기반 더미 응답
    const message = userMessage.toLowerCase();
    
    if (message.includes('주제') || message.includes('주제의식')) {
      return `"${set.title}"의 주제는 인간 삶의 고난과 희망에 관한 이야기입니다. 작가는 이 지문을 통해 어려운 현실 속에서도 굴복하지 않는 인간의 의지를 보여주고 있어요. 더 구체적인 부분이 궁금하시면 언제든 질문해주세요! (현재는 데모 모드입니다)`;
    }
    
    if (message.includes('문제') || message.includes('정답') || message.includes('풀이')) {
      return `문제를 차근차근 풀어보겠습니다! 먼저 지문을 꼼꼼히 읽어보시고, 각 선택지가 지문의 내용과 어떻게 연결되는지 생각해보세요. 핵심은 작품의 상황과 등장인물의 심리를 정확히 파악하는 것입니다. 어떤 문제가 궁금하신가요? (현재는 데모 모드입니다)`;
    }
    
    if (message.includes('단어') || message.includes('어휘') || message.includes('뜻')) {
      return `지문에 나오는 어려운 단어들을 설명해드릴게요! 고전 작품이나 문학 작품에는 평소에 잘 사용하지 않는 어휘들이 나오는 경우가 많아요. 어떤 단어의 뜻이 궁금하신지 구체적으로 말씀해주시면 자세히 설명해드릴게요. (현재는 데모 모드입니다)`;
    }
    
    if (message.includes('배경') || message.includes('시대')) {
      return `이 작품의 시대적 배경과 상황을 설명해드릴게요. 작품이 쓰여진 시대의 사회상과 문화적 맥락을 이해하면 지문을 더 깊이 있게 이해할 수 있어요. 특히 등장인물들의 행동과 심리를 파악하는 데 도움이 됩니다. (현재는 데모 모드입니다)`;
    }
    
    // 기본 응답
    return `안녕하세요! "${set.title}"에 대한 질문이군요. 

지문을 바탕으로 도움을 드릴게요. 다음과 같은 질문들을 해보시면 좋을 것 같아요:

📚 "이 지문의 주제가 무엇인가요?"
📝 "문제를 단계별로 풀어주세요"
🔤 "어려운 단어의 뜻을 알려주세요"
🎭 "등장인물의 심리가 어떤가요?"

궁금한 것이 있으면 언제든 물어보세요! 

(현재는 데모 모드로, OpenAI API 연동 시 더 정확한 답변이 제공됩니다)`;
  }

  // 해설 생성을 위한 전용 메서드
  static async generateCommentaryWithPrompt(systemPrompt: string): Promise<string> {
    const client = this.getClient();
    
    // OpenAI API가 설정되지 않은 경우 더미 응답
    if (!client) {
      return this.generateDummyCommentary();
    }

    try {
      // OpenAI API 호출
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        max_tokens: 2000, // 해설이므로 더 긴 응답 허용 (약 1500-1800자)
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const commentary = response.choices[0]?.message?.content;
      if (!commentary) {
        throw new Error('AI 해설을 받을 수 없습니다.');
      }

      return commentary;
    } catch (error) {
      console.error('OpenAI API error for commentary:', error);
      
      // API 오류 시 더미 응답으로 폴백
      return this.generateDummyCommentary();
    }
  }

  // 더미 해설 생성 (OpenAI API가 없을 때)
  private static generateDummyCommentary(): string {
    return `이 지문은 교육적 가치가 높은 내용을 담고 있습니다.

## 주요 내용 분석

### 전체 주제
이 지문의 핵심 주제는 인간의 삶과 가치에 대한 깊이 있는 탐구입니다. 작가는 일상적인 소재를 통해 보편적인 인간의 경험을 형상화하고 있습니다.

### 구성과 전개
- **도입부**: 상황 설정과 인물 소개
- **전개부**: 갈등의 구체화와 심화
- **절정부**: 갈등의 최고조 달성
- **결말부**: 갈등 해결과 주제 의식 구현

### 표현 기법
- **서술 시점**: 효과적인 시점 활용으로 독자의 몰입도 증대
- **인물 형상화**: 입체적이고 현실적인 인물 창조
- **배경 설정**: 주제 의식을 뒷받침하는 적절한 배경

### 문학적 의의
이 작품은 현대 사회의 문제를 예리하게 포착하여 독자들에게 깊은 성찰의 기회를 제공합니다.

**※ 현재는 데모 모드입니다. OpenAI API 연동 시 더 정확하고 상세한 해설이 제공됩니다.**`;
  }

  // 통일된 문제 해설 생성 메서드
  static async generateQuestionExplanation(params: {
    passageContent: string;
    passageComment?: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
    existingExplanation?: string;
    subject?: string;
    level?: string;
  }): Promise<string> {
    const client = this.getClient();
    
    // OpenAI API가 설정되지 않은 경우 더미 응답
    if (!client) {
      return this.generateDummyQuestionExplanation(params);
    }

    try {
      // 시스템 프롬프트 가져오기
      const promptDoc = await SystemPrompt.findOne({ 
        key: 'question_explanation', 
        isActive: true 
      });

      let systemPrompt = promptDoc?.content;
      
      // 프롬프트가 없으면 기본 프롬프트 사용
      if (!systemPrompt) {
        systemPrompt = this.getDefaultQuestionExplanationPrompt();
      }

      // 프롬프트 변수 치환
      const finalPrompt = this.substitutePromptVariables(systemPrompt, params);

      // OpenAI API 호출
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: finalPrompt }
        ],
        max_tokens: 2000, // 해설이므로 더 긴 응답 허용
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const explanation = response.choices[0]?.message?.content;
      if (!explanation) {
        throw new Error('AI 해설을 받을 수 없습니다.');
      }

      return explanation;
    } catch (error) {
      console.error('OpenAI API error for question explanation:', error);
      
      // API 오류 시 더미 응답으로 폴백
      return this.generateDummyQuestionExplanation(params);
    }
  }

  // 프롬프트 변수 치환 메서드
  private static substitutePromptVariables(
    systemPrompt: string,
    params: {
      passageContent: string;
      passageComment?: string;
      questionText: string;
      options: string[];
      correctAnswer: string;
      existingExplanation?: string;
      subject?: string;
      level?: string;
    }
  ): string {
    const {
      passageContent,
      passageComment = '',
      questionText,
      options,
      correctAnswer,
      existingExplanation,
      subject = '국어',
      level = '고등학교'
    } = params;

    // 선택지 텍스트 생성 (기존 개별 생성 로직과 동일)
    const optionsText = Array.isArray(options) ? options.join(', ') : String(options);
    
    // 변수 치환
    let finalPrompt = systemPrompt
      .replace(/{passage_content}/g, passageContent)
      .replace(/{passage_comment}/g, passageComment)
      .replace(/{question_text}/g, questionText)
      .replace(/{options}/g, optionsText)
      .replace(/{correct_answer}/g, correctAnswer)
      .replace(/{subject}/g, subject)
      .replace(/{level}/g, level);

    // 기존 해설이 있다면 참고하도록 프롬프트에 추가
    if (existingExplanation && existingExplanation.trim()) {
      finalPrompt += `

# 기존 해설 (참고용)
다음은 기존에 작성된 해설입니다. 이를 참고하여 더 나은 해설을 작성해주세요:

${existingExplanation}

위 기존 해설을 참고하되, 부족한 부분을 보완하고 더 체계적이고 이해하기 쉽게 개선해주세요.`;
    }

    return finalPrompt;
  }

  // 기본 문제 해설 프롬프트 (fallback용)
  private static getDefaultQuestionExplanationPrompt(): string {
    return `주어진 문제에 대한 상세한 해설을 **마크다운 형식**으로 작성해주세요.

# 문제 정보
- **지문**: {passage_content}
- **지문 해설**: {passage_comment}
- **문제**: {question_text}
- **선택지**: {options}
- **정답**: {correct_answer}

# 해설 작성 지침
다음과 같은 마크다운 구조로 해설을 작성해주세요:

## 🎯 정답 및 핵심 이유
**정답: {correct_answer}**

정답의 핵심 근거를 명확히 제시해주세요.

## 📊 선택지 분석
각 선택지를 순서대로 분석하고 정답/오답 여부와 이유를 설명해주세요.

## 📖 지문 근거
> 지문에서 정답을 뒷받침하는 **구체적인 부분**을 인용하고 설명

## 🔍 문제 해결 과정
1. **1단계**: 문제에서 묻는 것 파악
2. **2단계**: 지문에서 관련 정보 찾기  
3. **3단계**: 선택지와 비교 분석
4. **4단계**: 정답 도출

## 💡 학습 팁
- **유사 문제 접근법**: 이런 유형의 문제를 풀 때 주의할 점
- **실수 주의**: 학습자가 자주 틀리는 함정
- **핵심 포인트**: 반드시 기억해야 할 요점

해설은 논리적이고 체계적으로 작성하여 학습자의 이해를 돕고, 유사한 문제에 응용할 수 있는 능력을 기를 수 있도록 해주세요.`;
  }

  // 더미 문제 해설 생성 (OpenAI API가 없을 때)
  private static generateDummyQuestionExplanation(params: {
    passageContent: string;
    passageComment?: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
    existingExplanation?: string;
    subject?: string;
    level?: string;
  }): string {
    const { questionText, options, correctAnswer } = params;
    
    return `## 🎯 정답 및 핵심 이유
**정답: ${correctAnswer}**

이 문제는 지문의 핵심 내용을 정확히 이해했는지 묻는 문제입니다.

## 📊 선택지 분석
${options.map((option, index) => {
  const isCorrect = option === correctAnswer;
  return `### ${index + 1}. ${option}
- **판단**: ${isCorrect ? '✅ 정답' : '❌ 오답'}
- **이유**: ${isCorrect ? '지문의 내용과 일치합니다.' : '지문의 내용과 일치하지 않습니다.'}`;
}).join('\n\n')}

## 📖 지문 근거
지문을 꼼꼼히 읽어보면 정답을 뒷받침하는 근거를 찾을 수 있습니다.

## 🔍 문제 해결 과정
1. **1단계**: 문제에서 묻는 것 파악
2. **2단계**: 지문에서 관련 정보 찾기
3. **3단계**: 선택지와 비교 분석
4. **4단계**: 정답 도출

## 💡 학습 팁
- 지문을 정확히 이해하는 것이 중요합니다
- 각 선택지를 지문과 비교하며 검토하세요
- 문제 유형별 접근법을 익히세요

**※ 현재는 데모 모드입니다. OpenAI API 연동 시 더 정확하고 상세한 해설이 제공됩니다.**`;
  }

  // 사용 통계 (나중에 구현)
  static async getUsageStats(): Promise<any> {
    // TODO: 사용량 통계 구현
    return {
      totalRequests: 0,
      totalTokens: 0,
      estimatedCost: 0
    };
  }
}