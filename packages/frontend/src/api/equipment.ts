import apiClient from './client';

export interface Equipment {
  equipment_id: string;
  model: string;
  factory_date: string;
  purchase_price: number;
  workshop_id: string;
  workshop_name?: string;
  responsible_person: string;
  status: '在用' | '维修' | '报废';
}

export interface EquipmentQuery {
  equipment_id?: string;
  model?: string;
  workshop_id?: string;
  status?: string;
  keyword?: string;
}

export const equipmentApi = {
  // 获取设备列表
  getList: (params?: EquipmentQuery) =>
    apiClient.get<{ success: boolean; data: Equipment[] }>('/equipment', { params }),

  // 获取设备详情
  getDetail: (id: string) =>
    apiClient.get<{ success: boolean; data: Equipment }>(`/equipment/${id}`),

  // 新增设备
  create: (data: Omit<Equipment, 'workshop_name'>) =>
    apiClient.post<{ success: boolean; data: any }>('/equipment', data),

  // 更新设备
  update: (id: string, data: Partial<Equipment>) =>
    apiClient.put<{ success: boolean; message: string }>(`/equipment/${id}`, data),

  // 删除设备
  delete: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/equipment/${id}`),
};

