import { useState, useEffect } from 'react';
import { Card, Table, Select, Space, Row, Col, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { statisticsApi, type WorkshopStatistics, type MaintenanceTrend, type EquipmentStatus } from '../api/statistics';
import { workshopApi, type Workshop } from '../api/workshop';
import { equipmentApi, type Equipment } from '../api/equipment';

const { Option } = Select;

const Statistics = () => {
  const [workshopStats, setWorkshopStats] = useState<WorkshopStatistics[]>([]);
  const [maintenanceTrend, setMaintenanceTrend] = useState<MaintenanceTrend[]>([]);
  const [equipmentStatus, setEquipmentStatus] = useState<EquipmentStatus[]>([]);
  const [workshopList, setWorkshopList] = useState<Workshop[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');

  useEffect(() => {
    loadWorkshopStatistics();
    loadEquipmentStatus();
    loadWorkshopList();
    loadEquipmentList();
  }, []);

  useEffect(() => {
    loadMaintenanceTrend();
  }, [selectedWorkshop, selectedEquipment]);

  const loadWorkshopList = async () => {
    try {
      const response = await workshopApi.getList();
      setWorkshopList(response.data);
    } catch (error) {
      console.error('加载车间列表失败', error);
    }
  };

  const loadEquipmentList = async () => {
    try {
      const response = await equipmentApi.getList();
      setEquipmentList(response.data);
    } catch (error) {
      console.error('加载设备列表失败', error);
    }
  };

  const loadWorkshopStatistics = async () => {
    try {
      const response = await statisticsApi.getWorkshopStatistics();
      setWorkshopStats(response.data);
    } catch (error) {
      console.error('加载车间统计失败', error);
    }
  };

  const loadMaintenanceTrend = async () => {
    try {
      const response = await statisticsApi.getMaintenanceTrend({
        workshop_id: selectedWorkshop || undefined,
        equipment_id: selectedEquipment || undefined,
      });
      setMaintenanceTrend(response.data);
    } catch (error) {
      console.error('加载维修趋势失败', error);
    }
  };

  const loadEquipmentStatus = async () => {
    try {
      const response = await statisticsApi.getEquipmentStatus();
      setEquipmentStatus(response.data);
    } catch (error) {
      console.error('加载设备状态统计失败', error);
    }
  };

  const workshopColumns: ColumnsType<WorkshopStatistics> = [
    {
      title: '车间编号',
      dataIndex: 'workshop_id',
      key: 'workshop_id',
    },
    {
      title: '车间名称',
      dataIndex: 'workshop_name',
      key: 'workshop_name',
    },
    {
      title: '设备总数',
      dataIndex: 'total_equipment',
      key: 'total_equipment',
    },
    {
      title: '在用设备数',
      dataIndex: 'in_use_count',
      key: 'in_use_count',
    },
    {
      title: '维修次数',
      dataIndex: 'total_maintenance_times',
      key: 'total_maintenance_times',
    },
  ];

  return (
    <div className="app-container">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={16}>
          {equipmentStatus.map((status) => (
            <Col span={8} key={status.status}>
              <Card>
                <Statistic
                  title={status.status}
                  value={status.count}
                  valueStyle={{ color: status.status === '在用' ? '#3f8600' : status.status === '维修' ? '#cf1322' : '#999' }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Card title="车间设备统计">
          <Table
            columns={workshopColumns}
            dataSource={workshopStats}
            rowKey="workshop_id"
            pagination={false}
          />
        </Card>

        <Card
          title="维修趋势统计"
          extra={
            <Space>
              <Select
                placeholder="选择车间"
                style={{ width: 150 }}
                allowClear
                value={selectedWorkshop || undefined}
                onChange={(value) => {
                  setSelectedWorkshop(value || '');
                  setSelectedEquipment('');
                }}
              >
                {workshopList.map((ws) => (
                  <Option key={ws.workshop_id} value={ws.workshop_id}>
                    {ws.workshop_name}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="选择设备"
                style={{ width: 200 }}
                allowClear
                value={selectedEquipment || undefined}
                onChange={setSelectedEquipment}
                disabled={!selectedWorkshop}
              >
                {equipmentList
                  .filter((eq) => !selectedWorkshop || eq.workshop_id === selectedWorkshop)
                  .map((eq) => (
                    <Option key={eq.equipment_id} value={eq.equipment_id}>
                      {eq.equipment_id} - {eq.model}
                    </Option>
                  ))}
              </Select>
            </Space>
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={maintenanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="maintenance_count" stroke="#8884d8" name="维修次数" />
              <Line type="monotone" dataKey="total_cost" stroke="#82ca9d" name="总费用" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="维修费用统计">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={maintenanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="maintenance_count" fill="#8884d8" name="维修次数" />
              <Bar dataKey="total_cost" fill="#82ca9d" name="总费用" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Space>
    </div>
  );
};

export default Statistics;

