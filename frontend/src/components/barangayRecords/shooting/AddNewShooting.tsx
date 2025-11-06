import Breadcrumb from "../../_global/Breadcrumb";
import React, { useState } from "react";
import { shootingService } from "@/services/shootings/shooting.service";
import { useNotifications } from "@/components/_global/NotificationSystem";
import { useNavigate } from "react-router-dom";

const AddNewShooting = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    date_of_application: "",
    name_of_outfit: "",
    program_title: "",
    location: "",
    time: "",
    date_of_shooting: "",
    requested_by: "",
    or_no: "",
    amount_paid: "",
    remarks: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotifications();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    
    for (const key in form) {
      formData.append(key, form[key]);
    }
    
    setIsSubmitting(true);
    shootingService.createShooting(formData)
      .then((response: any) => {
        showNotification({
          title: "Success",
          message: "Shooting created successfully",
          type: "success",
        });

        // clear form
        setForm({
          date_of_application: "",
          name_of_outfit: "",
          program_title: "",
          location: "",
          time: "",
          date_of_shooting: "",
          requested_by: "",
          or_no: "",
          amount_paid: "",
          remarks: "",
        });

        navigate("/barangay-records/shootings");
      })
      .catch((error: any) => {
        showNotification({
          title: "Error",
          message: "Error creating shooting: " + error.message,
          type: "error",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };



  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">

      <Breadcrumb isLoaded={true} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Add New Shooting Application</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Card 1: Application Details */}
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm 
                focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Date of Shooting
              </label>
              <input
                type="date"
                name="date_of_shooting"
                value={form.date_of_shooting}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm 
                focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Name of Outfit
              </label>
              <input
                type="text"
                name="name_of_outfit"
                value={form.name_of_outfit}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm 
                focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Program Title
              </label>
              <input
                type="text"
                name="program_title"
                value={form.program_title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm 
                focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm 
                focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Time
              </label>
              <input
                type="text"
                name="time"
                placeholder="e.g. 9:00 AM - 5:00 PM"
                value={form.time}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm 
                focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Card 2: Payment Details */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Payment Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                OR Number
              </label>
              <input
                type="text"
                name="or_no"
                value={form.or_no}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm 
                focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Amount Paid
              </label>
              <input
                type="number"
                name="amount_paid"
                value={form.amount_paid}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm 
                focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Card 3: Applicant Information */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Applicant Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Requested By
              </label>
              <input
                type="text"
                name="requested_by"
                value={form.requested_by}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm 
                focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Card 4: Remarks */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Remarks
          </h2>
          <div>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none 
              focus:ring-smblue-400 focus:border-smblue-400 outline-none"
            />
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 
            font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 bg-smblue-400 hover:bg-smblue-500 text-white 
            font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              "Save Record"
            )}
          </button>
        </div>
      </form>
    </main>
  );
};

export default AddNewShooting;
