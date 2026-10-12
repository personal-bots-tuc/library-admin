export interface Settings {
  id?: string;
  libraryName: string;
  currency: string;
  language: string;
  dateFormat: string;
  defaultClient: string;
  maxDiscountPerSeller: number;
  allowSaleWithoutStock: boolean;
  scanSound: boolean;
  labelBusinessName?: string;
}
