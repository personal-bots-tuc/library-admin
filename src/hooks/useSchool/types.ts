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
  setSchoolFromLogin: (school: School) => void;
}

export interface SchoolProviderProps {
  children: React.ReactNode;
  fallbackName?: string;
}
