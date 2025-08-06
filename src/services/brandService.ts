import axios from "axios";
import { Brand } from "../types/Brand";
import { BrandWithModels } from '../types/BrandWithModels'

const api = axios.create({
  baseURL: "https://backend-coldtruck.onrender.com/api",
});

export const getBrands = async (): Promise<Brand[]> => {
  const { data } = await api.get<Brand[]>("/brands");
  return data;
};

export const createBrand = async (name: string): Promise<Brand> => {
  const { data } = await api.post<Brand>("/brands", { name });
  return data;
};

export const updateBrand = async (id: number, name: string): Promise<Brand> => {
  const { data } = await api.put<Brand>(`/brands/${id}`, { name });
  return data;
};

export const getBrandsWithModels = async (): Promise<BrandWithModels[]> => {
  const { data } = await api.get<BrandWithModels[]>("/brands/models")
  return data
}
