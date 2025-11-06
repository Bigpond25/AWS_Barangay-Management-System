import { createBrowserRouter, RouterProvider, Navigate, useNavigate, useParams } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./components/_global/NotificationSystem";
import ProtectedRoute from "./components/_auth/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Dashboard from "./components/dashboard/Dashboard";
import ResidentManagement from "./components/residentManagement/ResidentManagement";
import AddNewResident from "./components/residentManagement/AddNewResident";
import EditResident from "./components/residentManagement/EditResident";
import ViewResident from "./components/residentManagement/ViewResident";
import ProcessDocument from "./components/processDocument/ProcessDocument";
import BarangayClearanceForm from "./components/processDocument/BarangayClearanceForm";
import BusinessPermitForm from "./components/processDocument/BusinessPermitForm";
import BusinessSignClearanceForm from "./components/processDocument/BusinessSignClearanceForm";
import CertificateOfIndigencyForm from "./components/processDocument/CertificateOfIndigencyForm";
import CertificateOfResidencyForm from "./components/processDocument/CertificateOfResidencyForm";
import NoticeOfHearingForm from "./components/processDocument/NoticeOfHearingForm";
import DocumentQueue from "./components/processDocument/DocumentQueue";
import BarangayClearancePrint from "./components/processDocument/BarangayClearancePrint";
import CertificateOfResidencyPrint from "./components/processDocument/CertificateOfResidencyPrint";
import CertificateOfIndigencyPrint from "./components/processDocument/CertificateOfIndigencyPrint";
import BusinessPermitPrint from "./components/processDocument/BusinessPermitPrint";
import BusinessSignClearancePrint from "./components/processDocument/BusinessSignClearancePrint";
import BusinessSignClearanceColoredPrint from "./components/processDocument/BusinessSignClearanceColoredPrint";
import NoticeOfHearingPrint from "./components/processDocument/NoticeOfHearingPrint";
import HouseholdManagement from "./components/householdManagement/HouseholdManagement";
import AddNewHousehold from "./components/householdManagement/AddNewHousehold";
import EditHousehold from "./components/householdManagement/EditHousehold";
import ViewHousehold from "./components/householdManagement/ViewHousehold";
import BarangayOfficialsPage from "./components/barangayOfficials/BarangayOfficialsPage";
import EditBarangayOfficial from "./components/barangayOfficials/EditBarangayOfficial";
import AddBarangayOfficial from "./components/barangayOfficials/AddBarangayOfficial";
import ListBarangayOfficalsToEdit from "./components/barangayOfficials/ListBarangayOfficalsToEdit";

import DataImport from "./components/import/DataImport";
import ReportsPage from "./components/reports/ReportsPage";
import SettingsPage from "./components/_settings/SettingsPage";
import LoginPage from "./components/_auth/LoginPage";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import './i18';
import queryClient from './lib/queryClient';
import { initializeCacheManager } from './utils/cacheInvalidation';
import ViewBarangayOfficial from "./components/barangayOfficials/ViewBarangayOfficial";
import ActivityLogManagement from "./components/activityLogs/ActivityLogManagement";
import HelpDeskPage from "./components/helpDesk/HelpDeskPage";
import HelpDeskManagementPage from "./components/helpDesk/HelpDeskManagement/HelpDeskManagementPage";
import AppointmentsPage from "./components/helpDesk/Appointments/Appointments";
import BlotterPage from "./components/helpDesk/Blotter/Blotter";
import ComplaintsPage from "./components/helpDesk/Complaints/Complaints";
import SuggestionsPage from "./components/helpDesk/Suggestions/Suggestions";
import AgendaManagementPage from "./components/agenda/AgendaManagementPage";
import AgendaDetailPage from "./components/agenda/AgendaDetailPage";
import UserManagement from "./components/userManagement/UserManagement";
import EditUserPage from "./components/userManagement/EditUserPage";
import ViewUserPage from "./components/userManagement/ViewUserPage";
import PermissionManagementPage from "./components/permissions/PermissionManagementPage";
import PermissionGuard from "./components/permissions/PermissionGuard";
import BarangayClearanceInstallationPrint from "./components/processDocument/BarangayClearanceInstallationPrint";
import BarangayClearanceInstallationForm from "./components/processDocument/BarangayClearanceInstallationForm";
import CashBondForm from "./components/processDocument/CashBondForm";
import RetirementForm from "./components/processDocument/RetirementForm";
import RetirementPrint from "./components/processDocument/RetirementPrint";
import RetirementColoredPrint from "./components/processDocument/RetirementColoredPrint";

