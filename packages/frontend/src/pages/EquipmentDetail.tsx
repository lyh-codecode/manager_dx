import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Table,
  Tag,
  Spin,
  message,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { equipmentApi, type Equipment } from '../api/equipment';
import { maintenanceApi, type Maintenance } from '../api/maintenance';
import dayjs from 'dayjs';

const EquipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [maintenanceList, setMaintenanceList] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadEquipmentDetail();
      loadMaintenanceHistory();
    }
  }, [id]);

  const loadEquipmentDetail = async () => {
    setLoading(true);
    try {
      const response = await equipmentApi.getDetail(id!);
      setEquipment(response.data);
    } catch (error: any) {
      message.error('加载设备详情失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMaintenanceHistory = async () => {
    try {
      const response = await maintenanceApi.getByEquipment(id!);
      setMaintenanceList(response.data);
    } catch (error: any) {
      message.error('加载维修历史失败: ' + error.message);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      在用: { color: 'green', text: '在用' },
      维修: { color: 'orange', text: '维修' },
      报废: { color: 'red', text: '报废' },
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const maintenanceColumns: ColumnsType<Maintenance> = [
    {
      title: '维修单号',
      dataIndex: 'maintenance_id',
      key: 'maintenance_id',
    },
    {
      title: '维修时间',
      dataIndex: 'maintenance_time',
      key: 'maintenance_time',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '故障类型',
      dataIndex: 'fault_type',
      key: 'fault_type',
    },
    {
      title: '故障描述',
      dataIndex: 'fault_description',
      key: 'fault_description',
      ellipsis: true,
    },
    {
      title: '维修费用',
      dataIndex: 'maintenance_cost',
      key: 'maintenance_cost',
      render: (cost: number) => `¥${cost.toLocaleString()}`,
    },
  ];

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
  }

  if (!equipment) {
    return <div>设备不存在</div>;
  }

  return (
    <div className="app-container">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/equipment')}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      <Card title="设备信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="设备编号">{equipment.equipment_id}</Descriptions.Item>
          <Descriptions.Item label="型号">{equipment.model}</Descriptions.Item>
          <Descriptions.Item label="出厂日期">{equipment.factory_date || '-'}</Descriptions.Item>
          <Descriptions.Item label="采购价格">¥{equipment.purchase_price.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="所属车间">{equipment.workshop_name || equipment.workshop_id}</Descriptions.Item>
          <Descriptions.Item label="负责人">{equipment.responsible_person}</Descriptions.Item>
          <Descriptions.Item label="设备状态">{getStatusTag(equipment.status)}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="维修历史">
        <Table
          columns={maintenanceColumns}
          dataSource={maintenanceList}
          rowKey="maintenance_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条维修记录`,
          }}
        />
      </Card>
    </div>
  );
};

export default EquipmentDetail;

