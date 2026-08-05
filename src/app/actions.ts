
'use server';

import {
  generateTubitakContent,
  GenerateTubitakContentInput,
} from '@/ai/flows/generate-tubitak-content';
import {
  optimizeSectionContent,
  OptimizeSectionContentInput,
} from '@/ai/flows/optimize-section-content';
import {
  extractProjectInfo,
  ExtractProjectInfoInput,
} from '@/ai/flows/extract-project-info';
import {
  generateAiInsights,
  GenerateAiInsightsInput,
} from '@/ai/flows/generate-ai-insights';

import HTMLtoDOCX from 'html-to-docx';

// Curriculum Actions
export async function handleSaveProgram(data: any) {
  // Bu bir prototip eylemidir. UI tarafında Firestore SDK kullanılmaktadır.
  console.log('Program Kaydedildi:', data);
  return { success: true };
}

export async function handleGenerateContent(
  input: GenerateTubitakContentInput
) {
  try {
    const result = await generateTubitakContent(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in handleGenerateContent:', error);
    return { success: false, error: 'İçerik üretilirken bir hata oluştu.' };
  }
}

export async function handleOptimizeContent(
  input: OptimizeSectionContentInput
) {
  try {
    const result = await optimizeSectionContent(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in handleOptimizeContent:', error);
    return { success: false, error: 'İçerik optimize edilirken bir hata oluştu.' };
  }
}

export async function handleGenerateDocx(htmlString: string) {
  try {
    const fileBuffer = await HTMLtoDOCX(htmlString, undefined, {
      margins: {
        top: 720,
        right: 720,
        bottom: 720,
        left: 720,
      },
    });

    return { success: true, data: fileBuffer.toString('base64') };
  } catch (error) {
    console.error('Error in handleGenerateDocx:', error);
    return {
      success: false,
      error: 'Word dosyası oluşturulurken bir hata oluştu.',
    };
  }
}

export async function handleExtractProjectInfo(input: ExtractProjectInfoInput) {
  try {
    const result = await extractProjectInfo(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in handleExtractProjectInfo:', error);
    return {
      success: false,
      error: 'Proje bilgileri ayrıştırılırken bir hata oluştu.',
    };
  }
}

export async function handleGetAiInsights(input: GenerateAiInsightsInput) {
  try {
    const result = await generateAiInsights(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in handleGetAiInsights:', error);
    return { success: false, error: 'Yapay zeka analizleri oluşturulurken bir hata oluştu.' };
  }
}

export async function handleSendSupportRequest(data: any) {
  console.log('Destek Talebi Alındı:', data);
  return { success: true };
}
