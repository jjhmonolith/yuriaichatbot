import { Request, Response } from 'express';
import { SystemPrompt } from '../models';
import { AIService } from '../services/AIService';

export class CommentaryGeneratorController {
  // 지문 해설 생성
  static async generateCommentary(req: Request, res: Response) {
    try {
      const { title, passage, existingCommentary, subject = '국어', level = '고등학교' } = req.body;

      if (!title || !passage) {
        return res.status(400).json({
          success: false,
          message: '제목과 지문 내용이 필요합니다.'
        });
      }

      // 지문 해설 생성용 시스템 프롬프트 가져오기
      const promptDoc = await SystemPrompt.findOne({ 
        key: 'passage_commentary', 
        isActive: true 
      });

      let systemPrompt = promptDoc?.content;
      
      // 프롬프트가 없으면 기본 프롬프트 사용
      if (!systemPrompt) {
        systemPrompt = `주어진 지문을 분석하여 학습자를 위한 상세한 해설을 **마크다운 형식**으로 작성해주세요.

# 지문 정보
- **제목**: {passage_title}
- **과목**: {subject}
- **수준**: {level}

# 지문 내용
{passage_content}

# 해설 작성 지침
다음과 같은 마크다운 구조로 해설을 작성해주세요:

## 📖 전체 주제 및 핵심 메시지
- 지문의 중심 주제와 핵심 메시지를 **명확히** 제시

## 📝 문단별 분석
### 1단락
- 주요 내용과 역할 설명

### 2단락 (필요시)
- 주요 내용과 논리적 흐름 설명

## 🔍 중요 개념 및 용어
- **중요 개념**: 설명
- **핵심 용어**: 의미와 맥락

## 💡 문학/비문학 특성 분석
- 문학: 배경, 갈등, 주제의식, 표현 기법 등
- 비문학: 논증 구조, 핵심 개념, 전개 방식 등

## ✅ 학습 포인트
- 이 지문에서 반드시 기억해야 할 요점들

해설은 학습자의 수준({level})에 맞게 작성하되, 깊이 있는 이해를 도울 수 있도록 구체적이고 명확하게 작성해주세요.`;
      }

      // 변수 치환
      let finalPrompt = systemPrompt
        .replace(/{passage_title}/g, title)
        .replace(/{subject}/g, subject)
        .replace(/{level}/g, level)
        .replace(/{passage_content}/g, passage);

      // 기존 해설이 있다면 참고하도록 프롬프트에 추가
      if (existingCommentary && existingCommentary.trim()) {
        finalPrompt += `

# 기존 해설 (참고용)
다음은 기존에 작성된 해설입니다. 이를 참고하여 더 나은 해설을 작성해주세요:

${existingCommentary}

위 기존 해설을 참고하되, 부족한 부분을 보완하고 더 체계적이고 이해하기 쉽게 개선해주세요.`;
      }

      // AI를 통해 해설 생성
      const commentary = await AIService.generateCommentaryWithPrompt(finalPrompt);

      res.json({
        success: true,
        data: {
          commentary,
          prompt: finalPrompt // 디버깅용
        },
        message: '해설이 성공적으로 생성되었습니다.'
      });

    } catch (error) {
      console.error('Generate commentary error:', error);
      res.status(500).json({
        success: false,
        message: '해설 생성에 실패했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 문제 해설 생성
  static async generateQuestionExplanation(req: Request, res: Response) {
    try {
      const { 
        passageContent, 
        questionText, 
        options, 
        correctAnswer, 
        existingExplanation,
        subject = '국어', 
        level = '고등학교' 
      } = req.body;

      if (!passageContent || !questionText || !options || !correctAnswer) {
        return res.status(400).json({
          success: false,
          message: '지문 내용, 문제, 선택지, 정답이 모두 필요합니다.'
        });
      }

      // 문제 해설 생성용 시스템 프롬프트 가져오기
      const promptDoc = await SystemPrompt.findOne({ 
        key: 'question_explanation', 
        isActive: true 
      });

      let systemPrompt = promptDoc?.content;
      
      // 프롬프트가 없으면 기본 프롬프트 사용
      if (!systemPrompt) {
        systemPrompt = `주어진 문제에 대한 상세한 해설을 **마크다운 형식**으로 작성해주세요.

# 문제 정보
- **지문**: {passage_content}
- **문제**: {question_text}
- **선택지**: {options}
- **정답**: {correct_answer}

# 해설 작성 지침
다음과 같은 마크다운 구조로 해설을 작성해주세요:

## 🎯 정답 및 핵심 이유
**정답: {correct_answer}**

정답의 핵심 근거를 명확히 제시해주세요.

## 📊 선택지 분석
### ① 선택지 1
- **분석**: 해당 선택지에 대한 분석
- **판단**: ✅ 정답 / ❌ 오답 + 이유

### ② 선택지 2  
- **분석**: 해당 선택지에 대한 분석
- **판단**: ✅ 정답 / ❌ 오답 + 이유

(모든 선택지에 대해 동일하게 분석)

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

      // 변수 치환
      const optionsText = Array.isArray(options) ? options.join(', ') : options;
      
      let finalPrompt = systemPrompt
        .replace(/{passage_content}/g, passageContent)
        .replace(/{question_text}/g, questionText)
        .replace(/{options}/g, optionsText)
        .replace(/{correct_answer}/g, correctAnswer);

      // 기존 해설이 있다면 참고하도록 프롬프트에 추가
      if (existingExplanation && existingExplanation.trim()) {
        finalPrompt += `

# 기존 해설 (참고용)
다음은 기존에 작성된 해설입니다. 이를 참고하여 더 나은 해설을 작성해주세요:

${existingExplanation}

위 기존 해설을 참고하되, 부족한 부분을 보완하고 더 체계적이고 이해하기 쉽게 개선해주세요.`;
      }

      // AI를 통해 해설 생성
      const explanation = await AIService.generateCommentaryWithPrompt(finalPrompt);

      res.json({
        success: true,
        data: {
          explanation,
          prompt: finalPrompt // 디버깅용
        },
        message: '문제 해설이 성공적으로 생성되었습니다.'
      });

    } catch (error) {
      console.error('Generate question explanation error:', error);
      res.status(500).json({
        success: false,
        message: '문제 해설 생성에 실패했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}