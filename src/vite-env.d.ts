/// <reference types="vite/client" />

interface IProduct {
  id: number;
  name: string;
  sku: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  category_id: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ICategory {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Window {
  api: {
    // Product
    getProducts: () => Promise<{ dataValues: IProduct }[]>;
    addProduct: (
      product: Omit<IProduct, "id" | "createdAt" | "updatedAt">
    ) => Promise<{ dataValues: IProduct }>;
    editProduct: (
      id: number,
      product: Omit<IProduct, "id" | "createdAt" | "updatedAt">
    ) => Promise<number[]>;
    deleteProduct: (id: number) => Promise<number[]>;
    deleteMultipleProducts: (ids: number[]) => Promise<number[]>;
    // Category
    getCategories: () => Promise<{ dataValues: ICategory }[]>;
    addCategory: (
      category: Omit<ICategory, "id" | "createdAt" | "updatedAt">
    ) => Promise<{ dataValues: ICategory }>;
    editCategory: (
      id: number,
      category: Omit<ICategory, "id" | "createdAt" | "updatedAt">
    ) => Promise<number[]>;
    deleteCategory: (id: number) => Promise<number[]>;
    deleteMultipleCategories: (ids: number[]) => Promise<number[]>;
  };
  types: {
    Product: IProduct;
    Category: ICategory;
  };
}
