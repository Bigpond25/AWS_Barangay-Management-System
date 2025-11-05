import React, { useState, useEffect } from 'react';
import { FiPlus, FiEye, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import Breadcrumb from '../../_global/Breadcrumb';
import ImportButton from '../components/ImportButton';
import { establishmentService } from '@/services/establishments/establishment.service'
import { useNavigate } from 'react-router-dom';
import type { EstablishmentSchema } from '@/services/establishments/establishment.types';

const BASE_URL = import.meta.env.VITE_API_URL + '/api';

const Establishment: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEstablishment, setNewEstablishment] = useState({
    businessName: '',
    owner: '',
    location: '',
  });

  // 🔹 Fetch data from Laravel API using Fetch API
  const fetchEstablishments = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const data = await establishmentService.getEstablishments({
        page,
        search,
      });

      // Laravel pagination format
      setEstablishments(data.data || []);
      setPagination({
        current_page: data.meta.current_page,
        last_page: data.meta.last_page,
      });
    } catch (error) {
      console.error('Error fetching establishments:', error);
    } finally {
      setIsLoaded(true);
      setIsLoading(false);
    }
  };

  // 🔹 Initial + search debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEstablishments(1, searchTerm);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // 🔹 Pagination handler
  const handlePageChange = (newPage: number) => {
    if (newPage !== pagination.current_page && newPage > 0 && newPage <= pagination.last_page) {
      fetchEstablishments(newPage, searchTerm);
    }
  };

  const navigate = useNavigate();
  
  // 🔹 Modal handlers
  const handleAddNew = () => {
    navigate(`/barangay-records/establishments/add`);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setNewEstablishment({ businessName: '', owner: '', location: '' });
  };

  // 🔹 Save establishment (API POST request)
  const handleSave = async () => {
    if (!newEstablishment.businessName.trim()) {
      alert('Please enter a business name.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/establishments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          business_name: newEstablishment.businessName,
          owner: newEstablishment.owner,
          location: newEstablishment.location,
        }),
      });

      if (!response.ok) throw new Error(`Failed to save establishment (${response.status})`);
      const data = await response.json();

      setEstablishments([data, ...establishments]); // Prepend new record
      handleDialogClose();
    } catch (error) {
      console.error('Error saving establishment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (establishment: EstablishmentSchema) => {
    navigate(`/barangay-records/establishments/${establishment.id}`);
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-4">
      <Breadcrumb isLoaded={isLoaded} />

      {/* Header */}
      <div
        className={`flex items-center justify-between transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <h1 className="text-2xl font-bold text-darktext">Establishments</h1>
        <div className="flex items-center gap-2">
          <ImportButton onImportSuccess={fetchEstablishments} />
          <button
            onClick={handleAddNew}
            disabled={isLoading}
            className="ml-4 bg-smblue-400 hover:bg-smblue-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add New</span>
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
            Establishments
          </h3>
          <input
            type="text"
            placeholder="Search establishment..."
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
                  'ID',
                  'Business Name',
                  'Room/Unit',
                  'Building',
                  'No.',
                  'Location',
                  'Owner',
                  'Nature of Business',
                  'Date Approved',
                  'Date of Last Renewal',
                  'Date of Retirement',
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
                  <td colSpan={12} className="px-6 py-12 text-center text-gray-400">
                    Loading establishments...
                  </td>
                </tr>
              ) : establishments.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm
                      ? `No results found for "${searchTerm}".`
                      : 'No establishments found.'}
                  </td>
                </tr>
              ) : (
                establishments.map((estab) => (
                  <tr key={estab.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-700">{estab.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{estab.business_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{estab.room_unit}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{estab.building}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{estab.no}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{estab.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{estab.owner}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{estab.nature_of_business}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{estab.date_approved}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{estab.date_of_last_renewal}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{estab.date_of_retirement}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex space-x-3">
                        <button onClick={() => handleView(estab)} className="text-smblue-400 hover:text-smblue-300">
                          <FiEye />
                        </button>
                        <button className="text-yellow-500 hover:text-yellow-400">
                          <FiEdit />
                        </button>
                        <button className="text-red-500 hover:text-red-400">
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

      {/* Add Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={handleDialogClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <FiX size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Establishment</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Business Name</label>
                <input
                  type="text"
                  value={newEstablishment.businessName}
                  onChange={(e) =>
                    setNewEstablishment({ ...newEstablishment, businessName: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Owner</label>
                <input
                  type="text"
                  value={newEstablishment.owner}
                  onChange={(e) =>
                    setNewEstablishment({ ...newEstablishment, owner: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Location</label>
                <input
                  type="text"
                  value={newEstablishment.location}
                  onChange={(e) =>
                    setNewEstablishment({ ...newEstablishment, location: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleDialogClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-smblue-400 hover:bg-smblue-300 text-white rounded-lg text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Establishment;
