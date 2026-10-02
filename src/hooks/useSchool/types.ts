import type { ReactNode } from "react";

export interface School {
  id: string;
  name: string;
  slug: string;
}

export interface SchoolContextValue {
  school: School | null;
  schoolName: string;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setSchoolFromLogin: (_school: School) => void;
}

export interface SchoolProviderProps {
  children: ReactNode;
  /** Fallback si no hay school cargada */
  fallbackName?: string;
}
