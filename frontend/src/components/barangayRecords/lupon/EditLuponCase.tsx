import Breadcrumb from "../../_global/Breadcrumb";
import React, { useState, useEffect } from "react";
import { luponCaseService } from "@/services/lupon/luponCase.service";
import { useNotifications } from "@/components/_global/NotificationSystem";
import { useNavigate, useParams } from "react-router-dom";

interface Party {
  id?: number;
  type: number;
  name: string;
  address_line1?: string;
  address_line2?: string;
  address_line3?: string;
}

interface Hearing {
  id?: number;
  sequence_no: number;
  notice_date: string;
  hearing_date: string;
  hearing_time: string;
  remarks?: string;
  proceedings?: string;
}

interface Attachment {
  id?: number;
  file_name: string;
  file_path: string;
  file_type?: string;
  description?: string;
  lupon_hearing_id?: number;
}

const EditLuponCase = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({
    case_no: "",
    case_title: "",
    case_type: "",
    date_filed: "",
    mediator: "",
    remarks: "",
    final_action: "",
    created_by: "1",
  });

  const [parties, setParties] = useState<Party[]>([]);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotifications();

  useEffect(() => {
    if (id) {
      loadLuponCase();
    }
  }, [id]);

  const loadLuponCase = async () => {
    try {
      setIsLoading(true);
      const caseData = await luponCaseService.getLuponCaseById(id!);
      
      setForm({
        case_no: caseData.case_no || "",
        case_title: caseData.case_title || "",
        case_type: caseData.case_type || "",
        date_filed: caseData.date_filed || "",
        mediator: caseData.mediator || "",
        remarks: caseData.remarks || "",
        final_action: caseData.final_action || "",
        created_by: caseData.created_by?.toString() || "1",
      });

      // Load parties
      setParties(caseData.parties?.map((party: any) => ({
        id: party.id,
        type: party.type || 1,
        name: party.name || "",
        address_line1: party.address_line1 || "",
        address_line2: party.address_line2 || "",
        address_line3: party.address_line3 || "",
      })) || []);

      // Load hearings
      setHearings(caseData.hearings?.map((hearing: any) => ({
        id: hearing.id,
        sequence_no: hearing.sequence_no || 1,
        notice_date: hearing.notice_date || "",
        hearing_date: hearing.hearing_date || "",
        hearing_time: hearing.hearing_time || "",
        remarks: hearing.remarks || "",
        proceedings: hearing.proceedings || "",
      })) || []);

      // Load attachments
      setAttachments(caseData.attachments?.map((attachment: any) => ({
        id: attachment.id,
        file_name: attachment.file_name || "",
        file_path: attachment.file_path || "",
        file_type: attachment.file_type || "",
        description: attachment.description || "",
        lupon_hearing_id: attachment.lupon_hearing_id,
      })) || []);

    } catch (error: any) {
      showNotification({
        title: "Error",
        message: "Error loading Lupon Case: " + error.message,
        type: "error",
      });
      navigate("/barangay-records/lupon-cases");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePartyChange = (index: number, field: keyof Party, value: string) => {
    const updatedParties = [...parties];
    updatedParties[index] = { ...updatedParties[index], [field]: value };
    setParties(updatedParties);
  };

  const addParty = () => {
    setParties([
      ...parties,
      { type: 1, name: "", address_line1: "", address_line2: "", address_line3: "" }
    ]);
  };

  const removeParty = (index: number) => {
    if (parties.length > 1) {
      const updatedParties = parties.filter((_, i) => i !== index);
      setParties(updatedParties);
    }
  };

  const handleHearingChange = (index: number, field: keyof Hearing, value: string) => {
    const updatedHearings = [...hearings];
    updatedHearings[index] = { ...updatedHearings[index], [field]: value };
    setHearings(updatedHearings);
  };

  const addHearing = () => {
    setHearings([
      ...hearings,
      { 
        sequence_no: hearings.length + 1, 
        notice_date: "", 
        hearing_date: "", 
        hearing_time: "", 
        remarks: "", 
        proceedings: "" 
      }
    ]);
  };

  const removeHearing = (index: number) => {
    if (hearings.length > 0) {
      const updatedHearings = hearings.filter((_, i) => i !== index);
      // Update sequence numbers
      const renumberedHearings = updatedHearings.map((hearing, idx) => ({
        ...hearing,
        sequence_no: idx + 1
      }));
      setHearings(renumberedHearings);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    
    Array.from(files).forEach(file => {
      const attachment: Attachment = {
        file_name: file.name,
        file_path: URL.createObjectURL(file),
        file_type: file.type,
        description: "",
      };
      newAttachments.push(attachment);
    });

    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (index: number) => {
    const updatedAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(updatedAttachments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      ...form,
      parties: parties.filter(party => party.name.trim() !== ""),
      hearings: hearings.filter(hearing => hearing.hearing_date.trim() !== ""),
      attachments: attachments,
      _method: "PUT", // For Laravel to recognize as update
    };

    setIsSubmitting(true);

    try {
      await luponCaseService.updateLuponCase(id!, formData);
      
      showNotification({
        title: "Success",
        message: "Lupon Case updated successfully.",
        type: "success",
      });

      navigate("/barangay-records/lupon-cases");
    } catch (error: any) {
      showNotification({
        title: "Error",
        message: "Error updating Lupon Case: " + error.message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">
        <Breadcrumb isLoaded={true} />
        <div className="flex items-center justify-center">
          <div className="text-lg">Loading case data...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">
      <Breadcrumb isLoaded={true} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Edit Lupon Case
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Case Details */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Case Information
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Case Number *
              </label>
              <input
                type="text"
                name="case_no"
                value={form.case_no}
                onChange={handleChange}
                placeholder="e.g. 24-26"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Case Type *
              </label>
              <input
                type="text"
                name="case_type"
                value={form.case_type}
                onChange={handleChange}
                placeholder="e.g. EVICTION, ESTAFA"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Case Title *
              </label>
              <input
                type="text"
                name="case_title"
                value={form.case_title}
                onChange={handleChange}
                placeholder="e.g. Complainant vs Respondent"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Date Filed *
              </label>
              <input
                type="date"
                name="date_filed"
                value={form.date_filed}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
                required
              />
            </div>
          </div>
        </section>

        {/* Parties Information */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-smblue-400 pl-3">
              Parties Information
            </h2>
            {/* <button
              type="button"
              onClick={addParty}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Add Party
            </button> */}
          </div>

          <div className="space-y-6">
            {parties.map((party, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="col-span-2 flex justify-between items-center">
                  <h3 className="font-medium text-gray-700">
                    {party.type === 1 ? 'Complainant' : 'Respondent'}
                  </h3>
                  {/* {parties.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParty(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )} */}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Party Type
                  </label>
                  <select
                    value={party.type}
                    onChange={(e) => handlePartyChange(index, 'type', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
                  >
                    <option value="1">Complainant</option>
                    <option value="2">Respondent</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={party.name}
                    onChange={(e) => handlePartyChange(index, 'name', e.target.value)}
                    placeholder="Enter full name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={party.address_line1 || ""}
                    onChange={(e) => handlePartyChange(index, 'address_line1', e.target.value)}
                    placeholder="Street address"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={party.address_line2 || ""}
                    onChange={(e) => handlePartyChange(index, 'address_line2', e.target.value)}
                    placeholder="Barangay"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Address Line 3
                  </label>
                  <input
                    type="text"
                    value={party.address_line3 || ""}
                    onChange={(e) => handlePartyChange(index, 'address_line3', e.target.value)}
                    placeholder="City/Municipality"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hearings */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-smblue-400 pl-3">
              Hearing Schedule
            </h2>
            <button
              type="button"
              onClick={addHearing}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Add Hearing
            </button>
          </div>

          <div className="space-y-4">
            {hearings.map((hearing, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="col-span-2 flex justify-between items-center">
                  <h3 className="font-medium text-gray-700">Hearing #{hearing.sequence_no}</h3>
                  {/* {hearings.length > 0 && (
                    <button
                      type="button"
                      onClick={() => removeHearing(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )} */}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Notice Date
                  </label>
                  <input
                    type="date"
                    value={hearing.notice_date}
                    onChange={(e) => handleHearingChange(index, 'notice_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Hearing Date
                  </label>
                  <input
                    type="date"
                    value={hearing.hearing_date}
                    onChange={(e) => handleHearingChange(index, 'hearing_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Hearing Time
                  </label>
                  <input
                    type="time"
                    value={hearing.hearing_time}
                    onChange={(e) => handleHearingChange(index, 'hearing_time', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Remarks
                  </label>
                  <input
                    type="text"
                    value={hearing.remarks || ""}
                    onChange={(e) => handleHearingChange(index, 'remarks', e.target.value)}
                    placeholder="Hearing remarks"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Proceedings
                  </label>
                  <textarea
                    value={hearing.proceedings || ""}
                    onChange={(e) => handleHearingChange(index, 'proceedings', e.target.value)}
                    rows={3}
                    placeholder="Details of the hearing proceedings"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-smblue-400 focus:border-smblue-400 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Attachments */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Attachments
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Upload Additional Files
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can select multiple files
              </p>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Current Files:</h4>
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{attachment.file_name}</span>
                      {attachment.id && <span className="text-xs text-gray-400">(Existing)</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Case Notes */}
        <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
            Case Notes
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Mediator
              </label>
              <input
                type="text"
                name="mediator"
                value={form.mediator}
                onChange={handleChange}
                placeholder="Name of Mediator"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Final Action
              </label>
              <input
                type="text"
                name="final_action"
                value={form.final_action}
                onChange={handleChange}
                placeholder="e.g. Settled, Dismissed, Pending"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-smblue-400 focus:border-smblue-400 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/barangay-records/lupon-cases")}
            className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-smblue-400 hover:bg-smblue-500 text-white font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Updating..." : "Update Case"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default EditLuponCase;
