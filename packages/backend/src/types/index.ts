export interface Equipment {
  equipment_id: string;
  model: string;
  factory_date?: string;
  purchase_price: number;
  workshop_id: string;
  workshop_name?: string;
  responsible_person: string;
  status: '在用' | '维修' | '报废';
}

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

export interface Workshop {
  workshop_id: string;
  workshop_name: string;
}

