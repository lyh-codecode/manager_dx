import apiClient from './client';

export interface WorkshopStatistics {
  workshop_id: string;
  workshop_name: string;
  total_equipment: number;
  in_use_count: number;
  total_maintenance_times: number;
}

export interface MaintenanceTrend {
  month: string;
  maintenance_count: number;
  total_cost: number;
}

export interface EquipmentStatus {
  status: string;
  count: number;
}

export const statisticsApi = {
  // 车间设备统计
  getWorkshopStatistics: () =>
    apiClient.get<{ success: boolean; data: WorkshopStatistics[] }>('/statistics/workshop'),

  // 维修趋势统计
  getMaintenanceTrend: (params?: {
    equipment_id?: string;
    workshop_id?: string;
    start_month?: string;
    end_month?: string;
  }) =>
    apiClient.get<{ success: boolean; data: MaintenanceTrend[] }>('/statistics/maintenance-trend', { params }),

  // 设备状态统计
  getEquipmentStatus: () =>
    apiClient.get<{ success: boolean; data: EquipmentStatus[] }>('/statistics/equipment-status'),
};

