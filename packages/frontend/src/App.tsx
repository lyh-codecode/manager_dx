import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import AppLayout from './components/Layout';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetail from './pages/EquipmentDetail';
import MaintenanceList from './pages/MaintenanceList';
import Statistics from './pages/Statistics';
import './App.css';

const { Content } = Layout;

function App() {
  return (
    <Router>
      <AppLayout>
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          <Routes>
            <Route path="/" element={<EquipmentList />} />
            <Route path="/equipment" element={<EquipmentList />} />
            <Route path="/equipment/:id" element={<EquipmentDetail />} />
            <Route path="/maintenance" element={<MaintenanceList />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </Content>
      </AppLayout>
    </Router>
  );
}

export default App;

