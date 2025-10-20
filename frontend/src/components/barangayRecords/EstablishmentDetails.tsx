import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiFileText,
  FiDownload,
  FiEye,
  FiChevronDown,
  FiChevronUp,
  FiX,
} from "react-icons/fi";

interface ClearanceOption {
  label: string;
  type: string;
}

interface GeneratedFile {
  id: number;
  filename: string;
  generated_at: string;
  status: string;
}

const clearanceOptions: ClearanceOption[] = [
  { label: "Barangay Clearance (New)", type: "new" },
  { label: "Barangay Clearance (Renewal)", type: "renewal" },
  { label: "Business Closure / Retirement", type: "retirement" },
  { label: "Signage Clearance", type: "signage" },
  { label: "Custom Clearance", type: "custom" },
  { label: "Liquor Clearance", type: "liquor" },
];

const EstablishmentDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const establishment = {
    id,
    name: "Cafe Aurora",
    owner: "Jane Dela Cruz",
    type: "Café / Beverage",
    address: "Purok 5, Brgy. Mabini",
    permit_no: "BRG-2025-0001",
    status: "Active",
  };

  // Mock generated PDFs
  const mockGeneratedData: Record<string, GeneratedFile[]> = {
    new: Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      filename: `barangay_clearance_new_2025-${(i + 1)
        .toString()
        .padStart(2, "0")}.pdf`,
      generated_at: `2025-${(i + 1).toString().padStart(2, "0")}-01`,
      status: i % 2 === 0 ? "Active" : "Archived",
    })),
    renewal: [],
    retirement: [],
    signage: [],
    custom: [],
    liquor: [],
  };

  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [modalType, setModalType] = useState<string | null>(null);
  const [pageByType, setPageByType] = useState<Record<string, number>>({});

  const itemsPerPage = 5;

  const toggleExpand = (type: string) => {
    setExpandedType(expandedType === type ? null : type);
  };

  const openModal = (type: string) => setModalType(type);
  const closeModal = () => setModalType(null);

  const handleGenerateClick = (type: string) => {
    console.log(`Generate ${type} for establishment ${id}`);
  };

  const handleDownload = (file: GeneratedFile) => {
    console.log(`Download ${file.filename}`);
  };

  const handleView = (file: GeneratedFile) => {
    console.log(`Preview ${file.filename}`);
  };

  const handlePageChange = (type: string, newPage: number) => {
    setPageByType((prev) => ({ ...prev, [type]: newPage }));
  };

  const paginate = (list: GeneratedFile[], type: string) => {
    const page = pageByType[type] || 1;
    const start = (page - 1) * itemsPerPage;
    return list.slice(start, start + itemsPerPage);
  };

  return (
    <div className="p-6">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-smblue-500 hover:text-smblue-400 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to Establishments
        </button>
      </div>

      {/* Header */}
      <h1 className="text-2xl font-bold text-darktext mb-6">
        Establishment Details
      </h1>

      {/* Establishment Info */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-darktext mb-4">
          {establishment.name}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 text-gray-700 text-sm">
          <div>
            <span className="font-medium">Owner:</span> {establishment.owner}
          </div>
          <div>
            <span className="font-medium">Business Type:</span>{" "}
            {establishment.type}
          </div>
          <div>
            <span className="font-medium">Permit No:</span>{" "}
            {establishment.permit_no}
          </div>
          <div>
            <span className="font-medium">Address:</span>{" "}
            {establishment.address}
          </div>
          <div>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`${
                establishment.status === "Active"
                  ? "text-green-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              {establishment.status}
            </span>
          </div>
        </div>
      </div>

      {/* Barangay Clearance Section */}
      <section>
        <h3 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-3">
          Generate Barangay Clearances
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clearanceOptions.map((clearance) => {
            const allFiles = mockGeneratedData[clearance.type] || [];
            const displayedFiles = paginate(allFiles, clearance.type);
            const totalPages = Math.ceil(allFiles.length / itemsPerPage);
            const currentPage = pageByType[clearance.type] || 1;
            const isExpanded = expandedType === clearance.type;

            return (
              <div
                key={clearance.type}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-smblue-100 text-smblue-600 p-2 rounded-lg mr-3">
                      <FiFileText className="text-xl" />
                    </div>
                    <h4 className="text-gray-800 font-semibold">
                      {clearance.label}
                    </h4>
                  </div>
                  <button
                    onClick={() => toggleExpand(clearance.type)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </div>

                {/* Generate Button */}
                <button
                  onClick={() => handleGenerateClick(clearance.type)}
                  className="bg-smblue-400 hover:bg-smblue-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Generate PDF
                </button>

                {/* Historical Files */}
                {isExpanded && (
                  <div className="mt-4 border-t pt-3 text-sm text-gray-700">
                    {allFiles.length > 0 ? (
                      <>
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                          {displayedFiles.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2"
                            >
                              <div>
                                <p className="font-medium text-gray-800">
                                  {file.filename}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Generated on {file.generated_at}
                                </p>
                              </div>
                              <div className="flex space-x-2 text-gray-500">
                                <button
                                  className="hover:text-smblue-400"
                                  onClick={() => handleView(file)}
                                >
                                  <FiEye />
                                </button>
                                <button
                                  className="hover:text-green-500"
                                  onClick={() => handleDownload(file)}
                                >
                                  <FiDownload />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex justify-center items-center gap-2 mt-2">
                            <button
                              className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                              disabled={currentPage === 1}
                              onClick={() =>
                                handlePageChange(clearance.type, currentPage - 1)
                              }
                            >
                              Prev
                            </button>
                            <span className="text-xs text-gray-600">
                              Page {currentPage} of {totalPages}
                            </span>
                            <button
                              className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                              disabled={currentPage === totalPages}
                              onClick={() =>
                                handlePageChange(clearance.type, currentPage + 1)
                              }
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 italic text-sm">
                        No generated documents yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal - View All Files */}
      {modalType && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4 p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FiX className="text-xl" />
            </button>
            <h3 className="text-lg font-semibold mb-4">
              All Generated Files -{" "}
              {
                clearanceOptions.find((c) => c.type === modalType)?.label
              }
            </h3>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-1 text-sm">
              {mockGeneratedData[modalType]?.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-gray-800">{file.filename}</p>
                    <p className="text-xs text-gray-500">
                      Generated on {file.generated_at}
                    </p>
                  </div>
                  <div className="flex space-x-2 text-gray-500">
                    <button
                      className="hover:text-smblue-400"
                      onClick={() => handleView(file)}
                    >
                      <FiEye />
                    </button>
                    <button
                      className="hover:text-green-500"
                      onClick={() => handleDownload(file)}
                    >
                      <FiDownload />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstablishmentDetails;
