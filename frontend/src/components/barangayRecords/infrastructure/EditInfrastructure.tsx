import Breadcrumb from "../../_global/Breadcrumb";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { infrastructureService } from "@/services/infrastructures/infrastructure.service";
import { useNotifications } from "@/components/_global/NotificationSystem";

const EditInfrastructure = () => {
  const { id } = useParams(); // from route /infrastructures/edit/:id
  const navigate = useNavigate();
  const { showNotification } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    bond_amount_words: "",
    bond_amount_figure: "",
    remarks_on_clearance: "",
    remarks_hidden: "",
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    infrastructureService
      .getInfrastructure(Number(id))
      .then((res: any) => {
        setForm({
          date_of_application: res.date_of_application || "",
          type_of_project: res.type_of_project || "",
          classification: res.classification || "",
          name_of_applicant: res.name_of_applicant || "",
          address_of_applicant: res.address_of_applicant || "",
          applicant_contact_no: res.applicant_contact_no || "",
          applicants_representative: res.applicants_representative || "",
          location_of_project: res.location_of_project || "",
          property_owner: res.property_owner || "",
          contractor: res.contractor || "",
          contractors_address: res.contractors_address || "",
          contractors_contact_person: res.contractors_contact_person || "",
          contractors_contact_no: res.contractors_contact_no || "",
          bond_amount_words: res.bond_amount_words || "",
          bond_amount_figure: res.bond_amount_figure || "",
          remarks_on_clearance: res.remarks_on_clearance || "",
          remarks_hidden: res.remarks_hidden || "",
        });
      })
      .catch((err: any) => {
        console.error("Error loading infrastructure:", err);
        showNotification({
          title: "Error",
          message: "Failed to load infrastructure details.",
          type: "error",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key as keyof typeof form]);
    }

    infrastructureService
      .updateInfrastructure(Number(id), formData)
      .then(() => {
        showNotification({
          title: "Success",
          message: "Infrastructure record updated successfully.",
          type: "success",
        });
        navigate("/barangay-records/infrastructures");
      })
      .catch((err: any) => {
        showNotification({
          title: "Error",
          message: "Error updating infrastructure: " + err.message,
          type: "error",
        });
      })
      .finally(() => setIsSubmitting(false));
  };

  if (loading)
    return (
      <main className="p-6 flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading infrastructure details...</p>
      </main>
    );

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">
      <Breadcrumb isLoaded={true} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Edit Infrastructure
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Application Details */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Application Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Date of Application
              </label>
              <input
                type="date"
                name="date_of_application"
                value={form.date_of_application}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Type of Project
              </label>
              <input
                type="text"
                name="type_of_project"
                value={form.type_of_project}
                onChange={handleChange}
                placeholder="e.g. Road Construction"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Classification
              </label>
              <input
                type="text"
                name="classification"
                value={form.classification}
                onChange={handleChange}
                placeholder="e.g. Major, Minor"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Location of Project
              </label>
              <input
                type="text"
                name="location_of_project"
                value={form.location_of_project}
                onChange={handleChange}
                placeholder="Enter location"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Applicant Details */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Applicant Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Name of Applicant
              </label>
              <input
                type="text"
                name="name_of_applicant"
                value={form.name_of_applicant}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Address of Applicant
              </label>
              <input
                type="text"
                name="address_of_applicant"
                value={form.address_of_applicant}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Contact No.
              </label>
              <input
                type="text"
                name="applicant_contact_no"
                value={form.applicant_contact_no}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Representative
              </label>
              <input
                type="text"
                name="applicants_representative"
                value={form.applicants_representative}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Contractor & Bond Info */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Contractor & Bond Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Contractor
              </label>
              <input
                type="text"
                name="contractor"
                value={form.contractor}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Contractor's Contact No.
              </label>
              <input
                type="text"
                name="contractors_contact_no"
                value={form.contractors_contact_no}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Bond Amount (in Words)
              </label>
              <input
                type="text"
                name="bond_amount_words"
                value={form.bond_amount_words}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Bond Amount (in Figures)
              </label>
              <input
                type="text"
                name="bond_amount_figure"
                value={form.bond_amount_figure}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Remarks */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Remarks
          </h2>
          <div>
            <textarea
              name="remarks_on_clearance"
              value={form.remarks_on_clearance}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-smblue-400 focus:border-smblue-400 outline-none"
            />
          </div>
        </section>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/barangay-records/infrastructures")}
            className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-smblue-400 hover:bg-smblue-500 text-white font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Updating..." : "Update Record"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default EditInfrastructure;
