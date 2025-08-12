import { useEffect, useState } from "react";
import { collectionGroup, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import { db } from "../../firebase.config";
import { useAuth } from "../../src/context/AuthContext";
import { useStudent } from "../../src/context/StudentContext";
import { useNavigate } from "react-router-dom";
import { StudentType } from "../../src/types/StudentType";
import GuardianNavbar from "../../components/GuardianNavbar";
import ClassGuardianNotices from "../../components/Notices/ClassGuardianNotices";
import AllGuardianNotices from "../../components/Notices/AllGuardianNotices";
import Loader from "../../components/Loader";
const GuardianDashboard = () => {
  const { guardianUser, isAuthenticated } = useAuth();
  const { setCurrentStudent } = useStudent();
  const [students, setStudents] = useState<StudentType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        if (!guardianUser?.studentIds?.length) return;

        const snapshot = await getDocs(collectionGroup(db, "students"));

        const matchedStudents = snapshot.docs
          .filter((doc) =>
            guardianUser.studentIds
              .map((id) => id.trim())
              .includes(doc.id.trim())
          )
          .map((doc) => ({
            ...(doc.data() as StudentType),
            id: doc.id,
          }));

        const dedupedStudents = matchedStudents.filter(
          (student, index, self) =>
            index === self.findIndex((s) => s.id === student.id)
        );

        setStudents(dedupedStudents);
      } catch (error) {
        console.error("Error fetching students for guardian:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [guardianUser]);

  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <p className="text-red-600 font-semibold text-center">
          Not authenticated. Please log in.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative px-6 py-10 bg-[#FFF7ED] min-h-screen overflow-hidden">
        <GuardianNavbar />

        <ClassGuardianNotices />
        <AllGuardianNotices />
        {/* Floating blobs background */}
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
        <div className="relative z-10 max-w-6xl mx-auto text-center mt-20">
          <h2 className="text-4xl font-extrabold text-[#065F46] mb-2">
            🌟 Guardian Dashboard
          </h2>
          <p className="text-lg text-[#78350F] mb-8">
            Welcome, {guardianUser?.guardianName}
          </p>

          {loading ? (
            <div className="flex justify-center items-center h-full w-full">
              <Loader />
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <img
                src="https://www.svgrepo.com/show/494761/confused.svg"
                alt="No students found"
                className="w-28 h-28 opacity-80"
              />
              <p className="text-[#78350F] font-semibold">
                Hmm... no students linked yet!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#FDE68A] border border-[#F59E0B] rounded-2xl p-6 shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => {
                    setCurrentStudent(student);
                    navigate("/student-details");
                  }}
                >
                  <h3 className="text-2xl font-bold text-[#065F46] mb-1">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-[#78350F] font-semibold mb-2">
                    Class: {student.class}
                  </p>
                  <p className="text-[#78350F] font-medium mb-1">Subjects:</p>
                  <ul className="list-disc list-inside text-sm text-[#78350F]">
                    {student.subjects?.map((subj, index) => (
                      <li key={index}>{subj}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GuardianDashboard;
