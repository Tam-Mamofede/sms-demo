import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../src/components/ui/tabs";
import { Card, CardContent } from "../../src/components/ui/card";
import { Button } from "../../src/components/ui/button";
import {
  UserRound,
  ClipboardList,
  Plus,
  MessageCircle,
  PencilLine,
  Wallet,
  FileEdit,
  MessagesSquare,
  Send,
  Edit3,
  Receipt,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../src/context/AuthContext";

// others
import Navbar from "../../components/NavBar";
import PublicExamSchedule from "../../components/PublicExamSchedule";
import AllStaffNotices from "../../components/Notices/AllStaffNotices";
import { motion } from "framer-motion";

// FormTeacher
import ClassAttendanceForm from "../../components/ClassAttendanceForm";
import { ClassAttendanceReport } from "../../components/ClassAttendanceReport";
import FormClassTimetable from "../../components/Classes/FormClassTimetable";
import CreateExamSchedule from "../../components/Classes/CreateExamSchedule";

//Subject Teacher
import SubjectTeacherGradeEntry from "../../components/Grading/SubjectTeacherGradeEntry";
import SubjectTeacherAttendanceForm from "../../components/SubjectTeacherAttendanceForm";
import SubjectTimetable from "../../components/SubjectTimetable";
import ClassSubjectGrade from "../../components/ClassSubjectGrade";

// Accountant
import Finance from "../../components/Accounting/Finance";

///Librarian
import SellBook from "../../components/Library/SellBook";
import AddBook from "../../components/Library/AddBook";
import BookList from "../../components/Library/BookList";
import AllBorrowedBooks from "../../components/Library/AllBorrowedBooks";
import OverdueBookAlerts from "../../components/Library/OverdueBookAlerts";

// admin
import ViewAdmissions from "../../components/ViewAdmissions";
import LeaveApprovalPanel from "../../components/LeaveApprovalPanel";
import AllStaffEvaluation from "../AllStaffEvaluation";
import Loader from "../../components/Loader";

export default function StaffDashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);

  if (!user) {
    return (
      <div className="text-center mt-10">
        <p>You're not logged in...</p>
      </div>
    );
  }

  const userRole = user?.role;

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loader />
        </div>
      ) : (
        <div className="bg-[#FFF7ED] min-h-screen py-10 px-6 pt-26">
          <Navbar />
          <AllStaffNotices />
          <motion.div
            className="absolute w-64 h-64 bg-[#FDE68A] opacity-30 rounded-full top-10 -left-16 animate-pulse"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-96 h-96 bg-[#F59E0B] opacity-20 rounded-full bottom-0 -right-20 blur-xl"
            animate={{ y: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          {/* <aside className="fixed top-0 left-0 w-full h-16 bg-[#FDE68A] shadow-md z-10"></aside> */}
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-[#065F46] mb-4">
              Welcome, {user?.firstName} {user?.lastName}!
            </h1>

            {/* Profile + Status Section */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              <div className="bg-[#FDE68A] rounded-2xl p-6 shadow w-full md:w-1/3 text-center">
                <img
                  src={user?.pfp || "https://via.placeholder.com/100"}
                  className="w-28 h-28 mx-auto rounded-full mb-4 border-4 border-[#F59E0B]"
                  alt="profile"
                />
                <p className="text-[#065F46] font-semibold">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[#78350F] text-sm italic">{user?.role}</p>
              </div>

              {/* Account Status */}
              <div className="bg-white p-6 rounded-2xl shadow w-full md:w-2/3">
                <h2 className="font-semibold text-[#065F46] mb-2">
                  Account Status
                </h2>
                {/* Replace with shadcn Select component if needed */}
                <select
                  className="border border-emerald-300 rounded-md p-2 w-full mb-3"
                  defaultValue={user?.accountStatus}
                >
                  <option>Active</option>
                  <option>Vacation</option>
                  <option>Retired</option>
                  <option>Suspended</option>
                </select>
                <Button variant="default" className="bg-[#10B981] w-full">
                  Update Status
                </Button>
              </div>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="actions" className="w-full">
              <TabsList className="bg-[#FDE68A] p-2 rounded-xl flex justify-start flex-wrap mb-4 ">
                <TabsTrigger value="actions" className="hover:cursor-pointer">
                  Quick Actions
                </TabsTrigger>
                {(userRole === "Accountant" ||
                  userRole === "IT" ||
                  userRole === "Proprietor") && (
                  <TabsTrigger
                    value="finances"
                    className="hover:cursor-pointer"
                  >
                    Finances
                  </TabsTrigger>
                )}
                {/* Library */}
                {(userRole === "Librarian" ||
                  userRole === "IT" ||
                  userRole === "Proprietor") && (
                  <TabsTrigger value="library" className="hover:cursor-pointer">
                    Library
                  </TabsTrigger>
                )}
                {(userRole === "Librarian" ||
                  userRole === "IT" ||
                  userRole === "Proprietor") && (
                  <TabsTrigger value="addBook" className="hover:cursor-pointer">
                    Add Book
                  </TabsTrigger>
                )}
                {(userRole === "Librarian" ||
                  userRole === "IT" ||
                  userRole === "Proprietor") && (
                  <TabsTrigger
                    value="sellBook"
                    className="hover:cursor-pointer"
                  >
                    Sell Book
                  </TabsTrigger>
                )}
                {(userRole === "Librarian" ||
                  userRole === "IT" ||
                  userRole === "Proprietor") && (
                  <TabsTrigger
                    value="borrowedBooks"
                    className="hover:cursor-pointer"
                  >
                    Borrowed Books
                  </TabsTrigger>
                )}
                {(userRole === "Librarian" ||
                  userRole === "IT" ||
                  userRole === "Proprietor") && (
                  <TabsTrigger
                    value="overdueBooks"
                    className="hover:cursor-pointer"
                  >
                    Overdue Books
                  </TabsTrigger>
                )}
                {/* Teachers */}
                {userRole === "FormTeacher" && (
                  <TabsTrigger
                    value="attendance"
                    className="hover:cursor-pointer"
                  >
                    {user?.formTeacherClass} Attendance
                  </TabsTrigger>
                )}
                {(userRole === "FormTeacher" ||
                  userRole === "SubjectTeacher") && (
                  <TabsTrigger
                    value="subjectGrading"
                    className="hover:cursor-pointer"
                  >
                    Grade Student
                  </TabsTrigger>
                )}{" "}
                {(userRole === "FormTeacher" ||
                  userRole === "SubjectTeacher") && (
                  <TabsTrigger
                    value="subAttendance"
                    className="hover:cursor-pointer"
                  >
                    Class Attendance
                  </TabsTrigger>
                )}
                {userRole === "FormTeacher" && (
                  <TabsTrigger
                    value="formExams"
                    className="hover:cursor-pointer"
                  >
                    {user?.formTeacherClass} Exams
                  </TabsTrigger>
                )}
                <TabsTrigger value="exams" className="hover:cursor-pointer">
                  General Exams
                </TabsTrigger>
                {userRole === "FormTeacher" && (
                  <TabsTrigger
                    value="formTimetable"
                    className="hover:cursor-pointer"
                  >
                    {user?.formTeacherClass} Timetable
                  </TabsTrigger>
                )}
                {(userRole === "FormTeacher" ||
                  userRole === "SubjectTeacher") && (
                  <TabsTrigger
                    value="subjectTimetable"
                    className="hover:cursor-pointer"
                  >
                    Subject Timetable
                  </TabsTrigger>
                )}
                {(userRole === "FormTeacher" ||
                  userRole === "SubjectTeacher") && (
                  <TabsTrigger value="reports" className="hover:cursor-pointer">
                    Reports
                  </TabsTrigger>
                )}
                {/* admin */}
                {userRole === "Proprietor" && (
                  <TabsTrigger value="leaves" className="hover:cursor-pointer">
                    Leave Requests
                  </TabsTrigger>
                )}
                {userRole === "Proprietor" && (
                  <TabsTrigger value="apps" className="hover:cursor-pointer">
                    Applications
                  </TabsTrigger>
                )}
                {userRole === "Proprietor" && (
                  <TabsTrigger value="evals" className="hover:cursor-pointer">
                    Staff Evaluations
                  </TabsTrigger>
                )}
              </TabsList>
              {/* aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa */}
              {/* Quick Actions */}
              <TabsContent value="actions">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userRole === "FormTeacher" && (
                    <DashboardCard
                      title={`Students in ${user?.formTeacherClass}`}
                      icon={<ClipboardList />}
                      onClick={() => navigate("/assigned-students")}
                    />
                  )}
                  {(userRole === "FormTeacher" ||
                    userRole === "SubjectTeacher") && (
                    <DashboardCard
                      title="Students Taking My Subject(s)"
                      icon={<UserRound />}
                      onClick={() => navigate("/my-students")}
                    />
                  )}
                  <DashboardCard
                    title="View All Students"
                    icon={<UserRound />}
                    onClick={() => navigate("/all-students")}
                  />
                  <DashboardCard
                    title="View All Guardians"
                    icon={<UserRound />}
                    onClick={() => navigate("/all-guardians")}
                  />
                  <DashboardCard
                    title="Add Student"
                    icon={<Plus />}
                    onClick={() => navigate("/add-student")}
                  />
                  {(userRole === "Accountant" ||
                    userRole === "IT" ||
                    userRole === "Proprietor") && (
                    <DashboardCard
                      title="Track Tuitions"
                      icon={<Wallet />}
                      onClick={() => navigate("/track-student-tuition")}
                    />
                  )}
                  {(userRole === "IT" ||
                    userRole === "Proprietor" ||
                    userRole === "HOD") && (
                    <DashboardCard
                      title="View All Staff"
                      icon={<UserRound />}
                      onClick={() => navigate("/all-staff")}
                    />
                  )}
                  {(userRole === "IT" ||
                    userRole === "Proprietor" ||
                    userRole === "HOD") && (
                    <DashboardCard
                      title="Add Staff"
                      icon={<Plus />}
                      onClick={() => navigate("/staff-reg")}
                    />
                  )}
                  {(userRole === "IT" || userRole === "Proprietor") && (
                    <DashboardCard
                      title="Send Notice to all Parents"
                      icon={<MessagesSquare />}
                      onClick={() => navigate("/create-notice-for-all-parents")}
                    />
                  )}
                  {(userRole === "IT" || userRole === "Proprietor") && (
                    <DashboardCard
                      title="Send Notice to all Staff"
                      icon={<Send />}
                      onClick={() => navigate("/create-notice-for-all-staff")}
                    />
                  )}
                  {userRole === "FormTeacher" && (
                    <DashboardCard
                      title="Send Notice to Parents"
                      icon={<MessageCircle />}
                      onClick={() => navigate("/create-notice-for-parents")}
                    />
                  )}
                  {(userRole === "FormTeacher" ||
                    userRole === "SubjectTeacher") && (
                    <DashboardCard
                      title="Add Assignment"
                      icon={<PencilLine />}
                      onClick={() => navigate("/send-assignment")}
                    />
                  )}
                  {userRole !== "Proprietor" && (
                    <DashboardCard
                      title="Request for Leave"
                      icon={<FileEdit />}
                      onClick={() => navigate("/leave-request")}
                    />
                  )}
                  {userRole === "Proprietor" && (
                    <DashboardCard
                      title="Evaluate Staff"
                      icon={<Edit3 />}
                      onClick={() => navigate("/evaluate-staff")}
                    />
                  )}

                  {/* HOD */}
                  {(userRole === "HOD" ||
                    userRole === "IT" ||
                    userRole === "Proprietor") && (
                    <DashboardCard
                      title="See Payroll"
                      icon={<Receipt />}
                      onClick={() => navigate("/payroll")}
                    />
                  )}
                </div>
              </TabsContent>
              {/* aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa */}
              {/* Library */}
              {(userRole === "Librarian" ||
                userRole === "IT" ||
                userRole === "Proprietor") && (
                <TabsContent value="library">
                  <div>
                    <BookList />
                  </div>
                </TabsContent>
              )}{" "}
              {(userRole === "Librarian" ||
                userRole === "IT" ||
                userRole === "Proprietor") && (
                <TabsContent value="addBook">
                  <div>
                    <AddBook />
                  </div>
                </TabsContent>
              )}{" "}
              {(userRole === "Librarian" ||
                userRole === "IT" ||
                userRole === "Proprietor") && (
                <TabsContent value="sellBook">
                  <div>
                    <SellBook />
                  </div>
                </TabsContent>
              )}{" "}
              {(userRole === "Librarian" ||
                userRole === "IT" ||
                userRole === "Proprietor") && (
                <TabsContent value="borrowedBooks">
                  <div>
                    <AllBorrowedBooks />
                  </div>
                </TabsContent>
              )}{" "}
              {(userRole === "Librarian" ||
                userRole === "IT" ||
                userRole === "Proprietor") && (
                <TabsContent value="overdueBooks">
                  <div>
                    <OverdueBookAlerts />
                  </div>
                </TabsContent>
              )}
              {/* admin */}
              {(userRole === "Receptionist" ||
                userRole === "IT" ||
                userRole === "Proprietor") && (
                <TabsContent value="apps">
                  <div>
                    <ViewAdmissions />
                  </div>
                </TabsContent>
              )}
              {userRole === "Proprietor" && (
                <TabsContent value="leaves">
                  <div>
                    <LeaveApprovalPanel />
                  </div>
                </TabsContent>
              )}
              {userRole === "Proprietor" && (
                <TabsContent value="evals">
                  <div>
                    <AllStaffEvaluation />
                  </div>
                </TabsContent>
              )}
              {/* Teacher */}
              {userRole === "FormTeacher" && (
                <TabsContent value="attendance">
                  <div>
                    <ClassAttendanceForm />
                    <ClassAttendanceReport date={today} />
                  </div>
                </TabsContent>
              )}
              {(userRole === "FormTeacher" ||
                userRole === "SubjectTeacher") && (
                <TabsContent value="subAttendance">
                  <div>
                    <SubjectTeacherAttendanceForm />
                  </div>
                </TabsContent>
              )}
              {(userRole === "FormTeacher" ||
                userRole === "SubjectTeacher") && (
                <TabsContent value="subjectGrading">
                  <SubjectTeacherGradeEntry />
                </TabsContent>
              )}
              {userRole === "FormTeacher" && (
                <TabsContent value="formExams">
                  <div>
                    <CreateExamSchedule classId={user?.formTeacherClass} />
                  </div>
                </TabsContent>
              )}
              <TabsContent value="exams">
                <div>
                  <PublicExamSchedule />
                </div>
              </TabsContent>
              {userRole === "FormTeacher" && (
                <TabsContent value="formTimetable">
                  <div>
                    <FormClassTimetable />
                  </div>
                </TabsContent>
              )}
              {(userRole === "FormTeacher" ||
                userRole === "SubjectTeacher") && (
                <TabsContent value="subjectTimetable">
                  <div>
                    <SubjectTimetable />
                  </div>
                </TabsContent>
              )}
              {(userRole === "FormTeacher" ||
                userRole === "SubjectTeacher") && (
                <TabsContent value="reports">
                  <div>
                    <ClassSubjectGrade />
                  </div>
                </TabsContent>
              )}
              {/* Finance */}
              {(userRole === "Accountant" ||
                userRole === "IT" ||
                userRole === "Proprietor") && (
                <TabsContent value="finances">
                  <div>
                    <Finance />
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
}

// Extracted reusable DashboardCard
function DashboardCard({
  title,
  icon,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer bg-[#FDE68A] hover:bg-[#FCD34D] transition duration-200 shadow-md rounded-xl"
    >
      <CardContent className="p-4 text-center">
        <div className="flex justify-center mb-2 text-[#78350F]">{icon}</div>
        <h3 className="text-lg font-semibold text-[#78350F]">{title}</h3>
      </CardContent>
    </Card>
  );
}
