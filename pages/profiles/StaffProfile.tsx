import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase.config";
import { StaffType } from "../../src/types/StaffType";
import { useAuth } from "../../src/context/AuthContext";
import Navbar from "../../components/NavBar";
import { EvaluationType } from "../../src/types/EvaluationType";
import EditStaffPayroll from "../../components/Payroll/EditStaffPayroll";
import { useAlert } from "../../src/context/AlertContext";
import Loader from "../../components/Loader";
interface StaffProfileProps {
  userRole: StaffType["role"];
}

const StaffProfile = ({ userRole }: StaffProfileProps) => {
  const { staffId } = useParams();
  const [staffData, setStaffData] = useState<StaffType | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationType[]>([]);
  const [showEval, setShowEval] = useState(false);
  const [loading, setLoading] = useState(true);
  const [staffStatus, setStaffStatus] = useState<
    "Active" | "Suspended" | "Retired" | "Vacation"
  >(staffData?.accountStatus || "Active");
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [editData, setEditData] = useState<Partial<StaffType>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { user, guardianUser } = useAuth();
  const { showAlert } = useAlert();

  const canEditStatus = user?.role === "IT" || user?.role === "Proprietor";

  const handleSaveStatus = async () => {
    setIsEditingStatus(false);

    if (!staffData?.uid) {
      console.error("Missing current student id or class");
      return;
    }

    try {
      const staffDocRef = doc(db, "staff", staffData.uid);
      await updateDoc(staffDocRef, { accountStatus: staffStatus });
      console.log("Updated staff status:", staffStatus);
    } catch (error) {
      console.error("Error updating staff status:", error);
    }
  };

  useEffect(() => {
    const fetchStaff = async () => {
      if (!staffId) return;

      try {
        const docRef = doc(db, "staff", staffId);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          setEditData(snapshot.data() as Partial<StaffType>);
          const data = snapshot.data() as StaffType;

          setStaffData(data);
          // Fetch evaluations
          const evalsSnapshot = await getDocs(
            collection(db, "staff", staffId, "evaluations")
          );
          const evals = evalsSnapshot.docs.map(
            (doc) => doc.data() as EvaluationType
          );
          setEvaluations(evals);
        } else {
          showAlert("Staff not found.", "error");
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
        showAlert("Failed to load staff profile.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [staffId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Loader />
      </div>
    );
  if (!staffData)
    return <p className="text-center text-red-500 py-10">No data to show.</p>;

  const isAdmin = userRole === "IT" || userRole === "Proprietor";
  const isGuardian = guardianUser?.role === "Guardian";
  const isEditable = user?.role === "IT" || user?.role === "Proprietor";

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 mt-20">
        {/* Profile Header */}
        <div className="bg-[#FFF7ED] border border-[#FDE68A] rounded-3xl p-8 flex flex-col items-center shadow-lg">
          <img
            src={staffData.pfp || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-[#10B981]"
          />
          <h1 className="mt-4 text-4xl font-extrabold text-[#065F46]">
            {staffData.firstName} {staffData.lastName}
          </h1>
          <p className="text-sm text-gray-600 italic">{staffData.role}</p>
        </div>

        {/* Account Status */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-[#78350F]">Account Status</h3>
            {isEditingStatus ? (
              <div className="flex items-center gap-4">
                <select
                  value={staffStatus}
                  onChange={(e) =>
                    setStaffStatus(
                      e.target.value as
                        | "Active"
                        | "Suspended"
                        | "Retired"
                        | "Vacation"
                    )
                  }
                  className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-400"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Retired">Retired</option>
                  <option value="Vacation">Vacation</option>
                </select>
                <button
                  onClick={handleSaveStatus}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold 
              ${
                staffStatus === "Active"
                  ? "bg-emerald-100 text-emerald-700"
                  : staffStatus === "Suspended"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-800"
              }`}
                >
                  {staffStatus}
                </span>
                {canEditStatus && (
                  <button
                    onClick={() => setIsEditingStatus(true)}
                    className="px-5 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <SectionCard title="Staff Info">
            <Detail
              label="Email"
              field="email"
              value={editData.email || ""}
              isEditable={isEditable}
              onChange={(field, value) =>
                setEditData((prev) => ({ ...prev, [field]: value }))
              }
            />
            <Detail
              label="Phone"
              field="phoneNumber"
              value={editData.phoneNumber || ""}
              isEditable={isEditable}
              onChange={(field, value) =>
                setEditData((prev) => ({ ...prev, [field]: value }))
              }
            />
            <Detail
              label="Nationality"
              field="nationality"
              value={editData.nationality || ""}
              isEditable={isEditable}
              onChange={(field, value) =>
                setEditData((prev) => ({ ...prev, [field]: value }))
              }
            />
            <Detail
              label="Date of Birth"
              field="dateOfBirth"
              value={editData.dateOfBirth || ""}
              isEditable={isEditable}
              onChange={(field, value) =>
                setEditData((prev) => ({ ...prev, [field]: value }))
              }
            />
          </SectionCard>

          <SectionCard title="Employment Details">
            {(isAdmin || isGuardian) && (
              <>
                {staffData.role === "FormTeacher" && (
                  <Detail
                    label="Form Teacher Class"
                    field="formTeacherClass"
                    value={editData.formTeacherClass || ""}
                    isEditable={isEditable}
                    onChange={(field, value) =>
                      setEditData((prev) => ({ ...prev, [field]: value }))
                    }
                  />
                )}{" "}
              </>
            )}
            {(staffData.role === "FormTeacher" ||
              staffData.role === "SubjectTeacher") && (
              <Detail
                label="Subjects"
                field="subjectAssignments"
                value={
                  editData.subjectAssignments
                    ?.map((sub) => `${sub.subject} (${sub.class})`)
                    .join(", ") || ""
                }
                isEditable={false}
                onChange={(field, value) =>
                  setEditData((prev) => ({ ...prev, [field]: value }))
                }
              />
            )}
            {isAdmin && (
              <Detail
                label="Salary"
                field="baseSalary"
                value={String(editData.baseSalary ?? "")}
                isEditable={isEditable}
                onChange={(field, value) =>
                  setEditData((prev) => ({
                    ...prev,
                    [field]: parseFloat(value),
                  }))
                }
              />
            )}
          </SectionCard>

          <SectionCard title="Academic Info">
            <Detail
              label="Certifications"
              field="certifications"
              value={editData.certifications?.join(", ") || ""}
              isEditable={isEditable}
              onChange={(field, value) =>
                setEditData((prev) => ({
                  ...prev,
                  [field]: value.split(",").map((c) => c.trim()),
                }))
              }
            />
          </SectionCard>
        </div>
        <SectionCard title="Others">
          {/* Payroll */}
          {((showEval && userRole === "Proprietor") ||
            userRole === "IT" ||
            userRole === "HOD") && <EditStaffPayroll staffId={staffData.uid} />}

          {/* Evaluation */}
          {showEval && userRole === "Proprietor" && (
            <div className="text-center">
              <button
                onClick={() => setShowEval(!showEval)}
                className=" px-6 py-2 bg-amber-400 hover:bg-amber-500 text-white font-medium rounded-xl transition"
              >
                {showEval ? "Hide Evaluation" : "See Staff Evaluation"}
              </button>

              <div className="mt-6 space-y-4">
                {evaluations.length === 0 ? (
                  <p className="text-gray-500">No evaluations available.</p>
                ) : (
                  evaluations.map((item, index) => (
                    <div
                      key={index}
                      className="bg-[#FFFBF0] border border-amber-300 p-4 rounded-xl shadow-sm text-left"
                    >
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Date:</strong>{" "}
                        {new Date(item.date).toLocaleDateString()} |
                        <strong> Evaluator:</strong> {item.evaluatorName} |
                        <strong> Score:</strong> {item.overallScore}/10
                      </p>
                      <p>
                        <strong>Strengths:</strong> {item.strengths}
                      </p>
                      <p>
                        <strong>Weaknesses:</strong> {item.weaknesses}
                      </p>
                      <p>
                        <strong>Recommendations:</strong> {item.recommendations}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </SectionCard>
        {/* Actions */}
        {isEditable && (
          <div className="text-center">
            <button
              disabled={isSaving}
              onClick={async () => {
                setIsSaving(true);
                try {
                  const staffRef = doc(db, "staff", staffData!.uid);
                  await updateDoc(staffRef, editData);
                  showAlert("Changes saved", "success");
                } catch (err) {
                  console.error("Error saving changes:", err);
                  showAlert("Failed to save changes", "error");
                } finally {
                  setIsSaving(false);
                }
              }}
              className="px-6 py-2 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const Detail = ({
  label,
  field,
  value,
  isEditable,
  onChange,
}: {
  label: string;
  field: keyof StaffType;
  value: string;
  isEditable?: boolean;
  onChange?: (field: keyof StaffType, value: string) => void;
}) => (
  <div className="bg-[#FFF7ED] border border-[#FDE68A] rounded-xl p-4 shadow">
    <p className="text-sm text-[#78350F] font-medium">{label}</p>
    {isEditable ? (
      <input
        className="mt-2 w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-amber-400"
        value={value}
        onChange={(e) => onChange?.(field, e.target.value)}
      />
    ) : (
      <p className="mt-1 text-[#065F46] font-semibold">{value || "—"}</p>
    )}
  </div>
);

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
    <h4 className="text-lg font-bold text-[#78350F] mb-4">{title}</h4>
    <div className="space-y-4">{children}</div>
  </div>
);

export default StaffProfile;
