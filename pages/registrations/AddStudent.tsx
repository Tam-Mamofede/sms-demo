import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { db, auth } from "../../firebase.config";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  setDoc,
  arrayUnion,
} from "firebase/firestore";
import {
  StudentFormData,
  studentSchema,
} from "../../src/schemas/studentSchema";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../../src/context/StudentContext";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../../src/context/AuthContext";
import Navbar from "../../components/NavBar";
import { useAlert } from "../../src/context/AlertContext";

const AddStudent = () => {
  const { classOptions } = useAuth();
  const { showAlert } = useAlert();

  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectList, setSubjectList] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<StudentFormData>({
    resolver: yupResolver(studentSchema),
  });

  const subjectOptions = [
    "Mathematics",
    "English",
    "Biology",
    "Chemistry",
    "Physics",
    "Geography",
    "Economics",
    "Literature",
    "ICT",
    "PHE",
  ];

  const navigate = useNavigate();

  const { generateStudentId, setAddNewSt } = useStudent();

  const onSubmit = async (data: StudentFormData) => {
    try {
      const studentId = await generateStudentId();

      const studentsColRef = doc(db, "classes", data.class);
      const studentRef = await addDoc(collection(studentsColRef, "students"), {
        ...data,
        studentId,
        name: data.class,
      });

      await updateDoc(studentRef, {
        id: studentRef.id,
      });

      // guardian
      let guardianId: string;

      try {
        const defaultPassword = "defaultPassword123";
        const guardianCredential = await createUserWithEmailAndPassword(
          auth,
          data.guardianEmail,
          defaultPassword
        );
        guardianId = guardianCredential.user.uid;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err.code === "auth/email-already-in-use") {
          showAlert(
            "Guardian email already exists. Linking student to existing guardian...",
            "info"
          );

          // get the guardian ID from Firestore
          const guardiansRef = collection(db, "guardians");
          const snapshot = await getDocs(guardiansRef);
          const match = snapshot.docs.find(
            (doc) => doc.data().email === data.guardianEmail
          );

          if (match) {
            guardianId = match.id;
          } else {
            showAlert(
              "Guardian email exists in auth but not found in Firestore. Manual fix needed.",
              "warning"
            );
            return;
          }
        } else {
          throw err;
        }
      }

      //Link student to guardian in Firestore
      const guardianRef = doc(db, "guardians", guardianId);
      await setDoc(
        guardianRef,
        {
          id: guardianId,
          guardianName: data.guardianName,
          guardianEmail: data.guardianEmail,
          guardianPhone: data.guardianPhone,
          guardianAddress: data.guardianAddress,
          guardianWorkAddress: data.guardianWorkAddress,
          role: "Guardian",
          studentIds: arrayUnion(studentRef.id),
          createdAt: new Date(),
        },
        { merge: true }
      );

      await updateDoc(studentRef, {
        guardianId: guardianId,
      });

      showAlert("Student added successfully!", "success");
      setAddNewSt(true);
      navigate("/all-students");
    } catch (error) {
      console.error("Error adding student:", error);
      showAlert("Error adding student.", "error");
    } finally {
      reset();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7ED] text-[#065F46]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10 mt-26">
        <div className="bg-[#fde996] p-8 rounded-xl shadow-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-[#78350F]">
            Student Registration
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold">First Name</label>
                <input
                  className="w-full p-2 border border-gray-700 rounded-xl"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="font-semibold">Last Name</label>
                <input
                  className="w-full p-2 border border-gray-700 rounded-xl"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* DOB & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold">Date of Birth</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-700 rounded-xl"
                  {...register("dateOfBirth")}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>
              <div>
                <label className="font-semibold">Gender</label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <select
                      className="w-full p-2 border border-gray-700 rounded-xl"
                      {...field}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  )}
                />
                {errors.gender && (
                  <p className="text-red-500 text-sm">
                    {errors.gender.message}
                  </p>
                )}
              </div>
            </div>

            {/* Nationality */}
            <div>
              <label className="font-semibold">Nationality</label>
              <input
                className="w-full p-2 border border-gray-700 rounded-xl"
                {...register("nationality")}
              />
              {errors.nationality && (
                <p className="text-red-500 text-sm">
                  {errors.nationality.message}
                </p>
              )}
            </div>

            {/* Guardian Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold">Guardian Name</label>
                <input
                  className="w-full p-2 border border-gray-700 rounded-xl"
                  {...register("guardianName")}
                />
                {errors.guardianName && (
                  <p className="text-red-500 text-sm">
                    {errors.guardianName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="font-semibold">Guardian Phone</label>
                <input
                  className="w-full p-2 border border-gray-700 rounded-xl"
                  {...register("guardianPhone")}
                />
                {errors.guardianPhone && (
                  <p className="text-red-500 text-sm">
                    {errors.guardianPhone.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="font-semibold">Guardian Email</label>
              <input
                className="w-full p-2 border border-gray-700 rounded-xl"
                {...register("guardianEmail")}
              />
              {errors.guardianEmail && (
                <p className="text-red-500 text-sm">
                  {errors.guardianEmail.message}
                </p>
              )}
            </div>

            <div>
              <label className="font-semibold">Guardian Address</label>
              <input
                className="w-full p-2 border border-gray-700 rounded-xl"
                {...register("guardianAddress")}
              />
              {errors.guardianAddress && (
                <p className="text-red-500 text-sm">
                  {errors.guardianAddress.message}
                </p>
              )}
            </div>

            <div>
              <label className="font-semibold">Guardian Work Address</label>
              <input
                className="w-full p-2 border border-gray-700 rounded-xl"
                {...register("guardianWorkAddress")}
              />
              {errors.guardianWorkAddress && (
                <p className="text-red-500 text-sm">
                  {errors.guardianWorkAddress.message}
                </p>
              )}
            </div>

            {/* Contact */}
            <div>
              <label className="font-semibold">Phone Number</label>
              <input
                className="w-full p-2 border border-gray-700 rounded-xl"
                {...register("phoneNumber")}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div>
              <label className="font-semibold">Home Address</label>
              <input
                className="w-full p-2 border border-gray-700 rounded-xl"
                {...register("address")}
              />
              {errors.address && (
                <p className="text-red-500 text-sm">{errors.address.message}</p>
              )}
            </div>

            {/* Class */}
            <div>
              <label className="font-semibold">Class</label>
              <select
                className="w-full p-2 border border-gray-700 rounded-xl"
                {...register("class")}
              >
                <option value="">Select Class</option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
              {errors.class && (
                <p className="text-red-500 text-sm">{errors.class.message}</p>
              )}
            </div>

            {/* Subjects */}
            <div>
              <label className="font-semibold">Subjects</label>
              <div className="flex gap-2 mb-2">
                <select
                  className="w-full p-2 border border-gray-700 rounded-xl"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">Select Subject</option>
                  {subjectOptions
                    .filter((subject) => !subjectList.includes(subject))
                    .map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  className="bg-[#10B981] text-white px-4 py-2 rounded-xl"
                  onClick={() => {
                    if (
                      selectedSubject &&
                      !subjectList.includes(selectedSubject)
                    ) {
                      const updated = [...subjectList, selectedSubject];
                      setSubjectList(updated);
                      setValue("subjects", updated);
                      setSelectedSubject("");
                    }
                  }}
                >
                  Add
                </button>
              </div>

              <ul className="space-y-2">
                {subjectList.map((subject) => (
                  <li
                    key={subject}
                    className="flex justify-between items-center bg-white p-2 rounded-xl shadow"
                  >
                    <span>{subject}</span>
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={() => {
                        const updated = subjectList.filter(
                          (s) => s !== subject
                        );
                        setSubjectList(updated);
                        setValue("subjects", updated);
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>

              {errors.subjects && (
                <p className="text-red-500 text-sm">
                  {errors.subjects.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#F59E0B] text-white py-3 font-bold text-lg rounded-xl hover:bg-[#d97706] transition disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Add Student"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;