import CashBondPrint from "./components/processDocument/CashBondPrint";
import SummonPrint from "./components/processDocument/SummonPrint";
import SummonForm from "./components/processDocument/SummonForm";

import Establishment from "./components/barangayRecords/establishment/Establishment";
import AddNewEstablishment from "./components/barangayRecords/establishment/AddNewEstablishment";
import EstablishmentDetails from "./components/barangayRecords/establishment/EstablishmentDetails";
import Infrastructure from "./components/barangayRecords/infrastructure/Infrastructure";
import ClearanceGenerateNew from "./components/barangayRecords/establishment/ClearanceGenerateNew";
import ClearanceGenerateRenewal from "./components/barangayRecords/establishment/ClearanceGenerateRenewal";
import AddNewInfrastructure from "./components/barangayRecords/infrastructure/AddNewInfrastructure";
import InfrastructureDetails from "./components/barangayRecords/infrastructure/InfrastructureDetails";
import ClearanceGenerate from "./components/barangayRecords/infrastructure/ClearanceGenerate";
import Shooting from "./components/barangayRecords/shooting/Shooting";
import AddNewShooting from "./components/barangayRecords/shooting/AddNewShooting";
import LuponCase from "./components/barangayRecords/lupon/LuponCase";
import EditShooting from "./components/barangayRecords/shooting/EditShooting";
import EditInfrastructure from "./components/barangayRecords/infrastructure/EditInfrastructure";
import EditEstablishment from "./components/barangayRecords/establishment/EditEstablishment";
import AddNewLuponCase from "./components/barangayRecords/lupon/AddLuponCase";
import EditLuponCase from "./components/barangayRecords/lupon/EditLuponCase";
import LuponCaseDetails from "./components/barangayRecords/lupon/LuponCaseDetails";


// Wrapper components to handle navigation prop
const ProcessDocumentWrapper = () => {
  const navigate = useNavigate();
  return <ProcessDocument onNavigate={(item) => navigate(`/${item}`)} />;
};

const DocumentQueueWrapper = () => {
  const navigate = useNavigate();
  return <DocumentQueue onNavigate={(item) => navigate(`/${item}`)} />;
};

const BarangayClearanceFormWrapper = () => {
  const navigate = useNavigate();
  return <BarangayClearanceForm onNavigate={(item) => navigate(`/${item}`)} />;
};

const BarangayClearanceInstallationFormWrapper = () => {
  const navigate = useNavigate();
  return <BarangayClearanceInstallationForm onNavigate={(item) => navigate(`/${item}`)} />;
};

const CashBondFormWrapper = () => {
  const navigate = useNavigate();
  return <CashBondForm onNavigate={(item) => navigate(`/${item}`)} />;
};

const SummonWrapper = () => {
  const navigate = useNavigate();
  return <SummonForm onNavigate={(item) => navigate(`/${item}`)} />;
};

const BusinessPermitFormWrapper = () => {
  const navigate = useNavigate();
  return <BusinessPermitForm onNavigate={(item) => navigate(`/${item}`)} />;
};

const BusinessSignClearanceFormWrapper = () => {
  const navigate = useNavigate();
  return <BusinessSignClearanceForm onNavigate={(item) => navigate(`/${item}`)} />;
};

const CertificateOfIndigencyFormWrapper = () => {
  const navigate = useNavigate();
  return <CertificateOfIndigencyForm onNavigate={(item) => navigate(`/${item}`)} />;
};

const CertificateOfResidencyFormWrapper = () => {
  const navigate = useNavigate();
  return <CertificateOfResidencyForm onNavigate={(item) => navigate(`/${item}`)} />;
};

const NoticeOfHearingFormWrapper = () => {
  const navigate = useNavigate();
  return <NoticeOfHearingForm onNavigate={(item) => navigate(`/${item}`)} />;
};

const RetirementFormWrapper = () => {
  const navigate = useNavigate();
  return <RetirementForm onNavigate={(item) => navigate(`/${item}`)} />;
};

const ClearanceGenerateConditional = () => {
  const { type } = useParams<{ type: string }>();

  if (type === "new") return <ClearanceGenerateNew />;
  if (type === "renewal") return <ClearanceGenerateRenewal />;

  return <div>Invalid clearance type</div>;
}

