import { Link } from 'react-router-dom';

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex-shrink-0">
      <nav className="flex flex-col p-4 space-y-2">
        <Link to="/admin/dashboard" className="hover:bg-gray-700 p-2 rounded">
          🏠 Dashboard
        </Link>
        <Link to="/admin/manage-users" className="hover:bg-gray-700 p-2 rounded">
          👥 Quản lý người dùng
        </Link>
        <Link to="/admin/manage-items" className="hover:bg-gray-700 p-2 rounded">
          📦 Quản lý sản phẩm
        </Link>
      </nav>
    </aside>
  );
}
