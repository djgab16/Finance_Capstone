import { useState } from 'react';
import Header from '../../components/layout/Header';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/ui/StatusBadge';
import { GripVertical } from 'lucide-react';
import type { DeliveryOrder } from '../../types';

export default function Tasks() {
  const { deliveryOrders, updateDeliveryOrder, addActivityLog } = useData();
  const navigate = useNavigate();
  
  const pending = deliveryOrders.filter(o => o.status === 'Pending');
  const inTransit = deliveryOrders.filter(o => o.status === 'In Transit');
  const completed = deliveryOrders.filter(o => o.status === 'Delivered' || o.status === 'Completed');

  const [draggedOrder, setDraggedOrder] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedOrder(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: DeliveryOrder['status']) => {
    if (draggedOrder) {
      updateDeliveryOrder(draggedOrder, { status });
      const order = deliveryOrders.find(o => o.id === draggedOrder);
      if (order && order.status !== status) {
        addActivityLog({
          id: Date.now().toString(), timestamp: new Date().toLocaleString(),
          userName: 'System', userRole: 'Admin', userInitials: 'SY', userColor: '#A3AED0',
          action: 'Update', description: `Moved ${order.waybillNo} to ${status}`
        });
      }
      setDraggedOrder(null);
    }
  };

  const Column = ({ title, orders, status }: { title: string, orders: DeliveryOrder[], status: DeliveryOrder['status'] }) => (
    <div className="task-column" onDragOver={handleDragOver} onDrop={() => handleDrop(status)} style={{ flex: 1, background: 'var(--bg-main)', borderRadius: '8px', padding: '16px', minHeight: '400px' }}>
      <h4 style={{ marginBottom: '16px', borderBottom: '1px solid #E9EDF7', paddingBottom: '8px' }}>{title} <span style={{ color: 'var(--text-muted)' }}>({orders.length})</span></h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {orders.map(o => (
          <div key={o.id} draggable onDragStart={() => handleDragStart(o.id)} style={{ background: 'white', padding: '12px', borderRadius: '8px', cursor: 'grab', border: '1px solid #E9EDF7', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onClick={() => navigate(`/delivery-orders/${o.id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>{o.waybillNo}</strong>
              <GripVertical size={14} color="#A3AED0" />
            </div>
            <div style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-main)' }}>{o.recipientAddress.substring(0, 35)}...</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {o.driverInitials && <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: o.driverColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>{o.driverInitials}</div>}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{o.driverName ? o.driverName.split(',')[0] : 'Unassigned'}</span>
              </div>
              <StatusBadge status={o.status} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Header title="Tasks Board" subtitle="Operations" />
      <div className="page-content">
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Drag and drop cards to instantly update delivery status.</p>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <Column title="Pending Dispatch" orders={pending} status="Pending" />
          <Column title="In Transit" orders={inTransit} status="In Transit" />
          <Column title="Delivered / Completed" orders={completed} status="Delivered" />
        </div>
      </div>
    </>
  );
}
