import { FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { PDFDocument, StandardFonts  } from 'pdf-lib';
import { saveAs } from 'file-saver';
import barangayTemplate from '@/assets/barangay_clearance_renewal.pdf';
import { establishmentService } from "@/services/establishments/establishment.service";
import type { EstablishmentSchema } from "@/services/establishments/establishment.types";
import { QRCodeCanvas } from "qrcode.react";

const ClearanceGenerateRenewal: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    id: "",
    natureOfBusiness: "",
    applicant: "",
    business: "",
    address: "",
    issueDate: "",
    ownership: "",
    recordNo: "",
    clearanceFee: "",
    orNumber: "",
    remarks: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("Form Data:", form);
    // TODO: generate PDF or send to API
  };

  const saveFileToServer = async (pdfBytes: Uint8Array, type: string) => {
      const formData = new FormData();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      formData.append('file', blob);

      const fields = {
        id: form.id,
        applicant_name: form.applicant,
        business_name: form.business,
        location: form.address,
        issued_date: form.issueDate,
        ownership: form.ownership,
        record_no: form.id,
        clearance_fee: form.clearanceFee,
        or_no: form.orNumber,
        remarks: form.remarks,
      };

      Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });

      // comment to generate the pdf in client and not saving the file to server
      await establishmentService.attachRenewalClearance(Number(form.id), formData);

      if (type === 'print') {
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
      } else if (type === 'download') {
        saveAs(blob, 'barangay_clearance.pdf');
      }
  };

  const handlePrint = async () => {
    const existingPdfBytes = await fetch(barangayTemplate).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pdfForm = pdfDoc.getForm();
    pdfForm.getTextField('establishment_id').setText(form.id.toString());
    pdfForm.getTextField('applicant_name').setText(form.applicant ?? '');
    pdfForm.getTextField('business_name').setText(form.business ?? '');
    pdfForm.getTextField('location').setText(form.address ?? '');

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    pdfForm.getTextField('applicant_name').updateAppearances(boldFont);
    pdfForm.getTextField('business_name').updateAppearances(boldFont);
    pdfForm.getTextField('location').updateAppearances(boldFont);
    
    const issuedDate = new Date(form.issueDate); // e.g. "2024-05-02"

    const formattedDate = issuedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    pdfForm.getTextField('issued_date').setText(formattedDate ?? '');

    pdfForm.getTextField('ownership').setText(form.ownership ?? '');
    // pdfForm.getTextField('record_no').setText(form.recordNo);
    pdfForm.getTextField('clearance_fee').setText(form.clearanceFee ?? '');
    pdfForm.getTextField('or_no').setText(form.orNumber ?? '');

    pdfForm.getTextField('remarks').setText(form.remarks ?? '');

    pdfForm.flatten(); // optional: makes fields non-editable
    const pdfBytes = await pdfDoc.save();

    // save data input to server but temporarily disable saving the pdf to server
    saveFileToServer(pdfBytes, 'print');

    return pdfBytes;
  };

  const handleGenerate = async () => {
    const existingPdfBytes = await fetch(barangayTemplate).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pdfForm = pdfDoc.getForm();
    pdfForm.getTextField('establishment_id').setText(form.id.toString());
    pdfForm.getTextField('applicant_name').setText(form.applicant ?? '');
    pdfForm.getTextField('business_name').setText(form.business ?? '');
    pdfForm.getTextField('location').setText(form.address ?? '');

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    pdfForm.getTextField('applicant_name').updateAppearances(boldFont);
    pdfForm.getTextField('business_name').updateAppearances(boldFont);
    pdfForm.getTextField('location').updateAppearances(boldFont);
    
 

    const issuedDate = new Date(form.issueDate); // e.g. "2024-05-02"

    const formattedDate = issuedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    pdfForm.getTextField('issued_date').setText(formattedDate ?? '');

    pdfForm.getTextField('ownership').setText(form.ownership ?? '');
    // pdfForm.getTextField('record_no').setText(form.recordNo);
    pdfForm.getTextField('clearance_fee').setText(form.clearanceFee ?? '');
    pdfForm.getTextField('or_no').setText(form.orNumber ?? '');

    pdfForm.getTextField('remarks').setText(form.remarks ?? '');

    pdfForm.flatten(); // optional: makes fields non-editable
    const pdfBytes = await pdfDoc.save();

    // save data input to server but temporarily disable saving the pdf to server
    saveFileToServer(pdfBytes, 'download');

    return pdfBytes;
  };

  const { id } = useParams<{ id: string }>(); // 👈 get the "id" from the URL

  // const [establishmentData, setEstablishmentData] = useState<EstablishmentSchema | null>(null);

  const fetchEstablishment = async () => {
    try {
      if (!id) return; // guard: id might be undefined during first render
      const data = await establishmentService.getEstablishment(Number(id)); // 👈 convert string → number
      setForm({
        id: data.id,
        natureOfBusiness: data.nature_of_business,
        applicant: data.owner,
        business: data.business_name,
        address: data.location,
        issueDate: data.date_approved,
        ownership: data.ownership,
        recordNo: data.record_no,
        clearanceFee: data.clearance_fee,
        orNumber: data.or_number,
        remarks: data.remarks,
      });
    } catch (error) {
      console.error("Error fetching establishment:", error);
    }
  };

  useEffect(() => {
    fetchEstablishment();
  }, [id]); // 👈 re-run if id changes

  return (
    <div className="p-6">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-smblue-500 hover:text-smblue-400 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to Establishment Details
        </button>
      </div>

      {/* Header */}
      <h1 className="text-2xl font-bold text-darktext mb-6">
        Generate Barangay Clearance (Renewal)
      </h1>

      {/* Generate Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 max-w-2xl mx-auto leading-relaxed text-justify text-[15px]"
      >
        <h1 className="text-center text-lg font-bold underline mb-4">
          BARANGAY CLEARANCE
        </h1>

        <div className="mb-4">
          <p>To whom it may concern:</p>
          <div className="flex items-center justify-center">
            <input
              name="id"
              value={form.id}
              onChange={handleChange}
              className="border border-red-700 bg-black text-yellow-400 font-bold focus:outline-none px-1 text-center w-[75px]"
            />{" "}
          </div>
        </div>


        <div className="mb-4">
          This is to certify that the undersigned approves the herein application
          of{" "}
          <div style={{ width: "100%"}}>
            <input
              name="applicant"
              value={form.applicant}
              onChange={handleChange}
              placeholder="Applicant Name"
              className="border-b border-gray-400 focus:outline-none px-1 text-center w-full"
            />{" "}
          </div>
          <p className="my-2">for the clearance to renew the business of:{" "}</p>
          <div style={{ width: "100%"}}>
            <input
              name="business"
              disabled
              value={form.business}
              onChange={handleChange}
              placeholder="Business Name"
              className="border border-black bg-[#eaf6d1] focus:outline-none px-1 text-center w-full"
            />{" "}
          </div>
          <p className="text-center my-3">with business address at:{" "}</p>
          <div style={{ width: "100%"}}>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Business Address"
              className="border border-black bg-[#eaf6d1] focus:outline-none px-1 text-center w-full"
            />
          </div>
          {/* <div className="my-2">
          <input
              name="natureOfBusiness"
              value={form.natureOfBusiness}
              onChange={handleChange}
              placeholder="Nature of Business"
              className="border-2 border-black focus:outline-none px-1 text-center w-full"
            />
          </div> */}
        </div>

        <p className="mb-4">
              It is further certified that  the subject business establishment is not a  nuisance  to  public order and  safety.     Moreover, the above named applicant   pledged   to   abide   with   the  existing  laws,   ordinance,    rules  and regulations appertaining to said business.
        </p>

        <p className="mb-4">
        This certification is being  issued upon the request of the above named applicant for presentation to the  Business Permits and Licensing Office of Quezon City, prior to  the  issuance of any license or permit for the said business activity pursuant to Sec. 152, Par. (c) of the Republic Act 7160, or the Local Government Code of 1991.
        </p>

        <p className="mb-4">
        This clearance is temporary and may be revoked anytime should public  safety and interest so demands and in case of any violations of Barangay, City, MMDA regulation/ordinances and other applicable laws.
        </p>

        <div className="mt-6 text-center">
          <p>
            Issued this{" "}
            <input
              type="date"
              name="issueDate"
              value={form.issueDate}
              onChange={handleChange}
              className="border-b border-gray-400 focus:outline-none text-center min-w-[150px]"
            />{" "}
            at Quezon City, Metro Manila.
          </p>
        </div>

        {/* Footer Section */}
        <div className="mt-12 flex justify-center">
          {/* Middle: Payment info */}
          <div className="col-span-1 text-xs space-y-1 w-[33%]">
            <div>
              <div className="border border-blue-300 p-1 w-[50%] relative ms-5">
                <p className="absolute top-[-7px] left-2 text-xs text-red-300 font-bold">RENEWAL</p>
                <p className=" text-red-300 font-bold" style={{ fontSize: "30px" }}>2025</p>
              </div>
            </div>
            <div className="flex justify-center align-center">
              <label className="w-[50%] font-semibold">Ownership </label>
              <select
                name="ownership"
                value={form.ownership}
                onChange={handleChange}
                className="border-b border-gray-400 focus:outline-none text-center ml-1 w-[50%]"
              >
                <option value="" disabled>Select</option>
                <option value="Sole Proprietor">Sole Proprietor</option>
                <option value="Partnership">Partnership</option>
                <option value="Corporation">Corporation</option>
                <option value="LLC">LLC</option>
              </select>
            </div>
            <div className="flex justify-center">
              <label className="font-semibold w-[50%]">Record No:</label>
              <input
                name="recordNo"
                value={form.id}
                disabled
                onChange={handleChange}
                className="border-b border-gray-400 focus:outline-none text-center ml-1 w-[50%]"
              />
            </div>
            <div className="flex justify-center">
              <label className="font-semibold w-[50%]">Clearance Fee</label>
              <input
                name="clearanceFee"
                value={form.clearanceFee}
                onChange={handleChange}
                className="border-b border-gray-400 focus:outline-none text-center ml-1 w-[50%]"
                placeholder="e.g. ₱100.00"
              />
            </div>
            <div className="flex justify-center">
              <label className="font-semibold w-[50%]">OR No, </label>
              <input
                name="orNumber"
                value={form.orNumber}
                onChange={handleChange}
                className="border-b border-gray-400 focus:outline-none text-center ml-1 w-[50%]"
              />
            </div>
          </div>

           {/* Left: Remarks */}
           <div className="col-span-1 w-[33%] ms-3">
            <p className="font-bold" style={{fontSize: '8px'}}>REMARKS / CONDITIONS:</p>
            <div className="col-span-1 border border-gray-300 p-3 rounded text-xs">

              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Remarks on Print Business"
                className="w-full h-[100px] resize-none focus:outline-none"
              ></textarea>
            </div>
           </div>

          {/* Right: Signature */}
          <div className="col-span-1 text-center flex flex-col w-[33%]">
            <div>
              <p className="font-bold" style={{fontSize: '12px'}}>HON. ELMER TIMOTHY J. LIGON</p>
              <p className="italic" style={{fontSize: '8px'}}>PUNONG BARANGAY</p>
            </div>
            <div className="flex justify-center">
              <QRCodeCanvas value="BARANGAY WEST TRIANGLE, DISTRICT I, QUEZON CITY (AGS2019)" />
            </div>
          </div>
        </div>

        <p className="text-[10px] text-center text-gray-500 mt-8 italic">
          Note: Not valid if found with erasures, alterations and if without
          barangay seal and official receipt.
        </p>

        <div className="mt-10 text-center">
          <button
            type="submit"
            className="bg-smblue-400 text-white px-6 py-2 rounded hover:bg-smblue-200 cursor-pointer transition"
            onClick={handlePrint}
          >
            Print PDF
          </button>
          <button
            type="submit"
            className="bg-smblue-400 ms-3 text-white px-6 py-2 rounded hover:bg-smblue-200 cursor-pointer transition"
            onClick={handleGenerate}
          >
            Generate PDF
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClearanceGenerateRenewal;
