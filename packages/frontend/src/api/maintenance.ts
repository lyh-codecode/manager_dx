import apiClient from './client';

export interface Maintenance {
  maintenance_id: string;
  equipment_id: string;
  maintenance_time: string;
  fault_description: string;
  fault_type?: string;
  maintenance_cost: number;
  model?: string;
  workshop_id?: string;
  workshop_name?: string;
}

export interface MaintenanceQuery {
  equipment_id?: string;
  maintenance_time_start?: string;
  maintenance_time_end?: string;
  fault_type?: string;
  workshop_id?: string;
}

export const maintenanceApi = {
  // 获取维修记录列表
  getList: (params?: MaintenanceQuery) =>
    apiClient.get<{ success: boolean; data: Maintenance[] }>('/maintenance', { params }),

  // 获取设备的维修历史
  getByEquipment: (equipmentId: string) =>
    apiClient.get<{ success: boolean; data: Maintenance[] }>(`/maintenance/equipment/${equipmentId}`),

  // 新增维修记录
  create: (data: Omit<Maintenance, 'model' | 'workshop_id' | 'workshop_name'>) =>
    apiClient.post<{ success: boolean; data: any }>('/maintenance', data),

  // 更新维修记录
  update: (id: string, data: Partial<Maintenance>) =>
    apiClient.put<{ success: boolean; message: string }>(`/maintenance/${id}`, data),

  // 删除维修记录
  delete: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/maintenance/${id}`),
};

