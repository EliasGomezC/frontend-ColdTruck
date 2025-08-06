import type { SensorReading } from '../types';
import apiLocalHost from './apiLocalHost';
const BASE_URL = '/sensor_readings';

export const getSensorReadings = async (): Promise<SensorReading[]> => {
    const { data } = await apiLocalHost.get<SensorReading[]>(BASE_URL);
    return data;
};

export const getSensorReadingsByTrip = async (tripId: number): Promise<SensorReading[]> => {
    const { data } = await apiLocalHost.get<SensorReading[]>(`${BASE_URL}/trip/${tripId}`);
    return data;
};

export const createSensorReading = async (payload: Omit<SensorReading, '_id'>): Promise<SensorReading> => {
    const { data } = await apiLocalHost.post<SensorReading>(BASE_URL, payload);
    return data;
};

export interface SensorReadingChartPoint {
    dateTime: string;         // ISO date string
    temperature: number;
    humidity: number;
}

export const getSensorReadingsForStackedChart = async (): Promise<SensorReadingChartPoint[]> => {
    const { data } = await apiLocalHost.get<{ data: SensorReadingChartPoint[] }>(`/sensor_readings/stacked-chart`);
    return data.data;
};