import { config } from 'dotenv';
config();

import '@/ai/flows/generate-tubitak-content.ts';
import '@/ai/flows/optimize-section-content.ts';
import '@/ai/flows/extract-project-info';
