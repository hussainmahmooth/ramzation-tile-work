import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Sidebar, NavPage } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/common/Toast';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { CustomerListPage } from './components/customers/CustomerListPage';
import { CustomerDetailsPage } from './components/customers/CustomerDetailsPage';
import { ProjectListPage } from './components/projects/ProjectListPage';
import { ProjectDetailsPage } from './components/projects/ProjectDetailsPage';
import { PaymentListPage } from './components/payments/PaymentListPage';
import { BillListPage } from './components/bills/BillListPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { CustomerModal } from './components/customers/CustomerModal';
import { ProjectModal } from './components/projects/ProjectModal';
import { Customer, Project } from './types';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { saveCustomer, saveProject, projects } = useData();

  // Navigation State
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Global Quick Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [prefilledCustomer, setPrefilledCustomer] = useState<Customer | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-300">Loading Ramzation Tile Work...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleNavigate = (page: NavPage) => {
    setCurrentPage(page);
    setSelectedCustomerId(null);
    setSelectedProjectId(null);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setSelectedProjectId(null);
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setSelectedCustomerId(null);
  };

  const handleCreateProjectForCustomer = (customer: Customer) => {
    setPrefilledCustomer(customer);
    setIsProjectModalOpen(true);
  };

  // Find active project or customer for details sub-view
  const activeProject = selectedProjectId ? projects.find((p) => p.id === selectedProjectId) : null;
  const { customers } = useData();
  const activeCustomer = selectedCustomerId ? customers.find((c) => c.id === selectedCustomerId) : null;

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 antialiased font-sans">
      {/* Desktop Sidebar Navigation */}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Top Header */}
        <Header
          currentPage={currentPage}
          onQuickNewProject={() => {
            setPrefilledCustomer(null);
            setIsProjectModalOpen(true);
          }}
        />

        {/* Page Body Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Sub-view: Project Details Workspace */}
          {activeProject ? (
            <ProjectDetailsPage
              project={activeProject}
              onBack={() => setSelectedProjectId(null)}
              onSelectCustomer={(c) => {
                setSelectedProjectId(null);
                setSelectedCustomerId(c.id);
              }}
            />
          ) : activeCustomer ? (
            /* Sub-view: Customer Details */
            <CustomerDetailsPage
              customer={activeCustomer}
              onBack={() => setSelectedCustomerId(null)}
              onSelectProject={handleSelectProject}
              onCreateProjectForCustomer={handleCreateProjectForCustomer}
            />
          ) : (
            /* Main Top-Level Page Views */
            <>
              {currentPage === 'dashboard' && (
                <DashboardPage
                  onNavigate={handleNavigate}
                  onSelectProject={handleSelectProject}
                  onSelectCustomer={handleSelectCustomer}
                  onNewProject={() => {
                    setPrefilledCustomer(null);
                    setIsProjectModalOpen(true);
                  }}
                  onNewCustomer={() => setIsCustomerModalOpen(true)}
                />
              )}

              {currentPage === 'customers' && (
                <CustomerListPage
                  onSelectCustomer={handleSelectCustomer}
                  onCreateProjectForCustomer={handleCreateProjectForCustomer}
                />
              )}

              {currentPage === 'projects' && (
                <ProjectListPage
                  onSelectProject={handleSelectProject}
                  onSelectCustomer={handleSelectCustomer}
                />
              )}

              {currentPage === 'payments' && (
                <PaymentListPage
                  onSelectProject={handleSelectProject}
                  onSelectCustomer={handleSelectCustomer}
                />
              )}

              {currentPage === 'bills' && (
                <BillListPage
                  onSelectProject={handleSelectProject}
                  onSelectCustomer={handleSelectCustomer}
                />
              )}

              {currentPage === 'reports' && <ReportsPage />}

              {currentPage === 'settings' && <SettingsPage />}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation & Speed Dial */}
      <MobileNav
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onNewCustomer={() => setIsCustomerModalOpen(true)}
        onNewProject={() => {
          setPrefilledCustomer(null);
          setIsProjectModalOpen(true);
        }}
      />

      {/* Global Quick Add Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={async (data) => {
          await saveCustomer(data);
          setIsCustomerModalOpen(false);
        }}
      />

      {/* Global Quick Add Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        initialCustomer={prefilledCustomer}
        onClose={() => {
          setIsProjectModalOpen(false);
          setPrefilledCustomer(null);
        }}
        onSave={async (data) => {
          const created = await saveProject(data);
          setIsProjectModalOpen(false);
          setPrefilledCustomer(null);
          return created;
        }}
        onSelectCreatedProject={(p) => {
          setSelectedProjectId(p.id);
        }}
      />

      {/* Reusable Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainAppContent />
      </DataProvider>
    </AuthProvider>
  );
}
