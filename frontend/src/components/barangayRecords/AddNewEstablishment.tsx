import React, { useState } from "react";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../_global/Breadcrumb";
import { establishmentService } from "@/services/establishments/establishment.service";

const AddNewEstablishment: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    business_name: "",
    room_unit: "",
    building: "",
    no: "",
    location: "",
    owner: "",
    telephone: "",
    representative: "",
    position: "",
    nature_of_business: "",
    type: "",
    status: "",
    capitalization: "",
    ctc_no: "",
    date_issued: "",
    date_approved: "",
    date_last_renewal: "",
    remarks: "",
    remarks_on_print_business: "",
    date_of_retirement: "",
    amount_paid: "",
    clearance_fee: "",
    sign_amount_paid: "",
    sign_date: "",
    sign_or: "",
    custom_date: "",
    custom_paid: "",
    custom_or: "",
    retirement_clearance: "",
    personal_clearance_fee: "",
    sign_wordings: "",
    size: "",
    material: "",
    docs_attachment: "",
    signature: "",
  });

  const locations = [
    "EDSA",
    "WEST AVE.",
    "QUEZON AVE.",
    "EXAMINER ST.",
    "TIMES ST.",
    "WEST 4TH ST.",
    "WEST 6TH ST.",
    "BULLETIN ST.",
    "FREE PRESS ST.",
    "DAILY MIRROR ST.",
    "LIGAYA ST.",
    "LIWAYWAY ST.",
    "T. BENITEZ ST.",
    "CHRONICLE ST.",
    "DALISAY ST.",
    "KAYUMANGGI ST.",
    "BAYANIHAN ST.",
    "MARIKIT ST.",
    "DALISAY EXT.",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form data:", form);
    const formData = new FormData();

    for (const key in form) {
      formData.append(key, form[key]);
    }

    establishmentService.createEstablishment(formData);
  };

  const handleBack = () => {
    navigate("/barangay-records/establishments");
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">

      <Breadcrumb isLoaded={true} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to list
          </button> */}
          <h1 className="text-2xl font-bold text-gray-800">Add New Establishment</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Card 1: Business Information */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Business Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Input name="business_name" label="Business Name" onChange={handleChange} value={form.business_name} />
            <Input name="nature_of_business" label="Nature of Business" onChange={handleChange} value={form.nature_of_business} />
            <Input name="room_unit" label="Room/Unit" onChange={handleChange} value={form.room_unit} />
            <Input name="building" label="Building" onChange={handleChange} value={form.building} />
            <Input name="no" label="No." onChange={handleChange} value={form.no} />
            <Select name="location" label="Location" options={locations} value={form.location} onChange={handleChange} />
            <Input name="type" label="Type" onChange={handleChange} value={form.type} />
            <Input name="status" label="Status" onChange={handleChange} value={form.status} />
          </div>
        </section>

        {/* Card 2: Ownership Details */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Ownership Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Input name="owner" label="Owner" onChange={handleChange} value={form.owner} />
            <Input name="telephone" label="Telephone" onChange={handleChange} value={form.telephone} />
            <Input name="representative" label="Representative" onChange={handleChange} value={form.representative} />
            <Input name="position" label="Position" onChange={handleChange} value={form.position} />
            <Input name="capitalization" label="Capitalization" onChange={handleChange} value={form.capitalization} />
            <Input name="ctc_no" label="CTC No." onChange={handleChange} value={form.ctc_no} />
            <Input type="date" name="date_issued" label="Date Issued" onChange={handleChange} value={form.date_issued} />
          </div>
        </section>

        {/* Card 3: Approval & Renewal */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Approval & Renewal
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <Input type="date" name="date_approved" label="Date Approved" onChange={handleChange} value={form.date_approved} />
            <Input type="date" name="date_last_renewal" label="Date of Last Renewal" onChange={handleChange} value={form.date_last_renewal} />
            <Input type="date" name="date_of_retirement" label="Date of Retirement" onChange={handleChange} value={form.date_of_retirement} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Textarea name="remarks" label="Remarks" onChange={handleChange} value={form.remarks} />
            <Textarea
              name="remarks_on_print_business"
              label="Remarks on Printed Business"
              onChange={handleChange}
              value={form.remarks_on_print_business}
            />
          </div>
        </section>

        {/* Card 4: Fees & Payments */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Fees & Payments
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <Input name="amount_paid" label="Amount Paid" onChange={handleChange} value={form.amount_paid} />
            <Input name="clearance_fee" label="Clearance Fee" onChange={handleChange} value={form.clearance_fee} />
            <Input name="retirement_clearance" label="Retirement Clearance" onChange={handleChange} value={form.retirement_clearance} />
            <Input name="personal_clearance_fee" label="Personal Clearance Fee" onChange={handleChange} value={form.personal_clearance_fee} />
            <Input name="sign_amount_paid" label="Sign Amount Paid" onChange={handleChange} value={form.sign_amount_paid} />
            <Input type="date" name="sign_date" label="Sign Date" onChange={handleChange} value={form.sign_date} />
            <Input name="sign_or" label="Sign OR" onChange={handleChange} value={form.sign_or} />
            <Input type="date" name="custom_date" label="Custom Date" onChange={handleChange} value={form.custom_date} />
            <Input name="custom_paid" label="Custom Paid" onChange={handleChange} value={form.custom_paid} />
            <Input name="custom_or" label="Custom OR" onChange={handleChange} value={form.custom_or} />
          </div>
        </section>

        {/* Card 5: Signage Details */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Signage Details
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <Input name="sign_wordings" label="Sign Wordings" onChange={handleChange} value={form.sign_wordings} />
            <Input name="size" label="Size" onChange={handleChange} value={form.size} />
            <Input name="material" label="Material" onChange={handleChange} value={form.material} />
          </div>
        </section>

        {/* Card 6: Attachments & Signature */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Attachments & Signature
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Docs Attachment</label>
              <input
                type="file"
                name="docs_attachment"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Signature</label>
              <input
                type="file"
                name="signature"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-smblue-400 hover:bg-smblue-300 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            <FiSave className="w-4 h-4" />
            Save Record
          </button>
        </div>
      </form>
    </main>
  );
};

// Helper Input Component
const Input = ({ name, label, type = "text", value, onChange }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-400 focus:border-blue-400 outline-none"
    />
  </div>
);

const Textarea = ({ name, label, value, onChange }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={4}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-blue-400 focus:border-blue-400 outline-none"
    />
  </div>
);

const Select = ({ name, label, options, value, onChange }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-400 focus:border-blue-400 outline-none"
    >
      <option value="">Select</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default AddNewEstablishment;
