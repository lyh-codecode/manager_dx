import apiClient from './client';

export interface Workshop {
  workshop_id: string;
  workshop_name: string;
}

export const workshopApi = {
  // 获取所有车间
  getList: () =>
    apiClient.get<{ success: boolean; data: Workshop[] }>('/workshop'),

  // 新增车间
  create: (data: Workshop) =>
    apiClient.post<{ success: boolean; data: any }>('/workshop', data),
};

