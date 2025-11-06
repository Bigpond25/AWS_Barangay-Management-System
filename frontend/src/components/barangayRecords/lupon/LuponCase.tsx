import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import Breadcrumb from '../../_global/Breadcrumb';
import { luponCaseService } from '@/services/lupon/luponCase.service';
import { useNavigate } from 'react-router-dom';
import ImportButton from '../components/ImportButton';
import RenderDeleteModal from '../components/RenderDeleteModal';
import type { LuponCase } from '@/services/lupon/luponCase.type';

const LuponCase: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });

  const navigate = useNavigate();

  // 🔹 Fetch Lupon Cases from Laravel API
  const fetchCases = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const data = await luponCaseService.getLuponCases({
        page,
        search,
      });

      setCases(data.data || []);
      setPagination({
        current_page: data.meta.current_page,
        last_page: data.meta.last_page,
      });
    } catch (error) {
      console.error('Error fetching lupon cases:', error);
    } finally {
      setIsLoaded(true);
      setIsLoading(false);
    }
  };

  // 🔹 Debounced Search
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchCases(1, searchTerm);
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // 🔹 Pagination
  const handlePageChange = (newPage: number) => {
    if (
      newPage !== pagination.current_page &&
      newPage > 0 &&
      newPage <= pagination.last_page
    ) {
      fetchCases(newPage, searchTerm);
    }
  };

  // 🔹 Navigation
  const handleAddNew = () => {
    navigate(`/barangay-records/lupon/add`);
  };

  const handleEdit = (id: number) => {
    navigate(`/barangay-records/lupon/${id}/edit`);
  };

  const handleView = (id: number) => {
    navigate(`/barangay-records/lupon/${id}/view`);
  };

  // 🔹 Delete
  const handleDelete = async (luponCase: LuponCase) => {
    try {
      setIsDeleting(true);
      await luponCaseService.deleteLuponCase(luponCase.id);
      fetchCases(pagination.current_page, searchTerm);
    } catch (error) {
      console.error('Error deleting lupon case:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // 🔹 Initial Load
  useEffect(() => {
    fetchCases();
  }, []);

  const handleImport = async (file: File) => {
    try {
      await luponCaseService.importLuponCases(file);
      fetchCases();
    } catch (error) {
      console.error('Error importing lupon case:', error);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-4">
      {
        RenderDeleteModal({
          showDeleteModal,
          selectedItem,
          textItem: selectedItem?.case_no,
          setShowDeleteModal,
          setSelectedItem,
          handleDelete,
          isDeleting,
        })
      }
      <Breadcrumb isLoaded={isLoaded} />

      {/* Header */}
      <div
        className={`flex items-center justify-between transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <h1 className="text-2xl font-bold text-darktext">Lupon Cases</h1>
        <div className="flex items-center gap-2">
        <ImportButton onImportSuccess={fetchCases} uploadFile={handleImport} />
        <button
          onClick={handleAddNew}
          disabled={isLoading}
          className="ml-4 bg-smblue-400 hover:bg-smblue-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add New Case</span>
        </button>
        </div>
      </div>

      {/* Table Section */}
      <section
        className={`bg-white border border-gray-100 shadow-sm rounded-2xl p-6 transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="flex flex-col justify-between mb-4">
          <h3 className="text-lg font-semibold text-darktext mb-6 border-l-4 border-smblue-400 pl-4">
            Lupon Case Records
          </h3>
          <input
            type="text"
            placeholder="Search by case no., title, or mediator..."
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-64 focus:ring-smblue-400 focus:border-smblue-400 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'Case No.',
                  'Case Title',
                  'Case Type',
                  'Date Filed',
                  // 'Mediator',
                  'Remarks',
                  // 'Final Action',
                  'Created By',
                  'Actions',
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    Loading cases...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm
                      ? `No results found for "${searchTerm}".`
                      : 'No Lupon cases found.'}
                  </td>
                </tr>
              ) : (
                cases.map((lupon) => (
                  <tr key={lupon.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-700">{lupon.case_no || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{lupon.case_title || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{lupon.case_type || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{lupon.date_filed || '—'}</td>
                    {/* <td className="px-6 py-4 text-sm text-gray-700">{lupon.mediator || '—'}</td> */}
                    <td className="px-6 py-4 text-sm text-gray-700">{lupon.remarks || '—'}</td>
                    {/* <td className="px-6 py-4 text-sm text-gray-700">{lupon.final_action || '—'}</td> */}
                    <td className="px-6 py-4 text-sm text-gray-700">{lupon.creator?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleView(lupon.id)}
                          className="text-blue-500 hover:text-blue-400"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => handleEdit(lupon.id)}
                          className="text-yellow-500 hover:text-yellow-400"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteModal(true);
                            setSelectedItem(lupon);
                          }}
                          className="text-red-500 hover:text-red-400"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center mt-6 space-x-2">
          <button
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <button
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
            className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
};

export default LuponCase;
