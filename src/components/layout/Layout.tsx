import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Dashboard from '../dashboard/Dashboard';
import InvoiceList from '../invoices/InvoiceList';
import CreateInvoice from '../invoices/CreateInvoice';
import EditInvoice from '../invoices/EditInvoice';
import ClientList from '../clients/ClientList';
import Settings from '../settings/Settings';

const Layout: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/invoices" element={<InvoiceList />} />
              <Route path="/invoices/create" element={<CreateInvoice />} />
              <Route path="/invoices/edit/:id" element={<EditInvoice />} />
              <Route path="/clients" element={<ClientList />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default Layout;