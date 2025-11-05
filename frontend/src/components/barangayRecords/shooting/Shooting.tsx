import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiDownload } from 'react-icons/fi';
import Breadcrumb from '../../_global/Breadcrumb';
import { shootingService } from '@/services/shootings/shooting.service.ts';
import { useNavigate } from 'react-router-dom';
import shootingTemplate  from '@/assets/shooting_permit.pdf';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import ImportButton from '../components/ImportButton';

const Shootings: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shootings, setShootings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });

  const navigate = useNavigate();

  // 🔹 Fetch shootings from Laravel API
  const fetchShootings = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const data = await shootingService.getShootings({
        page,
        search,
      });

      setShootings(data.data || []);
      setPagination({
        current_page: data.meta.current_page,
        last_page: data.meta.last_page,
      });
    } catch (error) {
      console.error('Error fetching shootings:', error);
    } finally {
      setIsLoaded(true);
      setIsLoading(false);
    }
  };

  // 🔹 Search with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchShootings(1, searchTerm);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // 🔹 Pagination handler
  const handlePageChange = (newPage: number) => {
    if (
      newPage !== pagination.current_page &&
      newPage > 0 &&
      newPage <= pagination.last_page
    ) {
      fetchShootings(newPage, searchTerm);
    }
  };

  const handleAddNew = () => {
    navigate(`/barangay-records/shootings/add`);
  };

  const handleEdit = (id: number) => {
    navigate(`/barangay-records/shootings/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      setIsLoading(true);
      await shootingService.deleteShooting(id);
      fetchShootings(pagination.current_page, searchTerm);
    } catch (error) {
      console.error('Error deleting shooting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (shoot: any) => {
    const existingPdfBytes = await fetch(shootingTemplate).then(res => res.arrayBuffer());

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pdfForm = pdfDoc.getForm();
    // pdfForm.getTextField('date_of_application').setText(shoot.date_of_application ?? '');
    pdfForm.getTextField('name_of_outfit').setText(shoot.name_of_outfit ?? '');
    pdfForm.getTextField('program').setText(shoot.program_title ?? '');

    const issuedDate = new Date(shoot.date_of_application); // e.g. "2024-05-02"

    const formattedDate = issuedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    }).replace(/ /g, "-");

    pdfForm.getTextField("date_of_application").setText(formattedDate ?? "");

    pdfForm.getTextField('location').setText(shoot.location ?? '');
    pdfForm.getTextField('requested_by').setText(shoot.requested_by ?? '');
    pdfForm.getTextField('date_of_shooting').setText(shoot.date_of_shooting ?? '');
    pdfForm.getTextField('time').setText(shoot.time ?? '');
    pdfForm.getTextField('remarks').setText(shoot.remarks ?? '');

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    pdfForm.getTextField('name_of_outfit').updateAppearances(boldFont);
    pdfForm.getTextField('program').updateAppearances(boldFont);
    pdfForm.getTextField('location').updateAppearances(boldFont);
    pdfForm.getTextField('requested_by').updateAppearances(boldFont);
    pdfForm.getTextField('date_of_shooting').updateAppearances(boldFont);
    pdfForm.getTextField('time').updateAppearances(boldFont);
    pdfForm.getTextField('remarks').updateAppearances(boldFont);
    
   

    pdfForm.flatten(); // optional: makes fields non-editable
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `barangay_shooting_${shoot.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

    // save data input to server but temporarily disable saving the pdf to server
    // saveFileToServer(pdfBytes, 'print');
    // setOpen(false);
    return pdfBytes;
  };

  const handleImport = async (file: File) => {
    try {
      await shootingService.importShootings(file);
      fetchShootings();
    } catch (error) {
      console.error('Error importing shootings:', error);
    }
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
        <h1 className="text-2xl font-bold text-darktext">Shootings</h1>
        <div className="flex items-center gap-2">
          <ImportButton onImportSuccess={fetchShootings} uploadFile={handleImport} />
          <button
            onClick={handleAddNew}
            disabled={isLoading}
            className="ml-4 bg-smblue-400 hover:bg-smblue-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
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
            Shooting Records
          </h3>
          <input
            type="text"
            placeholder="Search by program title, outfit, or location..."
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
                  'Date of Application',
                  'Program Title',
                  'Name of Outfit',
                  'Location',
                  'Date of Shooting',
                  'Requested By',
                  'OR #',
                  'Amount Paid',
                  'Remarks',
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
                  <td colSpan={11} className="px-6 py-12 text-center text-gray-400">
                    Loading shootings...
                  </td>
                </tr>
              ) : shootings.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm
                      ? `No results found for "${searchTerm}".`
                      : 'No shootings found.'}
                  </td>
                </tr>
              ) : (
                shootings.map((shoot) => (
                  <tr key={shoot.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-700">{shoot.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {shoot.date_of_application || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {shoot.program_title || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {shoot.name_of_outfit || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {shoot.location || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {shoot.date_of_shooting || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {shoot.requested_by || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {shoot.or_no || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      ₱{shoot.amount_paid ?? 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {shoot.remarks || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleDownload(shoot)}
                          className="text-blue-500 hover:text-blue-400"
                        >
                          <FiDownload />
                        </button>
                        <button
                          onClick={() => handleEdit(shoot.id)}
                          className="text-yellow-500 hover:text-yellow-400"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(shoot.id)}
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

export default Shootings;