// Define routes using data format
const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <ProtectedRoute requireAuth={false}>
        <LoginPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute requireAuth={true}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "residents",
        children: [
          {
            index: true,
            element: (
              <PermissionGuard permission="view-residents">
                <ResidentManagement />
              </PermissionGuard>
            ),
          },
          {
            path: "add",
            element: (
              <PermissionGuard permission="create-residents">
                <AddNewResident />
              </PermissionGuard>
            ),
          },
          {
            path: "edit/:id",
            element: (
              <PermissionGuard permission="edit-residents">
                <EditResident />
              </PermissionGuard>
            ),
          },
          {
            path: "view/:id",
            element: (
              <PermissionGuard permission="view-residents">
                <ViewResident />
              </PermissionGuard>
            ),
          },
        ],
      },
      {
        path: "household",
        children: [
          {
            index: true,
            element: (
              <PermissionGuard permission="view-households">
                <HouseholdManagement />
              </PermissionGuard>
            ),
          },
          {
            path: "add",
            element: (
              <PermissionGuard permission="create-households">
                <AddNewHousehold />
              </PermissionGuard>
            ),
          },
          {
            path: "edit/:id",
            element: (
              <PermissionGuard permission="edit-households">
                <EditHousehold />
              </PermissionGuard>
            ),
          },
          {
            path: "view/:id",
            element: (
              <PermissionGuard permission="view-households">
                <ViewHousehold />
              </PermissionGuard>
            ),
          },
        ],
      },
      {
        path: "activity-logs",
        children: [
          {
            index: true,
            element: (
              <PermissionGuard permission="view-reports">
                <ActivityLogManagement />
              </PermissionGuard>
            ),
          },
          {
            path: "add",
            element: (
              <PermissionGuard permission="create-households">
                <AddNewHousehold />
              </PermissionGuard>
            ),
          },
        ],
      },
      {
        path: "import",
        element: (
          <PermissionGuard permission="manage-users">
            <DataImport />
          </PermissionGuard>
        ),
      },
      {
        path: "process-document",
        children: [
          {
            index: true,
            element: (
              <PermissionGuard permission="view-documents">
                <ProcessDocumentWrapper />
              </PermissionGuard>
            ),
          },
          {
            path: "document-queue",
            element: (
              <PermissionGuard permission="view-documents">
                <DocumentQueueWrapper />
              </PermissionGuard>
            ),
          },
          {
            path: "barangay-clearance-installation",
            element: (
              <PermissionGuard permission="create-documents">
                <BarangayClearanceInstallationFormWrapper />
              </PermissionGuard>
            ),
          },
          {
            path: "cash-bond",
            element: (
              <PermissionGuard permission="create-documents">
                <CashBondFormWrapper />
              </PermissionGuard>
            ),
          },
          {
            path: "summon",
            element: (
              <PermissionGuard permission="create-documents">
                <SummonWrapper />
              </PermissionGuard>
            ),
          },
          {
            path: "barangay-clearance",
            element: (
              <PermissionGuard permission="create-documents">
                <BarangayClearanceFormWrapper />
              </PermissionGuard>
            ),
          },
          {
            path: "business-permit",
            element: (
              <PermissionGuard permission="create-documents">
                <BusinessPermitFormWrapper />
              </PermissionGuard>
            ),
          },
          {
            path: "business-sign-clearance",
            element: (
              <PermissionGuard permission="create-documents">
                <BusinessSignClearanceFormWrapper />
              </PermissionGuard>
            ),
          },
          {
            path: "certificate-indigency",
            element: (
              <PermissionGuard permission="create-documents">
                <CertificateOfIndigencyFormWrapper />
              </PermissionGuard>
            ),
          },
          {
            path: "certificate-residency",
            element: (
              <PermissionGuard permission="create-documents">
                <CertificateOfResidencyFormWrapper />
              </PermissionGuard>
            ),
          },
          {
            path: "notice-of-hearing",
            element: (
              <PermissionGuard permission="create-documents">
                <NoticeOfHearingFormWrapper />
              </PermissionGuard>
            ),
          },
          {
            path: "retirement",
            element: (
              <PermissionGuard permission="create-documents">
                <RetirementFormWrapper />
              </PermissionGuard>
            ),
          },
        ],
      },
      {
        path: "barangay-records",
        children: [
          {
            path: "establishments",
            element: (
                <PermissionGuard>
                  <Establishment />
                </PermissionGuard>
            ),
          },
          {
            path: "establishments/add",
            element: (
              <PermissionGuard>
                <AddNewEstablishment />
              </PermissionGuard>
            ),
          },
          {
            path: "establishments/:id",
            element: (
              <PermissionGuard>
                <EstablishmentDetails />
              </PermissionGuard>
            ),
          },
          {
            path: "establishments/:id/edit",
            element: (
              <PermissionGuard>
                <EditEstablishment />
              </PermissionGuard>
            ),
          },
          {
            path: "establishments/:id/clearance/:type/generate",
            element: (
              <PermissionGuard>
                <ClearanceGenerateConditional />
              </PermissionGuard>
            ),
          },
          {
            path: "infrastructures",
            element: (
                <PermissionGuard>
                  <Infrastructure />
                </PermissionGuard>
            ),
          },
          {
            path: "infrastructures/add",
            element: (
              <PermissionGuard>
                <AddNewInfrastructure  />
              </PermissionGuard>
            ),
          },
          {
            path: "infrastructures/:id",
            element: (
              <PermissionGuard>
                <InfrastructureDetails />
              </PermissionGuard>
            ),
          },
          {
            path: "infrastructures/:id/edit",
            element: (
              <PermissionGuard>
                <EditInfrastructure />
              </PermissionGuard>
            ),
          },
          {
            path: "infrastructures/:id/clearance/generate",
            element: (
              <PermissionGuard>
                <ClearanceGenerate />
              </PermissionGuard>
            ),
          },
          {
            path: "shootings",
            element: (
              <PermissionGuard>
                <Shooting />
              </PermissionGuard>
            ),
          },
          {
            path: "shootings/add",
            element: (
              <PermissionGuard>
                <AddNewShooting />
              </PermissionGuard>
            ),
          },
          {
            path: "shootings/:id/edit",
            element: (
              <PermissionGuard>
                <EditShooting />
              </PermissionGuard>
            ),
          },
          {
            path: "lupon-cases",
            element: (
              <PermissionGuard>
                <LuponCase />
              </PermissionGuard>
            ),
          },
          {
            path: "lupon-cases/add",
            element: (
              <PermissionGuard>
                <AddNewLuponCase />
              </PermissionGuard>
            ),
          },
          {
            path: "lupon-cases/:id/edit",
            element: (
              <PermissionGuard>
                <EditLuponCase />
              </PermissionGuard>
            ),
          },
          {
            path: "lupon-cases/:id",
            element: (
              <PermissionGuard>
                <LuponCaseDetails />
              </PermissionGuard>
            ),
          },
        ],
      },
      {
        path: "officials",
        children: [
          {
            index: true,
            element: (
              <PermissionGuard permission="view-officials">
                <BarangayOfficialsPage />
              </PermissionGuard>
            ),
          },
          {
            path: "add",
            element: (
              <PermissionGuard permission="create-officials">
                <AddBarangayOfficial />
              </PermissionGuard>
            ),
          },
          {
            path: "edit",
            element: (
              <PermissionGuard permission="edit-officials">
                <ListBarangayOfficalsToEdit />
              </PermissionGuard>
            ),
          },
          {
            path: "edit/:id",
            element: (
              <PermissionGuard permission="edit-officials">
                <EditBarangayOfficial />
              </PermissionGuard>
            ),
          },
          {
            path: "view/:id",
            element: (
              <PermissionGuard permission="view-officials">
                <ViewBarangayOfficial />
              </PermissionGuard>
            ),
          }
        ]
      },
      {
        path: "projects",
        // children: [
        //   {
        //     index: true,
        //     element: <ProjectsAndPrograms />,
        //   },
        //   {
        //     path: "edit/:projectId",
        //     element: <EditProject />,
        //   },
        //   {
        //     path: "add",
        //     element: <AddNewProject />,
        //   },
        // ],
      },      {
        path: "users",
        children: [
          {
            index: true,
            element: (
              <PermissionGuard permission="manage-users">
                <UserManagement />
              </PermissionGuard>
            ),
          },
          {
            path: "edit/:id",
            element: (
              <PermissionGuard permission="manage-users">
                <EditUserPage />
              </PermissionGuard>
            ),
          },
          {
            path: "view/:id",
            element: (
              <PermissionGuard permission="manage-users">
                <ViewUserPage />
              </PermissionGuard>
            ),
          },
        ],
      },
      {
        path: "settings",
        element: (
          <PermissionGuard permission="system-settings">
            <SettingsPage />
          </PermissionGuard>
        ),
      },
      {
        path: "permissions",
        element: (
          <PermissionGuard permission="manage-roles">
            <PermissionManagementPage />
          </PermissionGuard>
        ),
      },
      {
        path: "reports",
        element: (
          <PermissionGuard permission="view-reports">
            <ReportsPage />
          </PermissionGuard>
        ),
      },
      {
        path: "help-desk",
        children: [
          {
            index: true,
            element: <HelpDeskPage />, // Keep public for citizen access
          },
          {
            path: "management",
            element: (
              <PermissionGuard permission="view-complaints">
                <HelpDeskManagementPage />
              </PermissionGuard>
            ),
          },
          {
            path: "schedule-appointment",
            element: <AppointmentsPage />, // Keep public for citizen access
          },
          {
            path: "file-blotter",
            element: <BlotterPage />, // Keep public for citizen access
          },
          {
            path: "file-complaint",
            element: <ComplaintsPage />, // Keep public for citizen access
          },
          {
            path: "share-suggestions",
            element: <SuggestionsPage />, // Keep public for citizen access
          },
        ],
      },
      {
        path: "agenda",
        children: [
          {
            index: true,
            element: (
              <PermissionGuard permission="view-projects">
                <AgendaManagementPage />
              </PermissionGuard>
            ),
          },
          {
            path: ":id",
            element: (
              <PermissionGuard permission="view-projects">
                <AgendaDetailPage />
              </PermissionGuard>
            ),
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
  // Standalone Print Routes (outside AppLayout to avoid headers/navigation)
  {
    path: "/print/barangay-clearance/:documentId",
    element: (
      <ProtectedRoute requireAuth={true}>
        <BarangayClearancePrint />
      </ProtectedRoute>
    ),
  },
  {
    path: "/print/barangay-clearance-installation/:documentId",
    element: (
      <ProtectedRoute requireAuth={true}>
        <BarangayClearanceInstallationPrint />
      </ProtectedRoute>
    ),
  },
  {
    path: "/print/cash-bond/:documentId",
    element: (
      <ProtectedRoute requireAuth={true}>
        <CashBondPrint />
      </ProtectedRoute>
    ),
  },
  {
    path: "/print/summon/:documentId",
    element: (
      <ProtectedRoute requireAuth={true}>
        <SummonPrint />
      </ProtectedRoute>
    ),
  },
  {
    path: "/print/certificate-residency/:documentId",
    element: (
      <ProtectedRoute requireAuth={true}>
        <CertificateOfResidencyPrint />
      </ProtectedRoute>
    ),
  },
  {
    path: "/print/certificate-indigency/:documentId",
    element: (
      <ProtectedRoute requireAuth={true}>
        <CertificateOfIndigencyPrint />
      </ProtectedRoute>
    ),
  },
  {
    path: "/print/business-permit/:documentId",
    element: (
      <ProtectedRoute requireAuth={true}>
        <BusinessPermitPrint />
      </ProtectedRoute>
    ),
  },
  {
    path: "/print/business-sign-clearance/:documentId",
    element: (
      <ProtectedRoute requireAuth={true}>
        <BusinessSignClearancePrint />
      </ProtectedRoute>
    ),
  },
  {
    path: "/process-document/business-sign-clearance/:documentId/colored-print",
    element: (
      <ProtectedRoute requireAuth={true}>
        <BusinessSignClearanceColoredPrint />
      </ProtectedRoute>
    ),
  },
  {
    path: "/print/notice-of-hearing/:documentId",
    element: (
      <ProtectedRoute requireAuth={true}>
        <NoticeOfHearingPrint />
      </ProtectedRoute>
    ),
  },

  {
    path: "/print/retirement-cessation-dissolution/:documentId",
    element: (
      <ProtectedRoute requireAuth={true}>
        <RetirementPrint />
      </ProtectedRoute>
    ),
  },

  {
    path: "/print/retirement-cessation-dissolution/:documentId/colored-print",
    element: (
      <ProtectedRoute requireAuth={true}>
        <RetirementColoredPrint />
      </ProtectedRoute>
    ),
  },
]);

// Main App Component
function App() {
  // Initialize cache manager with our optimized query client
  useState(() => {
    initializeCacheManager(queryClient);
    return null;
  });

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
