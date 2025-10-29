import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiChevronDown, FiChevronUp, FiDownload, FiEye, FiFileText, FiPrinter } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { infrastructureService } from "@/services/infrastructures/infrastructure.service";

const InfrastructureDetails = () => {
  const [infrastructure, setInfrastructure] = useState({
    // id: 1,
    // date_of_application: "2024-10-15",
    // type_of_project: "Road Construction",
    // classification: "Major",
    // name_of_applicant: "John Doe",
    // address_of_applicant: "123 Main Street, Quezon City",
    // applicant_contact_no: "09171234567",
    // applicants_representative: "Jane Smith",
    // location_of_project: "EDSA, Quezon City",
    // property_owner: "City Government",
    // contractor: "ABC Construction Corp",
    // contractors_address: "456 Industrial Avenue, QC",
    // contractors_contact_person: "Mr. Rodriguez",
    // contractors_contact_no: "09175555555",
    // remarks_on_clearance: "All requirements satisfied. Approved for construction.",
    // remarks_hidden: "Internal note: Pending final inspection.",
    // bond_amount_words: "Five Hundred Thousand Pesos",
    // bond_amount_figure: "500,000.00",
    // created_by: "Admin User",
    // updated_by: "Admin User",
    // created_at: "2024-10-15 10:30:00",
    // updated_at: "2024-10-20 14:45:00",
  });

  const { id } = useParams();

  useEffect(() => {
    infrastructureService.getInfrastructure(id).then((response) => {
      setInfrastructure(response);
    });
  }, []);

  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [pageByType, setPageByType] = useState<Record<string, number>>({});

  const documentTypes = [
    { label: "Barangay Clearance", type: "barangay_clearance" },
    { label: "Cash Bond Receipt", type: "cash_bond" },
  ];

  const itemsPerPage = 5;

  // Mock generated documents
  const mockDocuments: Record<string, any[]> = {
    barangay_clearance: [
      {
        id: 1,
        filename: "Barangay_Clearance_20241015.pdf",
        generatedAt: "2024-10-15 10:30:00",
      },
      {
        id: 2,
        filename: "Barangay_Clearance_20241020.pdf",
        generatedAt: "2024-10-20 14:45:00",
      },
    ],
    cash_bond: [
      {
        id: 1,
        filename: "Cash_Bond_Receipt_20241015.pdf",
        generatedAt: "2024-10-15 10:35:00",
      },
    ],
  };

  const toggleExpand = (type: string) => {
    setExpandedType(expandedType === type ? null : type);
  };

  const handleGenerateClick = (type: string) => {
    console.log(`Generate ${type} for infrastructure ${infrastructure.id}`);
    navigate(`/barangay-records/infrastructures/${id}/clearance/generate`);
    // Navigate to generate page or open modal
  };

  const handleView = (file: any, type: string) => {
    console.log(`View ${type}:`, file.filename);
    // Open PDF preview in new window
  };

  const handleDownload = (file: any, type: string) => {
    console.log(`Download ${type}:`, file.filename);
    // Download PDF
  };

  const handlePrint = (file: any, type: string) => {
    console.log(`Print ${type}:`, file.filename);
    // Print PDF
  };

  const handlePageChange = (type: string, newPage: number) => {
    setPageByType((prev) => ({ ...prev, [type]: newPage }));
  };

  const paginate = (list: any[], type: string) => {
    const page = pageByType[type] || 1;
    const start = (page - 1) * itemsPerPage;
    return list.slice(start, start + itemsPerPage);
  };

  const handleBack = () => {
    console.log("Navigate back to list");
  };

  const navigate = useNavigate();

  return (
    <div className="p-6">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-smsmblue-500 hover:text-smsmblue-400 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to Infrastructures
        </button>
      </div>

      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Infrastructure Details
      </h1>

      {/* Infrastructure Info Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
        {/* Header / Project Name */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {infrastructure.type_of_project}
        </h2>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 text-gray-700 text-sm">
          <div>
            <span className="font-medium">Applicant:</span>{" "}
            {infrastructure.name_of_applicant}
          </div>

          <div>
            <span className="font-medium">Classification:</span>{" "}
            {infrastructure.classification}
          </div>

          <div>
            <span className="font-medium">Project Location:</span>{" "}
            {infrastructure.location_of_project}
          </div>

          <div>
            <span className="font-medium">Applicant Address:</span>{" "}
            {infrastructure.address_of_applicant}
          </div>

          <div>
            <span className="font-medium">Contact No.:</span>{" "}
            {infrastructure.applicant_contact_no}
          </div>

          <div>
            <span className="font-medium">Representative:</span>{" "}
            {infrastructure.applicants_representative}
          </div>

          <div>
            <span className="font-medium">Contractor:</span>{" "}
            {infrastructure.contractor}
          </div>

          <div>
            <span className="font-medium">Property Owner:</span>{" "}
            {infrastructure.property_owner}
          </div>

          <div>
            <span className="font-medium">Date of Application:</span>{" "}
            {new Date(infrastructure.date_of_application).toLocaleDateString(
              "en-GB",
              { day: "numeric", month: "short", year: "numeric" }
            )}
          </div>

          <div>
            <span className="font-medium">Bond Amount:</span>{" "}
            &#8369;{infrastructure.bond_amount_figure}
          </div>
        </div>
      </div>

      {/* Generate Documents Section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
          Generate Documents
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentTypes.map((doc) => {
            const allFiles = mockDocuments[doc.type] || [];
            const displayedFiles = paginate(allFiles, doc.type);
            const totalPages = Math.ceil(allFiles.length / itemsPerPage);
            const currentPage = pageByType[doc.type] || 1;
            const isExpanded = expandedType === doc.type;

            return (
              <div
                key={doc.type}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-smblue-100 text-smblue-600 p-2 rounded-lg mr-3">
                      <FiFileText className="text-xl" />
                    </div>
                    <h4 className="text-gray-800 font-semibold">
                      {doc.label}
                    </h4>
                  </div>
                  <button
                    onClick={() => toggleExpand(doc.type)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </div>

                {/* Generate Button */}
                <button
                  onClick={() => handleGenerateClick(doc.type)}
                  className="bg-smblue-400 hover:bg-smblue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition mb-4"
                >
                  Generate PDF
                </button>

                {/* Historical Files */}
                {isExpanded && (
                  <div className="border-t pt-3 text-sm text-gray-700">
                    {allFiles.length > 0 ? (
                      <>
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                          {displayedFiles.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2 text-xs"
                            >
                              <div>
                                <p className="font-medium text-gray-800">
                                  {file.filename}
                                </p>
                                <p className="text-gray-500">
                                  {file.generatedAt}
                                </p>
                              </div>
                              <div className="flex space-x-2 text-gray-500">
                                <button
                                  className="hover:text-red-500 cursor-pointer"
                                  onClick={() => handlePrint(file, doc.type)}
                                  title="Print"
                                >
                                  <FiPrinter />
                                </button>
                                <button
                                  className="hover:text-smblue-500 cursor-pointer"
                                  onClick={() => handleView(file, doc.type)}
                                  title="View"
                                >
                                  <FiEye />
                                </button>
                                <button
                                  className="hover:text-green-500 cursor-pointer"
                                  onClick={() => handleDownload(file, doc.type)}
                                  title="Download"
                                >
                                  <FiDownload />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex justify-center items-center gap-2 mt-3">
                            <button
                              className="text-xs px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                              disabled={currentPage === 1}
                              onClick={() =>
                                handlePageChange(doc.type, currentPage - 1)
                              }
                            >
                              Prev
                            </button>
                            <span className="text-xs text-gray-600">
                              Page {currentPage} of {totalPages}
                            </span>
                            <button
                              className="text-xs px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                              disabled={currentPage === totalPages}
                              onClick={() =>
                                handlePageChange(doc.type, currentPage + 1)
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
    </div>
  );
};

export default InfrastructureDetails;
