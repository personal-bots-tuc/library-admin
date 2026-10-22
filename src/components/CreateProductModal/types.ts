export type ProductType = "product" | "service";

export interface CreateProductForm {
  name: string;
  type: ProductType;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  code?: string;
  categoryId?: string | null;
}

export interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    id: string;
    name: string;
    type: ProductType;
    price: number;
    cost?: number;
    stock: number;
    minStock?: number;
    code?: string;
    categoryId?: string | null;
  };
}
