import { useState } from "react";
import {
  doc,
  setDoc,
  collection,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../firebase.config";
import { Input } from "../../src/components/ui/input";
import { Button } from "../../src/components/ui/button";
import { useAuth } from "../../src/context/AuthContext";
import { useAlert } from "../../src/context/AlertContext";

type Props = {
  guardianId: string;
  onSuccess: () => void;
};

export default function AddStudentToGuardianForm({
  guardianId,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    class: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    phoneNumber: "",
    address: "",
    subjects: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");

  const { curGuardian } = useAuth();
  const { showAlert } = useAlert();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newStudentRef = doc(collection(db, "students"));
      const studentId = newStudentRef.id;

      const studentData = {
        ...form,
        id: studentId,
        guardianId,
        guardianName: curGuardian?.guardianName,
        guardianEmail: curGuardian?.guardianEmail,
        guardianPhone: curGuardian?.guardianPhone,
      };

      // 1. Add to /students
      await setDoc(newStudentRef, studentData);

      // 2. Add to /classes/{classId}/students
      const classStudentRef = doc(
        db,
        "classes",
        form.class,
        "students",
        studentId
      );
      await setDoc(classStudentRef, studentData);

      // 3. Update guardian's studentIds
      await updateDoc(doc(db, "guardians", guardianId), {
        studentIds: arrayUnion(studentId),
      });

      onSuccess();
      setForm({
        firstName: "",
        lastName: "",
        class: "",
        dateOfBirth: "",
        gender: "",
        nationality: "",
        phoneNumber: "",
        address: "",
        subjects: [],
      });

      showAlert("Student added and linked!", "success");
    } catch (error) {
      console.error("Error adding student:", error);
      showAlert("Failed to add student.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-amber-100 p-6 rounded-xl shadow space-y-4 w-full"
    >
      <h3 className="text-xl font-bold text-[#78350F]">Add New Student</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className="border-stone-700"
          required
        />
        <Input
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className="border-stone-700"
          required
        />
        <Input
          type="date"
          name="dateOfBirth"
          className="border-stone-700"
          value={form.dateOfBirth}
          onChange={handleChange}
          required
        />
        <select
          name="class"
          value={form.class}
          onChange={handleChange}
          required
          className="border rounded p-2 border-stone-700"
        >
          <option value="">Select Class</option>
          {[
            "Primary 1",
            "Primary 2",
            "Primary 3",
            "Primary 4",
            "Primary 5",
            "Primary 6",
            "JSS 1",
            "JSS 2",
            "JSS 3",
            "SS 1",
            "SS 2",
            "SS 3",
          ].map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>
      {/* Gender & Nationality */}
      <select
        name="gender"
        value={form.gender}
        onChange={handleChange}
        className="border-stone-700 border rounded p-2"
        required
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      <Input
        name="nationality"
        value={form.nationality}
        onChange={handleChange}
        placeholder="Nationality"
        className="border-stone-700"
        required
      />
      {/* /* Phone Number & Address  */}
      <Input
        name="phoneNumber"
        value={form.phoneNumber}
        onChange={handleChange}
        placeholder="Phone Number"
        className="border-stone-700"
        required
      />
      <Input
        name="address"
        value={form.address}
        onChange={handleChange}
        placeholder="Home Address"
        className="border-stone-700"
        required
      />
      {/* Subjects */}
      <label className="font-semibold">Subjects</label>
      <div className="flex gap-2 mb-2 border-stone-700">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border-stone-700 border rounded p-2 flex-1"
        >
          <option value="">Select Subject</option>
          {[
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
          ]
            .filter((subj) => !form.subjects.includes(subj))
            .map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
        </select>
        <Button
          type="button"
          onClick={() => {
            if (selectedSubject) {
              setForm((prev) => ({
                ...prev,
                subjects: [...prev.subjects, selectedSubject],
              }));
              setSelectedSubject("");
            }
          }}
          className="bg-[#10B981] text-white"
        >
          Add
        </Button>
      </div>
      <ul className="space-y-1">
        {form.subjects.map((subject) => (
          <li
            key={subject}
            className="flex justify-between bg-[#f5c573] px-2 py-2 rounded-xl"
          >
            <span>{subject}</span>
            <button
              type="button"
              className="text-red-700"
              onClick={() => {
                setForm((prev) => ({
                  ...prev,
                  subjects: prev.subjects.filter((s) => s !== subject),
                }));
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <Button
        type="submit"
        disabled={loading}
        className="bg-[#065F46] text-white hover:bg-[#059669] w-full"
      >
        {loading ? "Adding..." : "Add Student"}
      </Button>
    </form>
  );
}
