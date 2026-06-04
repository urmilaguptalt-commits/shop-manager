import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlusIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';
import axiosClient from '../api/axiosClient';

const COLUMNS = [
  { id: 'received', title: 'Received', color: 'border-yellow-500', bg: 'bg-yellow-500/10' },
  { id: 'vendor', title: 'Sent to Vendor', color: 'border-blue-500', bg: 'bg-blue-500/10' },
  { id: 'repair', title: 'In Repair', color: 'border-purple-500', bg: 'bg-purple-500/10' },
  { id: 'resolved', title: 'Resolved', color: 'border-emerald-500', bg: 'bg-emerald-500/10' },
];

function SortableItem({ item, isOverlay = false }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: item.id,
    data: { item }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const daysOpen = Math.floor((new Date() - new Date(item.created_at)) / (1000 * 60 * 60 * 24)) || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "p-4 mb-3 rounded-xl bg-white dark:bg-slate-800 border cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow relative overflow-hidden",
        isDragging ? "opacity-30 border-dashed border-teal-500" : "border-slate-200 dark:border-slate-700",
        isOverlay ? "shadow-2xl ring-2 ring-teal-500 opacity-100 z-50 cursor-grabbing" : ""
      )}
    >
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", 
        daysOpen > 5 ? "bg-red-500" : daysOpen > 2 ? "bg-yellow-500" : "bg-teal-500"
      )} />
      <div className="flex justify-between items-start mb-2 pl-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.ticket_number}</span>
        <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
          <ClockIcon className="w-3 h-3" />
          <span className={daysOpen > 5 ? "text-red-500" : ""}>{daysOpen}d</span>
        </div>
      </div>
      <h4 className="font-semibold text-slate-800 dark:text-slate-100 pl-2 leading-tight">
        {item.product_unit?.product?.name || "Device Information"}
      </h4>
      <p className="text-xs text-slate-400 mt-0.5 pl-2 font-mono">{item.product_unit?.serial_imei}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 pl-2 line-clamp-2">{item.complaint}</p>
      
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 pl-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
          <div className="w-5 h-5 rounded bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
            {item.customer?.name.charAt(0) || "C"}
          </div>
          {item.customer?.name}
        </div>
      </div>
    </div>
  );
}

export default function WarrantyRMA() {
  const [tickets, setTickets] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ customer_id: '', product_unit_id: '', complaint: '' });
  
  const [customers, setCustomers] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    fetchTickets();
    fetchSupportData();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axiosClient.get('/rma/');
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    }
  };

  const fetchSupportData = async () => {
     try {
        const [cRes, uRes] = await Promise.all([
           axiosClient.get('/customers/'),
           axiosClient.get('/products/units') // Assuming this endpoint exists or will be added
        ]);
        setCustomers(cRes.data);
        setUnits(uRes.data);
     } catch (err) {
        console.error("Failed to fetch support data", err);
     }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeItem = tickets.find(t => t.id === active.id);
    const overId = over.id;

    // If hovering over a column or an item in another column
    const isColumn = COLUMNS.some(col => col.id === overId);
    let targetColumn = isColumn ? overId : tickets.find(t => t.id === overId)?.status;

    if (activeItem && targetColumn && activeItem.status !== targetColumn) {
       setTickets(prev => prev.map(t => t.id === active.id ? { ...t, status: targetColumn } : t));
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeItem = tickets.find(t => t.id === active.id);
    if (activeItem) {
       try {
          await axiosClient.put(`/rma/${activeItem.id}/status?status=${activeItem.status}`);
       } catch (err) {
          console.error("Failed to update status on server", err);
          fetchTickets(); // Revert on failure
       }
    }
  };

  const handleCreateTicket = async (e) => {
     e.preventDefault();
     try {
        await axiosClient.post('/rma/', {
           customer_id: parseInt(formData.customer_id),
           product_unit_id: parseInt(formData.product_unit_id),
           complaint: formData.complaint,
           status: 'received'
        });
        setIsModalOpen(false);
        setFormData({ customer_id: '', product_unit_id: '', complaint: '' });
        fetchTickets();
     } catch (err) {
        console.error("Failed to create ticket", err);
        alert("Failed to create ticket. Ensure customer and unit are selected.");
     }
  };

  const activeItem = activeId ? tickets.find(t => t.id === activeId) : null;

  return (
    <div className="h-full flex flex-col pb-8">
      <div className="flex justify-between items-end mb-6 px-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Warranty & RMA</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage device repairs and vendor warranties.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all hover:scale-105"
        >
          <PlusIcon className="w-5 h-5" />
          Log Ticket
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 px-2">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map(col => {
            const colItems = tickets.filter(i => i.status.toLowerCase() === col.id);
            return (
              <div key={col.id} className="flex-1 min-w-[320px] flex flex-col bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-slate-200 dark:border-slate-800 p-4">
                <div className={cn("border-b-2 pb-3 mb-4 flex justify-between items-center", col.color)}>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">{col.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-teal-600 dark:text-teal-400">
                    {colItems.length}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-1">
                  <SortableContext items={colItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {colItems.map(item => (
                      <SortableItem key={item.id} item={item} />
                    ))}
                    {colItems.length === 0 && (
                       <div className="h-32 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
                          <span className="text-sm text-slate-400 font-medium">No tickets here</span>
                       </div>
                    )}
                  </SortableContext>
                </div>
              </div>
            );
          })}

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}>
            {activeItem ? <SortableItem item={activeItem} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* LOG TICKET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Log Repair Ticket</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XMarkIcon className="w-6 h-6"/></button>
              </div>
              <form onSubmit={handleCreateTicket} className="p-6 space-y-5">
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Customer</label>
                    <select 
                       required
                       className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/50"
                       value={formData.customer_id}
                       onChange={e => setFormData({...formData, customer_id: e.target.value})}
                    >
                       <option value="">Select Customer</option>
                       {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Serial Number / IMEI</label>
                    <select 
                       required
                       className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/50"
                       value={formData.product_unit_id}
                       onChange={e => setFormData({...formData, product_unit_id: e.target.value})}
                    >
                       <option value="">Select Unit</option>
                       {units.map(u => <option key={u.id} value={u.id}>{u.product?.name} - {u.serial_imei}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Complaint / Issue</label>
                    <textarea 
                       required
                       rows="3"
                       className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/50"
                       placeholder="Describe the problem..."
                       value={formData.complaint}
                       onChange={e => setFormData({...formData, complaint: e.target.value})}
                    />
                 </div>
                 <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all">Create Ticket</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

