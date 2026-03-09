import React from "react";

const Users = ({
  users,
  pagination,
  onRoleChange,
  onDelete,
  onPageChange
}) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-4 text-left">Name</th>
            <th className="px-6 py-4 text-left">Email</th>
            <th className="px-6 py-4 text-left">Role</th>
            <th className="px-6 py-4 text-left">Resumes</th>
            <th className="px-6 py-4 text-left">Joined</th>
            <th className="px-6 py-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-gray-700 hover:bg-gray-750">
              <td className="px-6 py-4">{u.name}</td>
              <td className="px-6 py-4 text-gray-300">{u.email}</td>
              <td className="px-6 py-4">
                <select
                  value={u.role}
                  onChange={(e) => onRoleChange(u.id, e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-6 py-4">{u.resume_count || 0}</td>
              <td className="px-6 py-4 text-gray-400">
                {new Date(u.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onDelete(u.id, u.name)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pagination.totalPages > 1 && (
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
};

const Pagination = ({ pagination, onPageChange }) => (
  <div className="flex justify-between p-4 border-t border-gray-700">
    <button
      onClick={() => onPageChange(pagination.page - 1)}
      disabled={pagination.page === 1}
      className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
    >
      Previous
    </button>
    <span>
      Page {pagination.page} of {pagination.totalPages}
    </span>
    <button
      onClick={() => onPageChange(pagination.page + 1)}
      disabled={pagination.page === pagination.totalPages}
      className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>
);

export default Users;
