import { useEffect, useState } from "react";
import { db } from "../../firebase.config";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  startAfter,
} from "firebase/firestore";
import { Card, CardContent } from "../../src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import Loader from "../Loader";

type Submission = {
  id: string;
  studentId: string;
  studentName: string;
  assignmentTitle: string;
  fileUrl?: string;
  answer?: string;
};

type Props = {
  classId?: string;
  subjectName: string;
};

const PAGE_SIZE = 10; // Adjust this value to your preference

export default function SubmittedAssignmentsReview({
  subjectName,
  classId,
}: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState("__all__");
  const [lastVisible, setLastVisible] = useState<unknown>(null); // For storing the last document for pagination
  const [hasMore, setHasMore] = useState(true); // To check if there's more data to load

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!classId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const q = query(
        collection(db, "assignment_submissions"),
        where("subject", "==", subjectName),
        where("class", "==", classId),
        limit(PAGE_SIZE)
      );
      const snapshot = await getDocs(q);

      const list: Submission[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.studentId || !data.assignmentId) return;
        list.push({
          id: docSnap.id,
          studentId: data.studentId,
          studentName: data.studentName,
          assignmentTitle: data.assignmentTitle,
          answer: data.answer,
        });
      });

      setSubmissions(list);
      setFilteredSubmissions(list);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
      setLoading(false);
    };

    fetchSubmissions();
  }, [subjectName, classId]);

  const loadMore = async () => {
    if (!lastVisible || !hasMore) return;

    setLoading(true);

    const q = query(
      collection(db, "assignment_submissions"),
      where("subject", "==", subjectName),
      where("class", "==", classId),
      startAfter(lastVisible),
      limit(PAGE_SIZE)
    );

    const snapshot = await getDocs(q);

    const list: Submission[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.studentId || !data.assignmentId) return;
      list.push({
        id: docSnap.id,
        studentId: data.studentId,
        studentName: data.studentName,
        assignmentTitle: data.assignmentTitle,
        answer: data.answer,
      });
    });

    setSubmissions((prev) => [...prev, ...list]);
    setFilteredSubmissions((prev) => [...prev, ...list]);
    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    setHasMore(snapshot.docs.length === PAGE_SIZE);
    setLoading(false);
  };

  useEffect(() => {
    if (!subjectName || !classId) return;

    if (selectedAssignment === "__all__") {
      setFilteredSubmissions(submissions);
    } else {
      setFilteredSubmissions(
        submissions.filter((s) => s.assignmentTitle === selectedAssignment)
      );
    }
  }, [selectedAssignment, submissions]);

  const uniqueAssignmentTitles = Array.from(
    new Set(submissions.map((s) => s.assignmentTitle))
  );

  if (loading && submissions.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Loader />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <p className="p-6 text-gray-600 text-lg">
        No submissions for this subject yet.
      </p>
    );
  }

  return (
    <div className="bg-[#FFF7ED] text-[#065F46] p-6 rounded-lg">
      <h2 className="text-3xl font-bold mb-6">
        Submitted Assignments – {subjectName}
      </h2>

      <div className="max-w-xs mb-8">
        <Select
          value={selectedAssignment}
          onValueChange={setSelectedAssignment}
        >
          <SelectTrigger className="bg-white border text-[#78350F] font-medium">
            <SelectValue placeholder="Filter by Assignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Assignments</SelectItem>
            {uniqueAssignmentTitles.map((title) => (
              <SelectItem key={title} value={title}>
                {title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSubmissions.map((submission) => (
          <Card
            key={submission.id}
            className="bg-[#FDE68A] border-none shadow-md"
          >
            <CardContent className="p-4 space-y-2">
              <p className="font-semibold text-[#78350F]">
                👤 {submission.studentName}
              </p>
              <p className="text-sm italic text-[#78350F]">
                📘 {submission.assignmentTitle}
              </p>
              <div className="bg-white p-3 rounded-md text-sm text-gray-800 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {submission.answer ? (
                  submission.answer
                ) : (
                  <span className="italic text-gray-400">No submission</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          className="mt-6 px-4 py-2 bg-[#10B981] text-white rounded-md"
        >
          Load More
        </button>
      )}
    </div>
  );
}
