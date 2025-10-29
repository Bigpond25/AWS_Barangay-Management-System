import Breadcrumb from "../../_global/Breadcrumb";
import React, { useState } from "react";

const AddNewInfrastructure = () => {
  const [form, setForm] = useState({
    date_of_application: "",
    type_of_project: "",
    classification: "",
    name_of_applicant: "",
    address_of_applicant: "",
    applicant_contact_no: "",
    applicants_representative: "",
    location_of_project: "",
    property_owner: "",
    contractor: "",
    contractors_address: "",
    contractors_contact_person: "",
    contractors_contact_no: "",
    remarks_on_clearance: "",
    remarks_hidden: "",
    bond_amount_words: "",
    bond_amount_figure: "",
  });

  const projectTypes = [
    "Road Construction",
    "Bridge Construction",
    "Water System",
    "Electrical Line",
    "Drainage System",
    "Building Construction",
    "Renovation",
    "Other",
  ];

  const classifications = [
    "Major",
    "Minor",
    "Emergency",
    "Routine",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting form data:", form);
    // API call would go here
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">

      <Breadcrumb isLoaded={true} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Add New Infrastructure</h1>
      </div>

      <div onSubmit={handleSubmit} className="space-y-8">
        {/* Card 1: Application Details */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Application Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Date of Application</label>
              <input
                type="date"
                name="date_of_application"
                value={form.date_of_application}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Type of Project</label>
              <select
                name="type_of_project"
                value={form.type_of_project}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              >
                <option value="">Select</option>
                {projectTypes.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Classification</label>
              <select
                name="classification"
                value={form.classification}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              >
                <option value="">Select</option>
                {classifications.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Location of Project</label>
              <input
                type="text"
                name="location_of_project"
                value={form.location_of_project}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Card 2: Applicant Information */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Applicant Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Name of Applicant</label>
              <input
                type="text"
                name="name_of_applicant"
                value={form.name_of_applicant}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Address of Applicant</label>
              <input
                type="text"
                name="address_of_applicant"
                value={form.address_of_applicant}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contact No.</label>
              <input
                type="text"
                name="applicant_contact_no"
                value={form.applicant_contact_no}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Representative</label>
              <input
                type="text"
                name="applicants_representative"
                value={form.applicants_representative}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Card 3: Property Owner Information */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Property Owner Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Property Owner</label>
              <input
                type="text"
                name="property_owner"
                value={form.property_owner}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Card 4: Contractor Information */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Contractor Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contractor Name</label>
              <input
                type="text"
                name="contractor"
                value={form.contractor}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contractor Address</label>
              <input
                type="text"
                name="contractors_address"
                value={form.contractors_address}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contact Person</label>
              <input
                type="text"
                name="contractors_contact_person"
                value={form.contractors_contact_person}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contact No.</label>
              <input
                type="text"
                name="contractors_contact_no"
                value={form.contractors_contact_no}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Card 5: Bond Information */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Bond Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Bond Amount (Words)</label>
              <input
                type="text"
                name="bond_amount_words"
                value={form.bond_amount_words}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Bond Amount (Figure)</label>
              <input
                type="text"
                name="bond_amount_figure"
                value={form.bond_amount_figure}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Card 6: Remarks */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Remarks
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Remarks on Clearance</label>
              <textarea
                name="remarks_on_clearance"
                value={form.remarks_on_clearance}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Hidden Remarks</label>
              <textarea
                name="remarks_hidden"
                value={form.remarks_hidden}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-smblue-400 hover:bg-smblue-500 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            <span>💾</span>
            Save Record
          </button>
        </div>
      </div>
    </main>
  );
};

export default AddNewInfrastructure;
