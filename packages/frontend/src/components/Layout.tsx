import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppstoreOutlined,
  ToolOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

const { Header, Sider } = Layout;

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/equipment',
      icon: <AppstoreOutlined />,
      label: '设备管理',
    },
    {
      key: '/maintenance',
      icon: <ToolOutlined />,
      label: '维修记录',
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: '统计分析',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
        工业设备台账管理系统
      </Header>
      <Layout>
        <Sider width={200} theme="light">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          {children}
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;

