import React, { Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

// registrations
const StaffReg = React.lazy(() => import("../pages/registrations/StaffReg"));
const AddStudent = React.lazy(
  () => import("../pages/registrations/AddStudent")
);
const ChangePassword = React.lazy(() => import("../pages/ChangePassword"));
// dashboards
const StaffDashboard = React.lazy(
  () => import("../pages/Dashboards/StaffDashboard")
);
const GuardianDashboard = React.lazy(
  () => import("../pages/Dashboards/GuardianDashboard")
);

// lists
const AllStudents = React.lazy(() => import("../pages/lists/AllStudents"));
const AssignedStudents = React.lazy(
  () => import("../pages/lists/AssignedStudents")
);
const AllStaff = React.lazy(() => import("../pages/lists/AllStaff"));
const SubStudentList = React.lazy(
  () => import("../pages/lists/SubStudentList")
);
const AllGuardians = React.lazy(() => import("../pages/lists/AllGuardians"));

// profiles
const StudentProfile = React.lazy(
  () => import("../pages/profiles/StudentProfile")
);
const StaffProfile = React.lazy(() => import("../pages/profiles/StaffProfile"));
const GuardianProfile = React.lazy(
  () => import("../pages/profiles/GuardianProfile")
);

//accounting
const TrackStuAcct = React.lazy(
  () => import("../pages/Accounting/TrackStuAccts")
);

//payroll
const Payroll = React.lazy(() => import("../pages/Payroll"));

//others
const AddAssignment = React.lazy(() => import("../pages/AddAssignment"));
const LeaveRequestForm = React.lazy(() => import("../pages//LeaveRequestForm"));
const StaffEvaluationForm = React.lazy(
  () => import("../pages/StaffEvaluationForm")
);
const ProtectedRoute = React.lazy(() => import("../components/ProtectedRoute"));
const NotAuthorized = React.lazy(() => import("../pages/NotAuthorized"));
const LandingPage = React.lazy(() => import("../pages/LandingPage"));
const AdmissionForm = React.lazy(() => import("../pages/AdmissionForm"));
const NotFound = React.lazy(() => import("../pages/NotFound"));
const Login = React.lazy(() => import("../pages/Login"));

// notices
const GuardianInbox = React.lazy(
  () => import("../pages/Notices/GuardianInbox")
);

const SetClassGuardianNotice = React.lazy(
  () => import("../pages/Notices/SetClassGuardianNotice")
);
const SetAllGuardianNotice = React.lazy(
  () => import("../pages/Notices/SetAllGuardianNotice")
);
const SetAllStaffNotice = React.lazy(
  () => import("../pages/Notices/SetAllStaffNotice")
);
const AlertComponent = React.lazy(() => import("../components/Alert"));
const Loader = React.lazy(() => import("../components/Loader"));

import { useAuth } from "./context/AuthContext";
import { useStaff } from "./context/StaffContext";
const App = () => {
  const { user, userRoles } = useAuth();
  const { fetchAllStaff } = useStaff();
  const userRole = user?.role;

  useEffect(() => {
    const fetchData = async () => {
      await fetchAllStaff();
    };
    fetchData();
  }, []);
  return (
    <>
      <AlertComponent />
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen w-full">
            <Loader />
          </div>
        }
      >
        <Routes>
          <Route path="/log-in" element={<Login />} />
          <Route path="*" element={<NotFound />} />
          {/* dashboards */}

          <Route
            path="/staff-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={[
                  userRoles.FormTeacher,
                  userRoles.IT,
                  userRoles.HOD,
                  userRoles.Proprietor,
                  userRoles.SubjectTeacher,
                  userRoles.Accountant,
                  userRoles.Receptionist,
                  userRoles.Librarian,
                ]}
              >
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guardian-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={[
                  userRoles.Guardian,
                  userRoles.IT,
                  userRoles.Proprietor,
                ]}
              >
                <GuardianDashboard />
              </ProtectedRoute>
            }
          />

          {/* registrations */}
          <Route
            path="/staff-reg"
            element={
              <ProtectedRoute
                allowedRoles={[userRoles.IT, userRoles.Proprietor]}
              >
                <StaffReg />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-student"
            element={
              <ProtectedRoute
                allowedRoles={[
                  userRoles.FormTeacher,
                  userRoles.IT,
                  userRoles.Proprietor,
                  userRoles.SubjectTeacher,
                  userRoles.Accountant,
                  userRoles.Receptionist,
                  userRoles.Librarian,
                ]}
              >
                <AddStudent />
              </ProtectedRoute>
            }
          />
          <Route path="/user-change-password" element={<ChangePassword />} />
          {/* lists */}
          <Route
            path="/all-students"
            element={
              <ProtectedRoute
                allowedRoles={[
                  userRoles.FormTeacher,
                  userRoles.IT,
                  userRoles.Proprietor,
                  userRoles.SubjectTeacher,
                  userRoles.Accountant,
                  userRoles.Receptionist,
                  userRoles.Librarian,
                ]}
              >
                <AllStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-guardians"
            element={
              <ProtectedRoute
                allowedRoles={[
                  userRoles.FormTeacher,
                  userRoles.IT,
                  userRoles.Proprietor,
                  userRoles.SubjectTeacher,
                  userRoles.Accountant,
                  userRoles.Receptionist,
                  userRoles.Librarian,
                ]}
              >
                <AllGuardians />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-staff"
            element={
              <ProtectedRoute
                allowedRoles={[
                  userRoles.HOD,
                  userRoles.IT,
                  userRoles.Proprietor,
                ]}
              >
                <AllStaff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assigned-students"
            element={
              <ProtectedRoute
                allowedRoles={[
                  userRoles.FormTeacher,
                  userRoles.IT,
                  userRoles.Proprietor,
                ]}
              >
                <AssignedStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-students"
            element={
              <ProtectedRoute
                allowedRoles={[
                  userRoles.FormTeacher,
                  userRoles.SubjectTeacher,
                  userRoles.IT,
                  userRoles.Proprietor,
                ]}
              >
                <SubStudentList />
              </ProtectedRoute>
            }
          />
          {/* payroll */}

          <Route path="/payroll" element={<Payroll />} />

          {/* profiles */}
          <Route
            path="/student-details"
            element={
              <ProtectedRoute
                allowedRoles={[
                  userRoles.FormTeacher,
                  userRoles.IT,
                  userRoles.Proprietor,
                  userRoles.SubjectTeacher,
                  userRoles.Accountant,
                  userRoles.Receptionist,
                  userRoles.Librarian,
                  userRoles.Guardian,
                ]}
              >
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          {userRole && (
            <Route
              path="/staff/:staffId"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    userRoles.FormTeacher,
                    userRoles.HOD,
                    userRoles.IT,
                    userRoles.Proprietor,
                    userRoles.SubjectTeacher,
                    userRoles.Accountant,
                    userRoles.Receptionist,
                    userRoles.Librarian,
                  ]}
                >
                  <StaffProfile userRole={userRole} />
                </ProtectedRoute>
              }
            />
          )}
          <Route
            path="/guardian/:guardianId"
            element={
              <ProtectedRoute
                allowedRoles={[
                  userRoles.FormTeacher,
                  userRoles.HOD,
                  userRoles.IT,
                  userRoles.Proprietor,
                  userRoles.SubjectTeacher,
                  userRoles.Accountant,
                  userRoles.Receptionist,
                  userRoles.Librarian,
                ]}
              >
                <GuardianProfile />
              </ProtectedRoute>
            }
          />
          {/* accounting */}
          <Route
            path="/track-student-tuition"
            element={
              <ProtectedRoute
                allowedRoles={[
                  userRoles.Accountant,
                  userRoles.IT,
                  userRoles.Proprietor,
                ]}
              >
                <TrackStuAcct />
              </ProtectedRoute>
            }
          />

          {/* notices */}
          <Route
            path="/guardian-inbox"
            element={
              <ProtectedRoute
                allowedRoles={[
                  userRoles.IT,
                  userRoles.Proprietor,
                  userRoles.Guardian,
                ]}
              >
                <GuardianInbox />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-notice-for-all-parents"
            element={
              <ProtectedRoute
                allowedRoles={[userRoles.IT, userRoles.Proprietor]}
              >
                <SetAllGuardianNotice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-notice-for-all-staff"
            element={
              <ProtectedRoute
                allowedRoles={[userRoles.IT, userRoles.Proprietor]}
              >
                <SetAllStaffNotice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-notice-for-parents"
            element={
              <ProtectedRoute
                allowedRoles={[
                  userRoles.IT,
                  userRoles.Proprietor,
                  userRoles.FormTeacher,
                ]}
              >
                <SetClassGuardianNotice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/send-assignment"
            element={
              <ProtectedRoute
                allowedRoles={[
                  userRoles.IT,
                  userRoles.Proprietor,
                  userRoles.FormTeacher,
                  userRoles.SubjectTeacher,
                ]}
              >
                <AddAssignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evaluate-staff"
            element={
              <ProtectedRoute allowedRoles={[userRoles.Proprietor]}>
                <StaffEvaluationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-request"
            element={
              <ProtectedRoute
                allowedRoles={[
                  userRoles.FormTeacher,
                  userRoles.IT,
                  userRoles.Proprietor,
                  userRoles.SubjectTeacher,
                  userRoles.Accountant,
                  userRoles.Receptionist,
                  userRoles.Librarian,
                ]}
              >
                <LeaveRequestForm />
              </ProtectedRoute>
            }
          />
          <Route path="/not-authorized" element={<NotAuthorized />} />

          <Route path="/" element={<LandingPage />} />
          <Route path="/apply" element={<AdmissionForm />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
