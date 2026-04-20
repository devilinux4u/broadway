import { apiCall } from "./api";

export interface ClassItem {
  title: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  color?: string;
}

export const getClasses = async (): Promise<ClassItem[]> => {
  try {
    const response = await apiCall("/main/classes", { method: "GET" });
    return response?.classes || [];
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    return [];
  }
};
