import { Truck } from "../types/Truck";
import apiLocalHost from "./apiLocalHost";

export interface TruckInput {
    plates: string;
    loadCapacity: number;
    status?: "Available" | "Under Maintenance" | "Inactive" | "On Trip"
    IDAdmin: number;
    IDBrand: number;
    IDModel: number;
}

export const createTruck = async (payload: TruckInput): Promise<Truck> => {
    const { data } = await apiLocalHost.post<Truck>("/trucks", {
        ...payload,
        status: "Available",
    });
    return data;
};

export const getTrucks = async (): Promise<Truck[]> => {
    const { data } = await apiLocalHost.get<Truck[]>("/trucks");
    return data;
};

export const updateTruck = async (
    id: number,
    payload: Partial<TruckInput>
): Promise<Truck> => {
    const { data } = await apiLocalHost.put<Truck>(`/trucks/${id}`, payload);
    return data;
};

export const getTrucksAvailable = async (): Promise<Truck[]> => {
    const { data } = await apiLocalHost.get<Truck[]>("/trucks/Available");
    return data;
};

export const getAvailableTruckCount = async (): Promise<{ availableTrucks: number }> => {
    const { data } = await apiLocalHost.get('/trucks/count/trucks/available');
    return data;
}