import { useEffect, useState } from "react";
import { useAuth } from "../../src/context/AuthContext";
import { db } from "../../firebase.config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import SubmitAssignment from "./SubmitAssignment";
import Loader from "../Loader";

type Assignment = {
  id: string;
  title: string;
  class: string;
  description: string;
  subject: string;
  dueDate: string;
  createdAt: string;
};

export default function MyAssignments() {
  const { guardianUser } = useAuth(); // student guardianUser

  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!guardianUser || guardianUser.role !== "Guardian") {
        setLoading(false);
        return;
      }

      const guardianRef = doc(db, "guardians", guardianUser.id);
      const guardianSnap = await getDoc(guardianRef);
      const studentIds = guardianSnap.data()?.studentIds || [];

      const assignments: Assignment[] = [];

      for (const studentId of studentIds) {
        const studentDoc = await getDoc(doc(db, "students", studentId));
        if (!studentDoc.exists()) continue;

        const student = studentDoc.data();
        const className = student.class;
        const subjects: string[] = student.subjects;

        // Get assignment submissions for this student
        const submissionsSnap = await getDocs(
          collection(db, "assignment_submissions")
        );
        const submittedAssignmentIds = submissionsSnap.docs
          .filter((doc) => doc.data().studentId === studentId)
          .map((doc) => doc.data().assignmentId);

        const assignmentsRef = collection(
          db,
          "classes",
          className,
          "assignments"
        );
        const q = query(assignmentsRef, orderBy("dueDate", "asc"));
        const snapshot = await getDocs(q);

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        snapshot.forEach((doc) => {
          const data = doc.data();
          const dueDate = data.dueDate?.toDate();
          if (!dueDate || dueDate < now) return;
          if (!subjects.includes(data.subject)) return;
          if (submittedAssignmentIds.includes(doc.id)) return;

          assignments.push({
            id: doc.id,
            class: data.class,
            title: data.title,
            description: data.description,
            subject: data.subject,
            dueDate: dueDate.toDateString(),
            createdAt: data.createdAt?.toDate().toDateString(),
          });
        });
      }

      setAssignments(assignments);
      setLoading(false);
    };

    fetchAssignments();
  }, [guardianUser]);

  return (
    <>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-full w-full">
            <Loader />
          </div>
        ) : assignments.length === 0 ? (
          <p>No assignments found.</p>
        ) : (
          <ul className="space-y-4">
            {assignments.map((a) => (
              <li
                key={a.id}
                onClick={() => setSelectedAssignment(a)}
                className="border p-3 rounded shadow"
              >
                <h2 className="font-bold text-lg">{a.title}</h2>
                <p className="text-sm text-gray-600">{a.subject}</p>
                <p className="my-2">{a.description}</p>
                <p className="text-sm text-right">
                  Due: <span className="font-medium">{a.dueDate}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedAssignment && (
        <SubmitAssignment
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
        />
      )}
    </>
  );
}
