import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Customer,
  Project,
  WorkItem,
  Payment,
  Bill,
  BusinessSettings,
} from '../types';
import * as db from '../services/db';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface DataContextType {
  customers: Customer[];
  projects: Project[];
  workItems: WorkItem[];
  payments: Payment[];
  bills: Bill[];
  settings: BusinessSettings;
  isLoading: boolean;
  toasts: ToastMessage[];
  
  // Refreshers
  refreshData: () => Promise<void>;
  
  // Customer Actions
  saveCustomer: (customer: Partial<Customer> & { name: string; phone: string }) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Project Actions
  saveProject: (project: Partial<Project> & { customer_id: string; project_name: string }) => Promise<Project>;
  completeProject: (id: string) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Work Item Actions
  saveWorkItem: (item: Partial<WorkItem> & { project_id: string; description: string }) => Promise<WorkItem>;
  deleteWorkItem: (id: string) => Promise<boolean>;
  
  // Payment Actions
  savePayment: (payment: Partial<Payment> & { project_id: string; amount: number }) => Promise<Payment>;
  deletePayment: (id: string) => Promise<boolean>;
  
  // Bill Actions
  saveBill: (bill: Partial<Bill> & { project_id: string; bill_number: string }) => Promise<Bill>;
  deleteBill: (id: string) => Promise<boolean>;
  
  // Settings Actions
  saveSettings: (settings: Partial<BusinessSettings>) => Promise<BusinessSettings>;
  
  // Demo Actions
  loadDemoData: () => Promise<void>;
  resetAllData: () => Promise<void>;
  
  // Toast helpers
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(db.DEFAULT_BUSINESS_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    try {
      // Check if local storage is completely empty, initialize with demo seed on first load
      const rawCust = localStorage.getItem('rtw_customers');
      if (!rawCust) {
        await db.seedDemoData();
      }

      const [c, p, w, pay, b, s] = await Promise.all([
        db.fetchCustomers(),
        db.fetchProjects(),
        db.fetchWorkItems(),
        db.fetchPayments(),
        db.fetchBills(),
        db.fetchSettings(),
      ]);

      setCustomers(c);
      setProjects(p);
      setWorkItems(w);
      setPayments(pay);
      setBills(b);
      setSettings(s);
    } catch (err) {
      console.error('Failed to load data:', err);
      showToast('error', 'Failed to load data', 'Please check your connection or database settings.');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Customer handlers
  const saveCustomer = async (custData: Partial<Customer> & { name: string; phone: string }) => {
    const saved = await db.saveCustomer(custData);
    await refreshData();
    showToast('success', custData.id ? 'Customer updated' : 'Customer created', `${saved.name} details saved successfully.`);
    return saved;
  };

  const deleteCustomer = async (id: string) => {
    const res = await db.deleteCustomer(id);
    if (res.success) {
      await refreshData();
      showToast('success', 'Customer deleted', 'Customer record was removed.');
    } else {
      showToast('error', 'Cannot delete customer', res.error);
    }
    return res;
  };

  // Project handlers
  const saveProject = async (prjData: Partial<Project> & { customer_id: string; project_name: string }) => {
    const saved = await db.saveProject(prjData);
    await refreshData();
    showToast('success', prjData.id ? 'Project updated' : 'Project created', `${saved.project_name} is ready.`);
    return saved;
  };

  const completeProject = async (id: string) => {
    const completed = await db.completeProject(id);
    await refreshData();
    if (completed) {
      showToast('success', 'Project Completed!', `${completed.project_name} has been marked as completed.`);
    }
    return completed;
  };

  const deleteProject = async (id: string) => {
    const res = await db.deleteProject(id);
    if (res.success) {
      await refreshData();
      showToast('success', 'Project deleted', 'Project and related records removed.');
    } else {
      showToast('error', 'Delete failed', res.error);
    }
    return res;
  };

  // Work Item handlers
  const saveWorkItem = async (itemData: Partial<WorkItem> & { project_id: string; description: string }) => {
    const saved = await db.saveWorkItem(itemData);
    await refreshData();
    showToast('success', itemData.id ? 'Work item updated' : 'Work item added', `${saved.description} saved.`);
    return saved;
  };

  const deleteWorkItem = async (id: string) => {
    const res = await db.deleteWorkItem(id);
    await refreshData();
    showToast('success', 'Work item removed');
    return res;
  };

  // Payment handlers
  const savePayment = async (payData: Partial<Payment> & { project_id: string; amount: number }) => {
    const saved = await db.savePayment(payData);
    await refreshData();
    showToast('success', payData.id ? 'Payment updated' : 'Payment recorded', `Payment of Rs.${saved.amount.toLocaleString()} received.`);
    return saved;
  };

  const deletePayment = async (id: string) => {
    const res = await db.deletePayment(id);
    await refreshData();
    showToast('success', 'Payment deleted');
    return res;
  };

  // Bill handlers
  const saveBill = async (billData: Partial<Bill> & { project_id: string; bill_number: string }) => {
    const saved = await db.saveBill(billData);
    await refreshData();
    showToast('success', 'Bill Generated', `Bill ${saved.bill_number} is ready for download or printing.`);
    return saved;
  };

  const deleteBill = async (id: string) => {
    const res = await db.deleteBill(id);
    await refreshData();
    showToast('success', 'Bill deleted');
    return res;
  };

  // Settings
  const saveSettings = async (settingsData: Partial<BusinessSettings>) => {
    const saved = await db.saveSettings(settingsData);
    setSettings(saved);
    showToast('success', 'Settings updated', 'Business profile & invoice details saved.');
    return saved;
  };

  // Seed & Reset
  const loadDemoData = async () => {
    setIsLoading(true);
    await db.seedDemoData();
    await refreshData();
    showToast('success', 'Demo data loaded', 'Sample Ahmed Hassan project and test data ready.');
  };

  const resetAllData = async () => {
    setIsLoading(true);
    db.clearAllLocalData();
    await refreshData();
    showToast('info', 'Data reset', 'All records cleared.');
  };

  return (
    <DataContext.Provider
      value={{
        customers,
        projects,
        workItems,
        payments,
        bills,
        settings,
        isLoading,
        toasts,
        refreshData,
        saveCustomer,
        deleteCustomer,
        saveProject,
        completeProject,
        deleteProject,
        saveWorkItem,
        deleteWorkItem,
        savePayment,
        deletePayment,
        saveBill,
        deleteBill,
        saveSettings,
        loadDemoData,
        resetAllData,
        showToast,
        removeToast,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
