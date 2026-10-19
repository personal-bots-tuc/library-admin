import api from '../client';
import type { SchoolReportRow } from './types';

export async function listSchoolReports(): Promise<SchoolReportRow[]> {
  const { data } = await api.get<{ items: SchoolReportRow[]; total: number }>(
    '/contaflow/school/reports'
  );
  return data.items;
}

export function schoolReportPdfUrl(periodId: string): string {
  // Ruta RELATIVA: axios antepone baseURL UNA vez (evita /api/api/...).
  return `/contaflow/school/periods/${periodId}/report/pdf`;
}

export type * from './types';
