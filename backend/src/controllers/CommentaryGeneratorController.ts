import { Request, Response } from 'express';
import { SystemPrompt } from '../models';
import { AIService } from '../services/AIService';

export class CommentaryGeneratorController {
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
        systemPrompt = `주어진 지문을 분석하여 학습자를 위한 상세한 해설을 작성해주세요.

# 지문 정보
- 제목: {passage_title}
- 과목: {subject}
- 수준: {level}

# 지문 내용
{passage_content}

# 해설 작성 지침
1. 전체 주제와 핵심 메시지를 명확히 제시
2. 문단별로 주요 내용과 논리적 흐름 설명
3. 중요한 개념이나 용어에 대한 설명 포함
4. 학습자가 이해하기 쉬운 언어로 작성
5. 문학 작품의 경우 배경, 갈등, 주제의식 등 분석
6. 비문학의 경우 논증 구조, 핵심 개념 등 분석

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
}