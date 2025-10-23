'use server';

import {
  generateTubitakContent,
  GenerateTubitakContentInput,
} from '@/ai/flows/generate-tubitak-content';
import {
  optimizeSectionContent,
  OptimizeSectionContentInput,
} from '@/ai/flows/optimize-section-content';

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
