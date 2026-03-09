import React from "react";

const Resumes = ({ resumes, pagination, onPageChange }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-4 text-left">Title</th>
            <th className="px-6 py-4 text-left">Template</th>
            <th className="px-6 py-4 text-left">User</th>
            <th className="px-6 py-4 text-left">Updated</th>
          </tr>
        </thead>
        <tbody>
          {resumes.map((r) => (
            <tr key={r.id} className="border-t border-gray-700 hover:bg-gray-750">
              <td className="px-6 py-4">{r.title}</td>
              <td className="px-6 py-4 text-gray-300">
                {r.template_id || "N/A"}
              </td>
              <td className="px-6 py-4">
                <div>{r.user_name}</div>
                <div className="text-sm text-gray-400">{r.user_email}</div>
              </td>
              <td className="px-6 py-4 text-gray-400">
                {new Date(r.updated_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pagination.totalPages > 1 && (
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
      )}
    </div>
  );
};

export default Resumes;
