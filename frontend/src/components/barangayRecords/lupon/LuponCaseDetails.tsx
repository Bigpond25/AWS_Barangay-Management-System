import Breadcrumb from "../../_global/Breadcrumb";
import React, { useState, useEffect } from "react";
import { luponCaseService } from "@/services/lupon/luponCase.service";
import { useNotifications } from "@/components/_global/NotificationSystem";
import { useNavigate, useParams } from "react-router-dom";

interface Party {
  id: number;
  type: string;
  name: string;
  address_line1?: string;
  address_line2?: string;
  address_line3?: string;
}

interface Hearing {
  id: number;
  sequence_no: number;
  notice_date: string;
  hearing_date: string;
  hearing_time: string;
  remarks?: string;
  proceedings?: string;
}

interface Attachment {
  id: number;
  file_name: string;
  file_path: string;
  file_type?: string;
  description?: string;
}

interface LuponCase {
  id: number;
  case_no: string;
  case_title: string;
  case_type: string;
  date_filed: string;
  mediator: string;
  remarks: string;
  final_action: string;
  created_at: string;
  updated_at: string;
  parties: Party[];
  hearings: Hearing[];
  attachments: Attachment[];
}

const LuponCaseDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<LuponCase | null>(null);
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
      const data = await luponCaseService.getLuponCaseById(id!);
      setCaseData(data);
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'settled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'dismissed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPartyTypeLabel = (type: string) => {
    switch (type?.toString().toLowerCase()) {
      case '1':
        return 'Complainant';
      case '2':
        return 'Respondent';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">
        <Breadcrumb isLoaded={true} />
        <div className="flex items-center justify-center">
          <div className="text-lg">Loading case details...</div>
        </div>
      </main>
    );
  }

  if (!caseData) {
    return (
      <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">
        <Breadcrumb isLoaded={true} />
        <div className="flex items-center justify-center">
          <div className="text-lg text-gray-500">Case not found.</div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">
      <Breadcrumb isLoaded={true} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Case {caseData.case_no}
            </h1>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(caseData.final_action)}`}>
              {caseData.final_action || 'Pending'}
            </span>
          </div>
          <p className="text-gray-600 mt-1">
            {caseData.case_title}
          </p>
        </div>
        {/* <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/barangay-records/lupon-cases")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Back to List
          </button>
          <button
            onClick={() => navigate(`/barangay-records/lupon-cases/${caseData.id}/edit`)}
            className="bg-smblue-400 hover:bg-smblue-500 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Edit Case
          </button>
        </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Information */}
          <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
              Case Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Case Number
                  </label>
                  <p className="text-gray-900 font-medium">{caseData.case_no}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Case Type
                  </label>
                  <p className="text-gray-900">{caseData.case_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Date Filed
                  </label>
                  <p className="text-gray-900">{formatDate(caseData.date_filed)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Case Title
                  </label>
                  <p className="text-gray-900">{caseData.case_title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Mediator
                  </label>
                  <p className="text-gray-900">{caseData.mediator || 'Not assigned'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Final Action
                  </label>
                  <p className="text-gray-900">{caseData.final_action || 'Pending'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Parties Involved */}
          <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
              Parties Involved
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {caseData.parties.map((party, index) => (
                <div key={party.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-700 capitalize">
                      {getPartyTypeLabel(party.type)}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Party {index + 1}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Full Name
                      </label>
                      <p className="text-gray-900 font-medium">{party.name}</p>
                    </div>
                    {(party.address_line1 || party.address_line2 || party.address_line3) && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Address
                        </label>
                        <p className="text-gray-900 text-sm">
                          {[party.address_line1, party.address_line2, party.address_line3]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Hearing Schedule */}
          {caseData.hearings.length > 0 && (
            <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
                Hearing Schedule
              </h2>
              <div className="space-y-4">
                {caseData.hearings
                  .sort((a, b) => a.sequence_no - b.sequence_no)
                  .map((hearing) => (
                  <div key={hearing.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-700">
                        Hearing #{hearing.sequence_no}
                      </h3>
                      {hearing.notice_date && (
                        <span className="text-xs text-gray-500">
                          Notice: {formatDate(hearing.notice_date)}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Hearing Date
                        </label>
                        <p className="text-gray-900">
                          {hearing.hearing_date ? formatDate(hearing.hearing_date) : 'Not scheduled'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Hearing Time
                        </label>
                        <p className="text-gray-900">
                          {hearing.hearing_time ? formatTime(hearing.hearing_time) : 'Not specified'}
                        </p>
                      </div>
                      {hearing.remarks && (
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Remarks
                          </label>
                          <p className="text-gray-900 text-sm">{hearing.remarks}</p>
                        </div>
                      )}
                      {hearing.proceedings && (
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Proceedings
                          </label>
                          <p className="text-gray-900 text-sm whitespace-pre-wrap">{hearing.proceedings}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Case Remarks */}
          {caseData.remarks && (
            <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
                Case Remarks
              </h2>
              <p className="text-gray-900 whitespace-pre-wrap">{caseData.remarks}</p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Case Status */}
          <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
              Case Status
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(caseData.final_action)}`}>
                  {caseData.final_action || 'Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Date Filed:</span>
                <span className="text-sm text-gray-900">{formatDate(caseData.date_filed)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Updated:</span>
                <span className="text-sm text-gray-900">{formatDate(caseData.updated_at)}</span>
              </div>
            </div>
          </section>

          {/* Attachments */}
          {caseData.attachments.length > 0 && (
            <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
                Attachments ({caseData.attachments.length})
              </h2>
              <div className="space-y-2">
                {caseData.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                          {attachment.file_name}
                        </p>
                        {attachment.description && (
                          <p className="text-xs text-gray-500">{attachment.description}</p>
                        )}
                      </div>
                    </div>
                    <a
                      href={attachment.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-smblue-400 hover:text-smblue-500 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Quick Actions */}
          <section className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-smblue-400 pl-3">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/barangay-records/lupon-cases/${caseData.id}/edit`)}
                className="w-full bg-smblue-400 hover:bg-smblue-500 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Edit Case Details
              </button>
              {/* <button
                onClick={() => window.print()}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Print Case Summary
              </button> */}
              <button
                onClick={() => navigate("/barangay-records/lupon-cases")}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Back to All Cases
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LuponCaseDetails;
