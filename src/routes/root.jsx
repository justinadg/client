import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import HomePage from "./HomePage";
import AboutUs from "./AboutUs";
import Staffs from "./Staffs";
import ContactUs from "./ContactUs";
import SignIn from "./auth/SignIn";
import SignUp from "./auth/SignUp";
import ErrorPage from "./ErrorPage";
import ProtectedRoute from "../auth/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

import AdminDashboard from "./dashboards/AdminDashboard";
import UserDashboard from "./dashboards/UserDashboard";
import StaffDashboard from "./dashboards/StaffDashboard";

import AppointmentsBase from "./appointments/AppointmentsBase";
import AppointmentForm from "../forms/AppointmentForm";
import EditAppointment from "./appointments/EditAppointment";
import StaffsBase from "./staffs/StaffsBase";
import StaffForm from "../forms/StaffForm";
import EditStaff from "./staffs/EditStaff";
import ServicesBase from "./services/ServicesBase";
import ServiceForm from "../forms/ServiceForm";
import EditService from "./services/EditService";
import ServiceCategoriesBase from "./service-categories/ServiceCategoriesBase";
import ServiceCategoryForm from "../forms/ServiceCategoryForm";
import EditServiceCategory from "./service-categories/EditServiceCategory";
import ReviewsBase from "./reviews/ReviewsBase";
import ReviewForm from "../forms/ReviewForm";
import EditReview from "./reviews/EditReview";
import UserManagement from "./user/UserManagement";
import ProfileManagement from "./user/ProfileManagement";
import BootServer from "./auth/BootServer";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import VerifyEmail from "./auth/VerifyEmail";
import StocksBase from "./stocks/StocksBase";
import StockForm from "../forms/StockForm";
import EditStock from "./stocks/EditStock";

export default function Root() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/staffs" element={<Staffs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/register" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/boot-server" element={<BootServer />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Staff routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/staff/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <DashboardLayout>
              <StaffDashboard />
            </DashboardLayout>
          }
        />
      </Route>

      {/* User routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <DashboardLayout>
              <UserDashboard />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Appointments routes */}
      <Route
        path="/appointments"
        element={
          <ProtectedRoute allowedRoles={["admin", "staff", "user"]}>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<AppointmentsBase />} />
        <Route
          path="create"
          element={
            <DashboardLayout>
              <AppointmentForm />
            </DashboardLayout>
          }
        />
        <Route
          path="edit/:appointmentId"
          element={
            <DashboardLayout>
              <EditAppointment />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Staffs routes */}
      <Route
        path="/manage-staffs"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<StaffsBase />} />
        <Route
          path="create"
          element={
            <DashboardLayout>
              <StaffForm />
            </DashboardLayout>
          }
        />
        <Route
          path="edit/:userId"
          element={
            <DashboardLayout>
              <EditStaff />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Services routes */}
      <Route
        path="/manage-services"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<ServicesBase />} />
        <Route
          path="create"
          element={
            <DashboardLayout>
              <ServiceForm />
            </DashboardLayout>
          }
        />
        <Route
          path="edit/:serviceId"
          element={
            <DashboardLayout>
              <EditService />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Service Categories routes */}
      <Route
        path="/manage-service-categories"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<ServiceCategoriesBase />} />
        <Route
          path="create"
          element={
            <DashboardLayout>
              <ServiceCategoryForm />
            </DashboardLayout>
          }
        />
        <Route
          path="edit/:categoryId"
          element={
            <DashboardLayout>
              <EditServiceCategory />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Stock Management routes */}
      <Route
        path="/manage-stocks"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<StocksBase />} />
        <Route
          path="create"
          element={
            <DashboardLayout>
              <StockForm />
            </DashboardLayout>
          }
        />
        <Route
          path="edit/:stockId"
          element={
            <DashboardLayout>
              <EditStock />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Review routes */}
      <Route
        path="/reviews"
        element={
          <ProtectedRoute allowedRoles={["admin", "user"]}>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<ReviewsBase />} />
        <Route
          path="create"
          element={
            <DashboardLayout>
              <ReviewForm />
            </DashboardLayout>
          }
        />
        <Route
          path="edit/:reviewId"
          element={
            <DashboardLayout>
              <EditReview />
            </DashboardLayout>
          }
        />
      </Route>

      {/* User Management routes */}
      <Route
        path="/manage-users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserManagement />} />
      </Route>

      {/* Profile Management routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["admin", "user", "staff"]}>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProfileManagement />} />
      </Route>

      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}