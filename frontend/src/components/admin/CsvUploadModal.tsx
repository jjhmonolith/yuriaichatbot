'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (questions: CsvQuestion[]) => Promise<void>;
  setId: string;
}

interface CsvQuestion {
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5?: string;
  explanation: string;
}

interface ParsedQuestion extends CsvQuestion {
  questionNumber: number;
  needsAiExplanation: boolean;
  options: string[];
}

const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  setId
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const questions: ParsedQuestion[] = [];
        const parseErrors: string[] = [];

        results.data.forEach((row: any, index: number) => {
          // CSV 컬럼 매핑 (유연한 컬럼명 지원)
          const questionText = row['문제'] || row['발문'] || row['문제발문'] || row['questionText'] || '';
          const option1 = row['선지1'] || row['1번'] || row['option1'] || '';
          const option2 = row['선지2'] || row['2번'] || row['option2'] || '';
          const option3 = row['선지3'] || row['3번'] || row['option3'] || '';
          const option4 = row['선지4'] || row['4번'] || row['option4'] || '';
          const option5 = row['선지5'] || row['5번'] || row['option5'] || '';
          const explanation = row['해설'] || row['설명'] || row['explanation'] || '';

          // 필수 항목 검증
          if (!questionText.trim()) {
            parseErrors.push(`${index + 2}행: 문제 발문이 비어있습니다.`);
            return;
          }

          if (!option1.trim() || !option2.trim()) {
            parseErrors.push(`${index + 2}행: 최소 2개의 선택지가 필요합니다.`);
            return;
          }

          // 옵션 배열 생성 (빈 값 제외)
          const options = [option1, option2, option3, option4, option5]
            .filter(opt => opt && opt.trim())
            .map(opt => opt.trim());

          if (options.length < 2) {
            parseErrors.push(`${index + 2}행: 최소 2개의 선택지가 필요합니다.`);
            return;
          }

          // 해설이 비어있는지 확인
          const needsAiExplanation = !explanation.trim();

          questions.push({
            questionNumber: index + 1,
            questionText: questionText.trim(),
            option1: option1.trim(),
            option2: option2.trim(),
            option3: option3.trim(),
            option4: option4.trim(),
            option5: option5.trim(),
            explanation: explanation.trim(),
            needsAiExplanation,
            options
          });
        });

        setErrors(parseErrors);
        setParsedQuestions(questions);
        
        if (parseErrors.length === 0 && questions.length > 0) {
          setStep('preview');
        }
      },
      error: (error) => {
        setErrors([`CSV 파싱 오류: ${error.message}`]);
      }
    });
  };

  const handleUpload = async () => {
    if (parsedQuestions.length === 0) return;

    try {
      setIsUploading(true);
      await onUpload(parsedQuestions as CsvQuestion[]);
      onClose();
      resetState();
    } catch (error) {
      console.error('Upload error:', error);
      setErrors([`업로드 실패: ${(error as Error).message}`]);
    } finally {
      setIsUploading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setParsedQuestions([]);
    setErrors([]);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const downloadTemplate = () => {
    const template = `문제,선지1,선지2,선지3,선지4,선지5,해설
"다음 글의 중심 내용은?","첫 번째 선택지","두 번째 선택지","세 번째 선택지","네 번째 선택지","다섯 번째 선택지","이 문제는 글의 중심 내용을 파악하는 문제입니다..."
"빈 칸에 들어갈 말로 가장 적절한 것은?","선택지 1","선택지 2","선택지 3","선택지 4","","AI가 자동으로 해설을 생성합니다"`;
    
    // UTF-8 BOM 추가로 Excel에서 한글 깨짐 방지
    const BOM = '\uFEFF';
    const csvContent = BOM + template;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', '문제_업로드_템플릿.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const aiExplanationCount = parsedQuestions.filter(q => q.needsAiExplanation).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="CSV 파일로 문제 일괄 업로드"
      size="xl"
    >
      <div className="space-y-6">
        {step === 'upload' && (
          <>
            {/* 템플릿 다운로드 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900">CSV 파일 형식</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    발문, 선지1~5, 해설 순서로 작성해주세요. 해설이 비어있으면 AI가 자동 생성합니다.
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="text-sm text-blue-600 hover:text-blue-800 underline mt-2"
                  >
                    템플릿 파일 다운로드
                  </button>
                </div>
              </div>
            </div>

            {/* 파일 업로드 */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-900">
                  {file ? file.name : 'CSV 파일을 선택하세요'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  클릭하거나 파일을 드래그하여 업로드
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* 에러 표시 */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-red-900">오류가 발견되었습니다</h4>
                    <ul className="text-sm text-red-700 mt-1 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {step === 'preview' && (
          <>
            {/* 미리보기 헤더 */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  업로드 미리보기 ({parsedQuestions.length}개 문제)
                </h3>
                {aiExplanationCount > 0 && (
                  <p className="text-sm text-orange-600 mt-1">
                    {aiExplanationCount}개 문제의 해설이 AI로 자동 생성됩니다.
                  </p>
                )}
              </div>
              <button
                onClick={() => setStep('upload')}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                파일 다시 선택
              </button>
            </div>

            {/* 문제 미리보기 */}
            <div className="max-h-96 overflow-y-auto space-y-4">
              {parsedQuestions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">문제 {index + 1}</h4>
                    {question.needsAiExplanation && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        AI 해설 생성
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{question.questionText}</p>
                  <div className="space-y-1 mb-3">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="text-xs text-gray-600">
                        {optIndex + 1}. {option}
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      해설: {question.explanation.substring(0, 100)}
                      {question.explanation.length > 100 ? '...' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* 버튼 */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          {step === 'preview' && (
            <Button 
              onClick={handleUpload} 
              disabled={isUploading || parsedQuestions.length === 0}
            >
              {isUploading ? '업로드 중...' : `${parsedQuestions.length}개 문제 업로드`}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CsvUploadModal;