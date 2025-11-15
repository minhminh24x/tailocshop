// File: frontend/src/pages/supplier/SupplierLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import SupplierSidebar from './SupplierSidebar'; //
import AdminHeader from '../admin/AdminHeader';
import AdminFooter from '../admin/AdminFooter';

const SupplierLayout = () => {
  return (
    <div className="flex h-screen bg-gray-200">
      <SupplierSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6 text-white">
          <Outlet />
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default SupplierLayout;