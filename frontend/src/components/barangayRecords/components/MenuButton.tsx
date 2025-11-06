import React, { useState, useRef, useEffect } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import barangayTemplate from '@/assets/infra_barangay_clearance.pdf';
import cashbondTemplate from '@/assets/infra_cash_bond.pdf';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const MenuButton = ({ infra }: { infra: any }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const downloadClearance = async () => {
    const existingPdfBytes = await fetch(barangayTemplate).then(res => res.arrayBuffer());
    
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pdfForm = pdfDoc.getForm();
    pdfForm.getTextField('applicant_name').setText(infra.name_of_applicant ?? '');
    pdfForm.getTextField('type_of_project').setText(infra.type_of_project ?? '');
    pdfForm.getTextField('location_of_project').setText(infra.location_of_project ?? '');

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    pdfForm.getTextField('applicant_name').updateAppearances(boldFont);
    pdfForm.getTextField('type_of_project').updateAppearances(boldFont);
    pdfForm.getTextField('location_of_project').updateAppearances(boldFont);
    
    const issuedDate = new Date(infra.date_of_application); // e.g. "2024-05-02"

    const formattedDate = issuedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    pdfForm.getTextField('issued_date').setText(formattedDate ?? '');
    pdfForm.getTextField('record_no').setText(infra.id.toString() ?? '');
    pdfForm.getTextField('remarks').setText(infra.remarks_on_clearance ?? '');

    pdfForm.flatten(); // optional: makes fields non-editable
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `barangay_clearance_${infra.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

    // save data input to server but temporarily disable saving the pdf to server
    // saveFileToServer(pdfBytes, 'print');
    setOpen(false);
    return pdfBytes;
  };

  const downloadCashBondReceipt = async () => {
    const existingPdfBytes = await fetch(cashbondTemplate).then(res => res.arrayBuffer());
    
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pdfForm = pdfDoc.getForm();
    pdfForm.getTextField('applicant_name').setText(infra.name_of_applicant ?? '');
    pdfForm.getTextField('bond_amount').setText(infra.bond_amount_figure ?? '');
    pdfForm.getTextField('bond_word').setText(infra.bond_amount_words ?? '');
    pdfForm.getTextField('location_of_project').setText(infra.location_of_project ?? '');

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    pdfForm.getTextField('applicant_name').updateAppearances(boldFont);
    pdfForm.getTextField('bond_amount').updateAppearances(boldFont);
    pdfForm.getTextField('bond_word').updateAppearances(boldFont);
    pdfForm.getTextField('location_of_project').updateAppearances(boldFont);
    
    const issuedDate = new Date(infra.date_of_application); // e.g. "2024-05-02"

    const formattedDate = issuedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    pdfForm.getTextField('date_of_application').setText(formattedDate ?? '');
    pdfForm.getTextField('date_of_application').updateAppearances(boldFont);

    pdfForm.getTextField('record_no').setText(infra.id.toString() ?? '');

    pdfForm.flatten(); // optional: makes fields non-editable
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cash_bond_${infra.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

    // save data input to server but temporarily disable saving the pdf to server
    // saveFileToServer(pdfBytes, 'print');
    setOpen(false);
    return pdfBytes;
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="text-blue-500 hover:text-blue-400 p-1 rounded-full cursor-pointer"
      >
        <FiMoreHorizontal size={20} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border rounded-md z-10">
          <ul className="py-1 text-sm text-gray-700">
            <li>
              <button
                onClick={() => downloadClearance()}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                Download Clearance
              </button>
            </li>
            <li>
              <button
                onClick={() => downloadCashBondReceipt()}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                Download Cash Bond Receipt
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MenuButton;
