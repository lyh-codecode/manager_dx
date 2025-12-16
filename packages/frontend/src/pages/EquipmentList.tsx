import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Form,
  message,
  Tag,
  Popconfirm,
  InputNumber,
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { equipmentApi, type Equipment, type EquipmentQuery } from '../api/equipment';
import { workshopApi, type Workshop } from '../api/workshop';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const EquipmentList = () => {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [workshopList, setWorkshopList] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  useEffect(() => {
    loadEquipmentList();
    loadWorkshopList();
  }, []);

  const loadWorkshopList = async () => {
    try {
      const response = await workshopApi.getList();
      setWorkshopList(response.data);
    } catch (error: any) {
      message.error('加载车间列表失败: ' + error.message);
    }
  };

  const loadEquipmentList = async (params?: EquipmentQuery) => {
    setLoading(true);
    try {
      const response = await equipmentApi.getList(params);
      setEquipmentList(response.data);
    } catch (error: any) {
      message.error('加载设备列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (values: any) => {
    loadEquipmentList(values);
  };

  const handleAdd = () => {
    setEditingEquipment(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Equipment) => {
    setEditingEquipment(record);
    // 处理日期格式：从 ISO 格式转换为 YYYY-MM-DD
    const factoryDate = record.factory_date 
      ? record.factory_date.split('T')[0] 
      : undefined;
    
    form.setFieldsValue({
      ...record,
      factory_date: factoryDate,
      // 确保 purchase_price 是数字类型
      purchase_price: typeof record.purchase_price === 'string' 
        ? parseFloat(record.purchase_price) 
        : record.purchase_price,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await equipmentApi.delete(id);
      message.success('删除成功');
      loadEquipmentList();
    } catch (error: any) {
      message.error('删除失败: ' + error.message);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // 处理数据：确保类型正确
      const data: any = {
        ...values,
        // factory_date 已经是字符串格式（Input type="date" 返回的就是 YYYY-MM-DD）
        factory_date: values.factory_date || undefined,
        // 确保 purchase_price 是数字
        purchase_price: typeof values.purchase_price === 'string' 
          ? parseFloat(values.purchase_price) 
          : values.purchase_price,
      };
      
      // 移除空字符串，转换为 undefined
      Object.keys(data).forEach(key => {
        if (data[key] === '' || data[key] === null) {
          data[key] = undefined;
        }
      });
      
      if (editingEquipment) {
        await equipmentApi.update(editingEquipment.equipment_id, data);
        message.success('更新成功');
      } else {
        await equipmentApi.create(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      loadEquipmentList();
    } catch (error: any) {
      message.error(editingEquipment ? '更新失败: ' + error.message : '创建失败: ' + error.message);
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

  const columns: ColumnsType<Equipment> = [
    {
      title: '设备编号',
      dataIndex: 'equipment_id',
      key: 'equipment_id',
      width: 120,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 150,
    },
    {
      title: '出厂日期',
      dataIndex: 'factory_date',
      key: 'factory_date',
      width: 120,
    },
    {
      title: '采购价格',
      dataIndex: 'purchase_price',
      key: 'purchase_price',
      width: 120,
      render: (price: number) => `¥${price.toLocaleString()}`,
    },
    {
      title: '所属车间',
      dataIndex: 'workshop_name',
      key: 'workshop_name',
      width: 120,
    },
    {
      title: '负责人',
      dataIndex: 'responsible_person',
      key: 'responsible_person',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: getStatusTag,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/equipment/${record.equipment_id}`)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个设备吗？"
            onConfirm={() => handleDelete(record.equipment_id)}
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
          <Form.Item name="keyword">
            <Input
              placeholder="搜索设备编号、型号或车间"
              style={{ width: 250 }}
              allowClear
            />
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
          <Form.Item name="status">
            <Select placeholder="选择状态" style={{ width: 120 }} allowClear>
              <Option value="在用">在用</Option>
              <Option value="维修">维修</Option>
              <Option value="报废">报废</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              搜索
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={() => { searchForm.resetFields(); loadEquipmentList(); }}>
              重置
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增设备
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={equipmentList}
          loading={loading}
          rowKey="equipment_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Space>

      <Modal
        title={editingEquipment ? '编辑设备' : '新增设备'}
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
            name="equipment_id"
            label="设备编号"
            rules={[{ required: true, message: '请输入设备编号' }]}
          >
            <Input disabled={!!editingEquipment} placeholder="请输入设备编号" />
          </Form.Item>
          <Form.Item
            name="model"
            label="型号"
            rules={[{ required: true, message: '请输入型号' }]}
          >
            <Input placeholder="请输入型号" />
          </Form.Item>
          <Form.Item
            name="factory_date"
            label="出厂日期"
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="purchase_price"
            label="采购价格"
            rules={[
              { required: true, message: '请输入采购价格' },
              { type: 'number', min: 0, message: '价格必须大于等于0' },
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入采购价格" />
          </Form.Item>
          <Form.Item
            name="workshop_id"
            label="所属车间"
            rules={[{ required: true, message: '请选择车间' }]}
          >
            <Select placeholder="请选择车间">
              {workshopList.map((ws) => (
                <Option key={ws.workshop_id} value={ws.workshop_id}>
                  {ws.workshop_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="responsible_person"
            label="负责人"
            rules={[{ required: true, message: '请输入负责人' }]}
          >
            <Input placeholder="请输入负责人" />
          </Form.Item>
          <Form.Item
            name="status"
            label="设备状态"
            rules={[{ required: true, message: '请选择设备状态' }]}
          >
            <Select placeholder="请选择设备状态">
              <Option value="在用">在用</Option>
              <Option value="维修">维修</Option>
              <Option value="报废">报废</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EquipmentList;

