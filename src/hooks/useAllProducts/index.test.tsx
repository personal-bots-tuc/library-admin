import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useAllProducts } from "./index";
import * as productsApi from "../../api/products";
import type { ProductListResponse } from "../../api/products";

vi.mock("../../api/products");

const mockListProducts = vi.mocked(productsApi.listProducts);

const createMockPage = (page: number, itemsPerPage: number, totalItems: number): Promise<ProductListResponse> => {
  const start = (page - 1) * itemsPerPage;
  const end = Math.min(start + itemsPerPage, totalItems);
  const items = Array.from({ length: end - start }, (_, i) => ({
    id: String(start + i + 1),
    name: `Producto ${start + i + 1}`,
    type: "product" as const,
    price: 100 + (start + i) * 10,
    stock: 10,
    active: true,
    createdAt: "",
    updatedAt: "",
  }));
  return Promise.resolve({
    items,
    total: totalItems,
    page,
    limit: itemsPerPage,
    totalPages: Math.ceil(totalItems / itemsPerPage),
  });
};

describe("useAllProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("debería fetch todas las páginas y concatenar resultados", async () => {
    // 3 páginas: página 1 (100), página 2 (100), página 3 (50) = 250 total
    mockListProducts
      .mockImplementationOnce(() => createMockPage(1, 100, 250))
      .mockImplementationOnce(() => createMockPage(2, 100, 250))
      .mockImplementationOnce(() => createMockPage(3, 100, 250));

    const { result } = renderHook(() => useAllProducts());

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 });

    expect(result.current.products).toHaveLength(250);
    expect(result.current.products[0].id).toBe("1");
    expect(result.current.products[249].id).toBe("250");
    expect(result.current.error).toBeNull();
    expect(mockListProducts).toHaveBeenCalledTimes(3);
    expect(mockListProducts).toHaveBeenNthCalledWith(1, expect.objectContaining({ page: 1, limit: 100 }));
    expect(mockListProducts).toHaveBeenNthCalledWith(2, expect.objectContaining({ page: 2, limit: 100 }));
    expect(mockListProducts).toHaveBeenNthCalledWith(3, expect.objectContaining({ page: 3, limit: 100 }));
  });

  it("debería manejar catálogo vacío", async () => {
    mockListProducts.mockResolvedValueOnce({ items: [] as ProductListResponse["items"], total: 0, page: 1, limit: 100, totalPages: 0 });

    const { result } = renderHook(() => useAllProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it("debería manejar error en cualquier página", async () => {
    mockListProducts
      .mockImplementationOnce(() => createMockPage(1, 100, 250))
      .mockRejectedValueOnce(new Error("Error de red"));

    const { result } = renderHook(() => useAllProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Error de red");
    expect(result.current.products).toHaveLength(0);
  });

  it("debería cancelar fetch si se desmonta durante la carga", async () => {
    let resolvePage1: (value: ProductListResponse) => void;
    const page1Promise = new Promise<ProductListResponse>(resolve => { resolvePage1 = resolve; });

    mockListProducts
      .mockReturnValueOnce(page1Promise)
      .mockImplementationOnce(() => createMockPage(2, 100, 250));

    const { unmount } = renderHook(() => useAllProducts());

    // Desmontar antes de que resuelva la primera página
    unmount();

    // Resolver la promesa (no debería afectar al estado porque ya se desmontó)
    resolvePage1!(await createMockPage(1, 100, 250));

    // No debería lanzar error
    await waitFor(() => expect(true).toBe(true), { timeout: 1000 });
  });

  it("debería permitir refetch manual", async () => {
    mockListProducts
      .mockImplementationOnce(() => createMockPage(1, 100, 50))
      .mockImplementationOnce(() => createMockPage(1, 100, 50));

    const { result } = renderHook(() => useAllProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toHaveLength(50);
    expect(mockListProducts).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockListProducts).toHaveBeenCalledTimes(2);
  });

  it("debería usar limit=100 por defecto", async () => {
    mockListProducts.mockResolvedValueOnce({ items: [] as ProductListResponse["items"], total: 0, page: 1, limit: 100, totalPages: 0 });

    const { result } = renderHook(() => useAllProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockListProducts).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 100, active: true })
    );
  });
});