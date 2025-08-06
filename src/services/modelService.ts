import axios from "axios";
import { Model } from "../types/Model";

const api = axios.create({
  baseURL: "https://backend-coldtruck.onrender.com/api",
});

export const getModels = async (): Promise<Model[]> => {
  const { data } = await api.get<Model[]>("/models");
  return data;
};

export const getModelsByBrand = async (IDBrand: number): Promise<Model[]> => {
  const { data } = await api.get<Model[]>("/models", {
    params: { IDBrand },
  });
  return data;
};

export const createModel = async (
  payload: { name: string; IDBrand: number }
): Promise<Model> => {
  const { data } = await api.post<Model>("/models", payload);
  return data;
};

export const updateModel = async (
  id: number,
  name: string,
  IDBrand: number
): Promise<Model> => {
  const { data } = await api.put<Model>(`/models/${id}`, {
    name,
    IDBrand,
  });
  return data;
};
