import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiFileText,
  FiDownload,
  FiEye,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiPrinter,
} from "react-icons/fi";
import { establishmentService } from "@/services/establishments/establishment.service";
import type { EstablishmentSchema } from "@/services/establishments/establishment.types";
import barangayTemplate from '@/assets/barangay_clearance.pdf';
import barangayRenewalTemplate from '@/assets/barangay_clearance_renewal.pdf';
import { PDFDocument, StandardFonts  } from 'pdf-lib';

interface ClearanceOption {
  label: string;
  type: string;
}

interface GeneratedFile {
  id: number;
  applicant: string | null;
  business: string | null;
  address: string | null;
  issueDate: string | null;
  ownership: string | null;
  recordNo: string | null;
  clearanceFee: string | null;
  orNumber: string | null;
  remarks: string | null;
  filename: string;
  generatedAt: string;
  status: string;
}

const clearanceOptions: ClearanceOption[] = [
  { label: "Barangay Clearance (New)", type: "new" },
  { label: "Barangay Clearance (Renewal)", type: "renewal" },
  // ongoing development, temporarily commented out
  // { label: "Business Closure / Retirement", type: "retirement" },
  // { label: "Signage Clearance", type: "signage" },
  // { label: "Custom Clearance", type: "custom" },
  // { label: "Liquor Clearance", type: "liquor" },
];

const EstablishmentDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [modalType, setModalType] = useState<string | null>(null);
  const [pageByType, setPageByType] = useState<Record<string, number>>({});

  const itemsPerPage = 5;

  const toggleExpand = (type: string) => {
    setExpandedType(expandedType === type ? null : type);
  };

  const handleGenerateClick = (type: string) => {
    console.log(`Generate ${type} for establishment ${id}`);
    if (type == 'new') {
      navigate(`/barangay-records/establishments/${id}/clearance/${type}/generate`);
    } else if(type == 'renewal') {
      navigate(`/barangay-records/establishments/${id}/clearance/${type}/generate`);
    }
  };

  const processClearance = async (file: GeneratedFile, type: string) => {
    const existingPdfBytes = await fetch(type == 'new' ? barangayTemplate : barangayRenewalTemplate).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pdfForm = pdfDoc.getForm();
    pdfForm.getTextField('establishment_id').setText(file.id.toString());
    pdfForm.getTextField('applicant_name').setText(file.applicant ?? '');
    pdfForm.getTextField('business_name').setText(file.business ?? '');
    pdfForm.getTextField('location').setText(file.address ?? '');

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    pdfForm.getTextField('applicant_name').updateAppearances(boldFont);
    pdfForm.getTextField('business_name').updateAppearances(boldFont);
    pdfForm.getTextField('location').updateAppearances(boldFont);
    
    const issuedDate = new Date(file.issueDate); // e.g. "2024-05-02"

    const formattedDate = issuedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    pdfForm.getTextField('issued_date').setText(formattedDate ?? '');

    pdfForm.getTextField('ownership').setText(file.ownership ?? '');
    // pdfForm.getTextField('record_no').setText(form.recordNo);
    pdfForm.getTextField('clearance_fee').setText(file.clearanceFee ?? '');
    pdfForm.getTextField('or_no').setText(file.orNumber ?? '');

    pdfForm.getTextField('remarks').setText(file.remarks ?? '');

    pdfForm.flatten(); // optional: makes fields non-editable
    const pdfBytes = await pdfDoc.save();

    return pdfBytes;
  }

   const handleDownload = async (file: GeneratedFile, type: string) => {
    const pdfBytes = await processClearance(file, type);

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', file.filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return pdfBytes;
  };
    

  const handleView = async (file: GeneratedFile, type: string) => {
    const pdfBytes = await processClearance(file, type);

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('target', '_blank');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return pdfBytes;
  };

  const handlePrint = async (file: GeneratedFile, type: string) => {
    const pdfBytes = await processClearance(file, type);

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.src = blobUrl;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 500);
    };

    return pdfBytes;
  };

  const handlePageChange = (type: string, newPage: number) => {
    setPageByType((prev) => ({ ...prev, [type]: newPage }));
  };

  const paginate = (list: GeneratedFile[], type: string) => {
    const page = pageByType[type] || 1;
    const start = (page - 1) * itemsPerPage;
    return list.slice(start, start + itemsPerPage);
  };


  const [establishmentData, setEstablishmentData] = useState<EstablishmentSchema | null>(null);
  const mockGeneratedData: Record<string, GeneratedFile[]> = {
    new: establishmentData?.barangay_clearances_new.map((clearance) => ({
      id: clearance.id,
      applicant: clearance.applicant_name,
      business: clearance.business_name,
      address: clearance.location,
      issueDate: clearance.issued_date,
      ownership: clearance.ownership,
      recordNo: clearance.record_no,
      clearanceFee: clearance.clearance_fee,
      orNumber: clearance.or_no,
      remarks: clearance.remarks,
      filename: clearance.file_name,
      generatedAt: clearance.created_at,
      status: clearance.status,
    })),
    renewal: establishmentData?.barangay_clearances_renewal.map((clearance) => ({
      id: clearance.id,
      applicant: clearance.applicant_name,
      business: clearance.business_name,
      address: clearance.location,
      issueDate: clearance.issued_date,
      ownership: clearance.ownership,
      recordNo: clearance.record_no,
      clearanceFee: clearance.clearance_fee,
      orNumber: clearance.or_no,
      remarks: clearance.remarks,
      filename: clearance.file_name,
      generatedAt: clearance.created_at,
      status: clearance.status,
    })),
    retirement: [],
    signage: [],
    custom: [],
    liquor: [],
  };

  const fetchEstablishment = async () => {
    try {
      const data = await establishmentService.getEstablishment(Number(id));
      setEstablishmentData(data);
    } catch (error) {
      console.error('Error fetching establishment:', error);
    }
  };

  useEffect(() => {
    fetchEstablishment();
  }, []);

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
        {/* Header / Business Name */}
        <h2 className="text-lg font-semibold text-darktext mb-4">
          {establishmentData?.business_name ?? "Unnamed Establishment"}
        </h2>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 text-gray-700 text-sm">
          <div>
            <span className="font-medium">Owner:</span>{" "}
            {establishmentData?.owner ?? "N/A"}
          </div>

          <div>
            <span className="font-medium">Nature of Business:</span>{" "}
            {establishmentData?.nature_of_business ?? "N/A"}
          </div>

          <div>
            <span className="font-medium">Address:</span>{" "}
            {[
              establishmentData?.room_unit,
              establishmentData?.building,
              establishmentData?.no,
              establishmentData?.location,
            ]
              .filter(Boolean)
              .join(", ") || "N/A"}
          </div>

          <div>
            <span className="font-medium">Type:</span>{" "}
            {establishmentData?.type ?? "N/A"}
          </div>

          <div>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`${
                establishmentData?.status === "Active"
                  ? "text-green-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              {establishmentData?.status ?? "N/A"}
            </span>
          </div>

          <div>
            <span className="font-medium">Date Approved:</span>{" "}
            {establishmentData?.date_approved
              ? new Date(establishmentData.date_approved).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "N/A"}
          </div>

          <div>
            <span className="font-medium">Last Renewal:</span>{" "}
            {establishmentData?.date_of_last_renewal
              ? new Date(establishmentData.date_of_last_renewal).toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                )
              : "N/A"}
          </div>
        </div>
      </div>


      {/* Barangay Clearance Section */}
      <section>
        <h3 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-3">
          Generate Barangay Clearances
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clearanceOptions.map((clearance, index) => {
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
                                  Generated on {file.generatedAt}
                                </p>
                              </div>
                              <div className="flex space-x-2 text-gray-500">
                                <button
                                  className="hover:text-red-500 cursor-pointer"
                                  onClick={() => handlePrint(file, clearance.type)}
                                >
                                  <FiPrinter />
                                </button>
                                <button
                                  className="hover:text-smblue-400 cursor-pointer"
                                  onClick={() => handleView(file, clearance.type)}
                                >
                                  <FiEye />
                                </button>
                                <button
                                  className="hover:text-green-500 cursor-pointer"
                                  onClick={() => handleDownload(file, clearance.type)}
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
      {/* {modalType && (
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
                      Generated on {file.generatedAt}
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
      )} */}
    </div>
  );
};

export default EstablishmentDetails;
