import { Request, Response } from 'express';
import { SystemPrompt } from '../models';
import { SystemPromptVersion } from '../models/SystemPromptVersion';

export class SystemPromptController {
  // 모든 시스템 프롬프트 조회
  static async getAllPrompts(req: Request, res: Response) {
    try {
      const prompts = await SystemPrompt.find()
        .sort({ key: 1 });

      res.json({
        success: true,
        data: {
          prompts,
          pagination: {
            current: 1,
            total: 1,
            count: prompts.length,
            totalItems: prompts.length
          }
        }
      });
    } catch (error) {
      console.error('Get all prompts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system prompts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 특정 프롬프트 조회
  static async getPromptByKey(req: Request, res: Response) {
    try {
      const { key } = req.params;
      
      const prompt = await SystemPrompt.findOne({ key, isActive: true });
      
      if (!prompt) {
        return res.status(404).json({
          success: false,
          message: 'System prompt not found'
        });
      }

      res.json({
        success: true,
        data: prompt
      });
    } catch (error) {
      console.error('Get prompt by key error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system prompt',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 프롬프트 생성
  static async createPrompt(req: Request, res: Response) {
    try {
      const { key, name, description, content } = req.body;

      // 키 중복 확인
      const existingPrompt = await SystemPrompt.findOne({ key });
      if (existingPrompt) {
        return res.status(400).json({
          success: false,
          message: 'Prompt with this key already exists'
        });
      }

      const prompt = new SystemPrompt({
        key,
        name,
        description,
        content,
        isActive: true,
        version: 1
      });

      await prompt.save();

      res.status(201).json({
        success: true,
        data: prompt,
        message: 'System prompt created successfully'
      });
    } catch (error) {
      console.error('Create prompt error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create system prompt',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 프롬프트 수정 (버전 히스토리 저장)
  static async updatePrompt(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, content, isActive, versionDescription } = req.body;

      const prompt = await SystemPrompt.findById(id);
      if (!prompt) {
        return res.status(404).json({
          success: false,
          message: 'System prompt not found'
        });
      }

      // 현재 버전을 히스토리에 저장
      const currentVersion = new SystemPromptVersion({
        promptKey: prompt.key,
        content: prompt.content,
        version: prompt.version,
        description: versionDescription || `Version ${prompt.version} backup`,
        createdBy: 'admin'
      });
      await currentVersion.save();

      // 프롬프트 업데이트
      prompt.name = name || prompt.name;
      prompt.description = description || prompt.description;
      prompt.content = content || prompt.content;
      prompt.isActive = isActive !== undefined ? isActive : prompt.isActive;
      prompt.version = prompt.version + 1;

      await prompt.save();

      // 오래된 버전 정리 (최근 10개만 유지)
      const allVersions = await SystemPromptVersion.find({ promptKey: prompt.key })
        .sort({ version: -1 });
      
      if (allVersions.length > 10) {
        const versionsToDelete = allVersions.slice(10);
        await SystemPromptVersion.deleteMany({
          _id: { $in: versionsToDelete.map(v => v._id) }
        });
      }

      res.json({
        success: true,
        data: prompt,
        message: `System prompt updated successfully (v${prompt.version})`
      });
    } catch (error) {
      console.error('Update prompt error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update system prompt',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 프롬프트 삭제
  static async deletePrompt(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const prompt = await SystemPrompt.findById(id);
      if (!prompt) {
        return res.status(404).json({
          success: false,
          message: 'System prompt not found'
        });
      }

      await SystemPrompt.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'System prompt deleted successfully'
      });
    } catch (error) {
      console.error('Delete prompt error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete system prompt',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 특정 프롬프트 초기화
  static async initializePrompt(req: Request, res: Response) {
    try {
      const { key } = req.params;
      
      const defaultPrompts: Record<string, any> = {
        'chat_assistant': {
          key: 'chat_assistant',
          name: 'AI 채팅 어시스턴트',
          description: '학생과의 채팅에서 사용되는 메인 시스템 프롬프트',
          content: `당신은 {subject} 전문 AI 학습 도우미입니다.

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

학생이 질문하면 위 자료를 바탕으로 정확하고 도움이 되는 답변을 제공해주세요.`
        },
        'passage_commentary': {
          key: 'passage_commentary',
          name: '지문 해설 생성',
          description: '지문 내용을 바탕으로 자동으로 해설을 생성하는 프롬프트',
          content: `주어진 지문을 분석하여 학습자를 위한 상세한 해설을 작성해주세요.

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

해설은 학습자의 수준({level})에 맞게 작성하되, 깊이 있는 이해를 도울 수 있도록 구체적이고 명확하게 작성해주세요.`
        },
        'question_explanation': {
          key: 'question_explanation',
          name: '문제 해설 생성',
          description: '문제와 선택지를 바탕으로 자동으로 해설을 생성하는 프롬프트',
          content: `주어진 문제에 대한 상세한 해설을 작성해주세요.

# 문제 정보
- 지문: {passage_content}
- 문제: {question_text}
- 선택지: {options}
- 정답: {correct_answer}

# 해설 작성 지침
1. 정답을 명확히 제시하고 그 이유를 설명
2. 각 선택지가 왜 정답이거나 오답인지 분석
3. 지문의 어느 부분을 근거로 하는지 구체적으로 제시
4. 문제 해결을 위한 사고 과정을 단계별로 설명
5. 유사한 문제를 풀 때 적용할 수 있는 방법론 제시
6. 학습자가 실수하기 쉬운 부분에 대한 주의사항

해설은 논리적이고 체계적으로 작성하여 학습자의 이해를 돕고, 유사한 문제에 응용할 수 있는 능력을 기를 수 있도록 해주세요.`
        }
      };

      const promptData = defaultPrompts[key];
      if (!promptData) {
        return res.status(400).json({
          success: false,
          message: 'Invalid prompt key'
        });
      }

      // 기존 프롬프트 확인 및 초기화
      const existingPrompt = await SystemPrompt.findOne({ key });
      
      let prompt;
      if (existingPrompt) {
        // 기존 프롬프트를 기본값으로 초기화
        existingPrompt.name = promptData.name;
        existingPrompt.description = promptData.description;
        existingPrompt.content = promptData.content;
        existingPrompt.isActive = true;
        existingPrompt.version = existingPrompt.version + 1;
        await existingPrompt.save();
        prompt = existingPrompt;
      } else {
        // 새 프롬프트 생성
        prompt = new SystemPrompt(promptData);
        await prompt.save();
      }

      res.json({
        success: true,
        data: prompt,
        message: existingPrompt 
          ? `${prompt.name} 프롬프트가 기본값으로 초기화되었습니다 (v${prompt.version})`
          : `${prompt.name} 프롬프트가 생성되었습니다`
      });
    } catch (error) {
      console.error('Initialize prompt error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initialize prompt',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 프롬프트 버전 히스토리 조회
  static async getPromptVersions(req: Request, res: Response) {
    try {
      const { key } = req.params;
      
      // 현재 활성 프롬프트 확인
      const currentPrompt = await SystemPrompt.findOne({ key });
      if (!currentPrompt) {
        return res.status(404).json({
          success: false,
          message: 'System prompt not found'
        });
      }

      // 최근 10개 버전 조회
      const versions = await SystemPromptVersion.find({ promptKey: key })
        .sort({ version: -1 })
        .limit(10);

      res.json({
        success: true,
        data: {
          current: {
            version: currentPrompt.version,
            content: currentPrompt.content,
            createdAt: currentPrompt.updatedAt,
            description: 'Current version',
            isCurrent: true
          },
          versions: versions.map(v => ({
            version: v.version,
            content: v.content,
            createdAt: v.createdAt,
            description: v.description,
            createdBy: v.createdBy,
            isCurrent: false
          }))
        }
      });
    } catch (error) {
      console.error('Get prompt versions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch prompt versions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 특정 버전으로 되돌리기
  static async revertToVersion(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const { version } = req.body;
      
      // 현재 프롬프트 확인
      const currentPrompt = await SystemPrompt.findOne({ key });
      if (!currentPrompt) {
        return res.status(404).json({
          success: false,
          message: 'System prompt not found'
        });
      }

      // 되돌릴 버전 찾기
      const targetVersion = await SystemPromptVersion.findOne({ 
        promptKey: key, 
        version: version 
      });
      if (!targetVersion) {
        return res.status(404).json({
          success: false,
          message: 'Target version not found'
        });
      }

      // 현재 버전을 히스토리에 저장
      const currentBackup = new SystemPromptVersion({
        promptKey: currentPrompt.key,
        content: currentPrompt.content,
        version: currentPrompt.version,
        description: `Backup before reverting to v${version}`,
        createdBy: 'admin'
      });
      await currentBackup.save();

      // 프롬프트를 선택한 버전으로 업데이트
      currentPrompt.content = targetVersion.content;
      currentPrompt.version = currentPrompt.version + 1;
      await currentPrompt.save();

      res.json({
        success: true,
        data: currentPrompt,
        message: `Reverted to version ${version} (now v${currentPrompt.version})`
      });
    } catch (error) {
      console.error('Revert to version error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to revert to version',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 모든 기본 프롬프트 초기화 (기존 유지)
  static async initializeDefaultPrompts(req: Request, res: Response) {
    try {
      const defaultKeys = ['chat_assistant', 'passage_commentary', 'question_explanation'];
      const results = [];
      const errors = [];

      for (const key of defaultKeys) {
        const existingPrompt = await SystemPrompt.findOne({ key });
        if (!existingPrompt) {
          try {
            const defaultPrompts: Record<string, any> = {
              'chat_assistant': {
                key: 'chat_assistant',
                name: 'AI 채팅 어시스턴트',
                description: '학생과의 채팅에서 사용되는 메인 시스템 프롬프트',
                content: `당신은 {subject} 전문 AI 학습 도우미입니다.

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

학생이 질문하면 위 자료를 바탕으로 정확하고 도움이 되는 답변을 제공해주세요.`
              },
              'passage_commentary': {
                key: 'passage_commentary',
                name: '지문 해설 생성',
                description: '지문 내용을 바탕으로 자동으로 해설을 생성하는 프롬프트',
                content: `주어진 지문을 분석하여 학습자를 위한 상세한 해설을 작성해주세요.

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

해설은 학습자의 수준({level})에 맞게 작성하되, 깊이 있는 이해를 도울 수 있도록 구체적이고 명확하게 작성해주세요.`
              },
              'question_explanation': {
                key: 'question_explanation',
                name: '문제 해설 생성',
                description: '문제와 선택지를 바탕으로 자동으로 해설을 생성하는 프롬프트',
                content: `주어진 문제에 대한 상세한 해설을 작성해주세요.

# 문제 정보
- 지문: {passage_content}
- 문제: {question_text}
- 선택지: {options}
- 정답: {correct_answer}

# 해설 작성 지침
1. 정답을 명확히 제시하고 그 이유를 설명
2. 각 선택지가 왜 정답이거나 오답인지 분석
3. 지문의 어느 부분을 근거로 하는지 구체적으로 제시
4. 문제 해결을 위한 사고 과정을 단계별로 설명
5. 유사한 문제를 풀 때 적용할 수 있는 방법론 제시
6. 학습자가 실수하기 쉬운 부분에 대한 주의사항

해설은 논리적이고 체계적으로 작성하여 학습자의 이해를 돕고, 유사한 문제에 응용할 수 있는 능력을 기를 수 있도록 해주세요.`
              }
            };

            const promptData = defaultPrompts[key];
            if (promptData) {
              const prompt = new SystemPrompt(promptData);
              await prompt.save();
              results.push(prompt);
            }
          } catch (error) {
            errors.push(`Failed to initialize ${key}: ${error}`);
          }
        }
      }

      res.json({
        success: true,
        data: results,
        message: `${results.length} default prompts initialized`,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error('Initialize default prompts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initialize default prompts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}