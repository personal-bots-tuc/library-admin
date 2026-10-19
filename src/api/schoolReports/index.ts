import api from '../client';
import type { SchoolReportRow } from './types';

export async function listSchoolReports(): Promise<SchoolReportRow[]> {
  const { data } = await api.get<{ items: SchoolReportRow[]; total: number }>(
    '/contaflow/school/reports'
  );
  return data.items;
}

export function schoolReportPdfUrl(periodId: string): string {
  const base = api.defaults.baseURL ?? '/api';
  return `${base}/contaflow/school/periods/${periodId}/report/pdf`;
}

export type * from './types';
