import { useState, useEffect } from "react";
import { db } from "../firebase.config";
import {
  collection,
  query,
  onSnapshot,
  Timestamp,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import Navbar from "../components/NavBar";
import { Card, CardContent } from "../src/components/ui/card";

import { useAuth } from "../src/context/AuthContext";

// Define the Assignment type
interface Assignment {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  class: string;
  subject: string;
  createdAt: Timestamp;
  dueDate: Timestamp;
}

const DisplayAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<unknown>(null);
  const [hasMore, setHasMore] = useState(true); // Track if there are more assignments to load
  const { user } = useAuth();

  const fetchAssignments = (firstLoad = true) => {
    if (!selectedClass) return; // If no class is selected, do not query Firestore

    const assignmentsRef = collection(
      db,
      "classes",
      selectedClass, // Use the selected class for the query
      "assignments"
    );

    let q = query(assignmentsRef, orderBy("createdAt"), limit(5)); // Start by limiting to 5 results per page

    if (!firstLoad && lastVisible) {
      // For subsequent requests, use the lastVisible document to paginate
      q = query(
        assignmentsRef,
        orderBy("createdAt"),
        startAfter(lastVisible),
        limit(5)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setHasMore(false); // No more documents to load
          return;
        }

        const fetchedAssignments = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            description: data.description,
            createdBy: data.createdBy,
            class: data.class,
            subject: data.subject,
            createdAt: data.createdAt,
            dueDate: data.dueDate,
          };
        });

        setAssignments((prevAssignments) => [
          ...prevAssignments,
          ...fetchedAssignments,
        ]);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]); // Set last document for pagination
        setLoading(false); // Stop loading once data is fetched
      },
      (err) => {
        console.error("Error fetching assignments: ", err);
        setError("Failed to load assignments.");
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener when component unmounts
  };

  const subjectClasses = user?.subjectAssignments || [];

  // Only set error if no class is selected after the user has interacted
  useEffect(() => {
    if (selectedClass === "") {
      setError("No class selected.");
    } else {
      setError(null);
      fetchAssignments();
    }

    return () => setAssignments([]);
  }, [selectedClass]);

  const handleLoadMore = () => {
    if (hasMore) {
      fetchAssignments(false);
    }
  };

  return (
    <div className=" bg-[#FFF7ED]">
      <Navbar />
      <div className="max-w-2xl mx-auto pb-10 px-6 mt-20">
        {/* Class selection dropdown */}
        <select
          onChange={(e) => setSelectedClass(e.target.value)}
          value={selectedClass}
          className="border border-emerald-700 text-[#065F46] rounded-2xl py-2 px-3 mb-4"
        >
          <option value="">Select a class</option>
          {subjectClasses.map((sc, i) => (
            <option key={i} value={sc.class}>
              {sc.class} - {sc.subject} {/* Display both class and subject */}
            </option>
          ))}
        </select>

        {/* Display assignments */}
        <Card className="bg-[#FDE68A] border-none shadow-xl rounded-2xl">
          <CardContent className="p-8 space-y-6">
            <h1 className="text-3xl font-bold text-[#065F46]">Assignments</h1>
            {loading ? (
              <div className="text-[#065F46] flex justify-center items-center h-full w-full">
                Select a class
              </div>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <div className="space-y-4">
                {assignments.length > 0 ? (
                  assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="bg-white p-4 rounded-lg shadow-md"
                    >
                      <h3 className="text-xl font-semibold">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {assignment.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        Due Date:{" "}
                        {assignment.dueDate.toDate().toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No assignments.</p>
                )}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && !loading && (
              <div className="flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="bg-[#10B981] text-white py-2 px-4 rounded-lg"
                >
                  Load More
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DisplayAssignments;
