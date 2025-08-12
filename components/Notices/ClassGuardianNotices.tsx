import { useEffect, useState } from "react";
import { db } from "../../firebase.config";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "../../src/context/AuthContext";
import { useStudent } from "../../src/context/StudentContext";

type Notice = {
  id: string;
  title: string;
  content: string;
  className: string;
};

export default function ClassGuardianNotices() {
  const { guardianUser } = useAuth();
  const { students } = useStudent();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fetchNotice = async () => {
      if (!guardianUser || students.length === 0) return;

      try {
        // Get guardian Firestore document
        const guardianSnap = await getDocs(collection(db, "guardians"));
        const guardianData = guardianSnap.docs
          .find((doc) => doc.id === guardianUser.id)
          ?.data();

        const studentIds: string[] = guardianData?.studentIds || [];

        // Get list of the guardian’s students from global state
        const guardianStudents = students.filter((student) =>
          studentIds.includes(student.id)
        );

        // Extract their class names
        const classes: string[] = [
          ...new Set(guardianStudents.map((student) => student.class.trim())),
        ];

        if (!classes.length) return; // nothing to show

        const now = Timestamp.now();

        const noticeFetches = classes.map(async (className) => {
          const classRef = collection(db, "classes", className, "notices");

          const q = query(
            classRef,
            where("role", "==", "Guardian"),
            where("startDate", "<=", now),
            where("endDate", ">=", now)
          );

          const snapshot = await getDocs(q);

          return snapshot.docs.map((doc) => ({
            ...(doc.data() as Omit<Notice, "id" | "className">),
            id: doc.id,
            className,
          }));
        });

        const allNotices = (await Promise.all(noticeFetches)).flat();

        if (allNotices.length > 0) {
          setNotices(allNotices);
          setShow(true);
          setTimeout(() => setShow(false), 20000);
          // Query relevant notices
          // const q = query(
          //   collection(db, "notices"),
          //   where("role", "==", "Guardian"),
          //   where("targetClass", "in", classes),
          //   where("startDate", "<=", now),
          //   where("endDate", ">=", now)
          // );

          // const snapshot = await getDocs(q);

          // if (!snapshot.empty) {
          //   console.log(
          //     "🔥 Notices fetched:",
          //     snapshot.docs.map((d) => d.data())
          //   );
          //   const firstNotice = snapshot.docs[0].data();
          //   setNotice({
          //     id: snapshot.docs[0].id,
          //     title: firstNotice.title,
          //     content: firstNotice.content,
          //   });

          //   setShow(true);
          //   setTimeout(() => setShow(false), 20000); // Hide notice after 10s
        } else {
          console.warn("🚨 No guardian notices found for classes:", classes);
        }
      } catch (error) {
        console.error("Error fetching guardian notice:", error);
      }
    };

    fetchNotice();
  }, [guardianUser, students]);

  if (!notices || !show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-[350px] space-y-4">
      {notices.map((notice) => (
        <div
          key={notice.id}
          className="bg-yellow-200 text-black p-4 rounded shadow-md"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">{notice.title}</h3>
            <button
              onClick={() => {
                setNotices((prev) => prev?.filter((n) => n.id !== notice.id));
              }}
              className="font-bold text-xl"
            >
              ×
            </button>
          </div>
          <p className="text-sm mb-1">{notice.content}</p>
          <p className="text-xs text-gray-700 italic">
            Class: {notice.className}
          </p>
        </div>
      ))}
    </div>
    // <div className="bg-yellow-200 text-black p-4 rounded shadow-md fixed top-4 right-4 z-50 w-[300px]">
    //   <div className="flex justify-between items-center mb-2">
    //     <h3 className="font-bold text-lg">{notice.title}</h3>
    //     <h3
    //       className="font-bold text-xl hover:cursor-pointer"
    //       onClick={() => {
    //         setShow(false);
    //       }}
    //     >
    //       X
    //     </h3>
    //   </div>
    //   <p>{notice.content}</p>
    // </div>
  );
}
