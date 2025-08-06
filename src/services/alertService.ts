import { Alert } from "../types/Alert";
import { Alert2 } from "../types/Alert2";
import apiLocalHost from "./apiLocalHost";

const BASE_URL = '/alerts';

export const getAlerts = async (): Promise<Alert[]> => {
  const { data } = await apiLocalHost.get<Alert[]>(BASE_URL);
  return data;
};

export const getOrderedAlerts = async (): Promise<{ alerts: Alert2[] }> => {
  const { data } = await apiLocalHost.get('/trips/alerts/ordered');
  return data;
}