import {
  Outlet,
} from 'react-router-dom';

import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout() {
  return (
      <div className="min-h-screen bg-slate-50">
        <AdminSidebar />

        <div className="min-h-screen pl-64">
          <AdminHeader />

          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
  );
}