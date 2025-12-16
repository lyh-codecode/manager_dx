import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Form,
  Input,
  Select,
  Space,
  Modal,
  DatePicker,
  message,
  Popconfirm,
  InputNumber,
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { maintenanceApi, type Maintenance, type MaintenanceQuery } from '../api/maintenance';
import { equipmentApi, type Equipment } from '../api/equipment';
import { workshopApi, type Workshop } from '../api/workshop';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const MaintenanceList = () => {
  const [maintenanceList, setMaintenanceList] = useState<Maintenance[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [workshopList, setWorkshopList] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  useEffect(() => {
    loadMaintenanceList();
    loadEquipmentList();
    loadWorkshopList();
  }, []);

  const loadEquipmentList = async () => {
    try {
      const response = await equipmentApi.getList();
      setEquipmentList(response.data);
    } catch (error: any) {
      message.error('加载设备列表失败: ' + error.message);
    }
  };

  const loadWorkshopList = async () => {
    try {
      const response = await workshopApi.getList();
      setWorkshopList(response.data);
    } catch (error: any) {
      message.error('加载车间列表失败: ' + error.message);
    }
  };

  const loadMaintenanceList = async (params?: MaintenanceQuery) => {
    setLoading(true);
    try {
      const response = await maintenanceApi.getList(params);
      setMaintenanceList(response.data);
    } catch (error: any) {
      message.error('加载维修记录失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (values: any) => {
    const params: MaintenanceQuery = {
      equipment_id: values.equipment_id,
      workshop_id: values.workshop_id,
      fault_type: values.fault_type,
      maintenance_time_start: values.timeRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
      maintenance_time_end: values.timeRange?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
    };
    loadMaintenanceList(params);
  };

  const handleAdd = () => {
    setEditingMaintenance(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Maintenance) => {
    setEditingMaintenance(record);
    form.setFieldsValue({
      ...record,
      maintenance_time: dayjs(record.maintenance_time),
      // 确保 maintenance_cost 是数字类型
      maintenance_cost: typeof record.maintenance_cost === 'string' 
        ? parseFloat(record.maintenance_cost) 
        : record.maintenance_cost,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await maintenanceApi.delete(id);
      message.success('删除成功');
      loadMaintenanceList();
    } catch (error: any) {
      message.error('删除失败: ' + error.message);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // 处理数据：确保类型正确
      const data: any = {
        ...values,
        // maintenance_time 是 dayjs 对象，需要格式化
        maintenance_time: values.maintenance_time 
          ? values.maintenance_time.format('YYYY-MM-DD HH:mm:ss')
          : undefined,
        // 确保 maintenance_cost 是数字
        maintenance_cost: typeof values.maintenance_cost === 'string' 
          ? parseFloat(values.maintenance_cost) 
          : values.maintenance_cost,
      };
      
      // 移除空字符串，转换为 undefined
      Object.keys(data).forEach(key => {
        if (data[key] === '' || data[key] === null) {
          if (key !== 'fault_type') { // fault_type 可以为空
            data[key] = undefined;
          } else {
            data[key] = null;
          }
        }
      });
      
      if (editingMaintenance) {
        await maintenanceApi.update(editingMaintenance.maintenance_id, data);
        message.success('更新成功');
      } else {
        await maintenanceApi.create(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      loadMaintenanceList();
    } catch (error: any) {
      message.error(editingMaintenance ? '更新失败: ' + error.message : '创建失败: ' + error.message);
    }
  };

  const columns: ColumnsType<Maintenance> = [
    {
      title: '维修单号',
      dataIndex: 'maintenance_id',
      key: 'maintenance_id',
      width: 120,
    },
    {
      title: '设备编号',
      dataIndex: 'equipment_id',
      key: 'equipment_id',
      width: 120,
    },
    {
      title: '设备型号',
      dataIndex: 'model',
      key: 'model',
      width: 150,
    },
    {
      title: '所属车间',
      dataIndex: 'workshop_name',
      key: 'workshop_name',
      width: 120,
    },
    {
      title: '维修时间',
      dataIndex: 'maintenance_time',
      key: 'maintenance_time',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '故障类型',
      dataIndex: 'fault_type',
      key: 'fault_type',
      width: 120,
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
      width: 120,
      render: (cost: number) => `¥${cost.toLocaleString()}`,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条维修记录吗？"
            onConfirm={() => handleDelete(record.maintenance_id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="app-container">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="equipment_id">
            <Select placeholder="选择设备" style={{ width: 200 }} allowClear showSearch>
              {equipmentList.map((eq) => (
                <Option key={eq.equipment_id} value={eq.equipment_id}>
                  {eq.equipment_id} - {eq.model}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="workshop_id">
            <Select placeholder="选择车间" style={{ width: 150 }} allowClear>
              {workshopList.map((ws) => (
                <Option key={ws.workshop_id} value={ws.workshop_id}>
                  {ws.workshop_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="fault_type">
            <Input placeholder="故障类型" style={{ width: 150 }} allowClear />
          </Form.Item>
          <Form.Item name="timeRange">
            <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              搜索
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={() => { searchForm.resetFields(); loadMaintenanceList(); }}>
              重置
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增维修记录
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={maintenanceList}
          loading={loading}
          rowKey="maintenance_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Space>

      <Modal
        title={editingMaintenance ? '编辑维修记录' : '新增维修记录'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="maintenance_id"
            label="维修单号"
            rules={[{ required: true, message: '请输入维修单号' }]}
          >
            <Input disabled={!!editingMaintenance} placeholder="请输入维修单号" />
          </Form.Item>
          <Form.Item
            name="equipment_id"
            label="设备编号"
            rules={[{ required: true, message: '请选择设备' }]}
          >
            <Select placeholder="请选择设备" showSearch>
              {equipmentList.map((eq) => (
                <Option key={eq.equipment_id} value={eq.equipment_id}>
                  {eq.equipment_id} - {eq.model}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="maintenance_time"
            label="维修时间"
            rules={[{ required: true, message: '请选择维修时间' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="fault_type"
            label="故障类型"
          >
            <Input placeholder="请输入故障类型" />
          </Form.Item>
          <Form.Item
            name="fault_description"
            label="故障描述"
            rules={[{ required: true, message: '请输入故障描述' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入故障描述" />
          </Form.Item>
          <Form.Item
            name="maintenance_cost"
            label="维修费用"
            rules={[
              { required: true, message: '请输入维修费用' },
              { type: 'number', min: 0, message: '费用必须大于等于0' },
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入维修费用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MaintenanceList;

