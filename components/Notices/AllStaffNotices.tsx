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

type Notice = {
  id: string;
  title: string;
  content: string;
};

export default function AllStaffNotices() {
  const { user } = useAuth(); // assuming user contains staff info

  const [notice, setNotice] = useState<Notice | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fetchStaffNotices = async () => {
      if (!user || !user.role) return;

      try {
        const now = Timestamp.now();

        const q = query(
          collection(db, "notices"),
          where("role", "==", "staff"),
          where("startDate", "<=", now),
          where("endDate", ">=", now),
          where("targetRoles", "array-contains", user.role)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const first = snapshot.docs[0].data();
          setNotice({
            id: snapshot.docs[0].id,
            title: first.title,
            content: first.content,
          });

          setShow(true);
          setTimeout(() => setShow(false), 20000); // Hide after 20s
        } else {
          console.warn("🚨 No staff notices found for role:", user.role);
        }
      } catch (error) {
        console.error("Error fetching staff notices:", error);
      }
    };

    fetchStaffNotices();
  }, [user]);

  if (!notice || !show) return null;

  return (
    <div className="bg-green-200 text-black p-4 rounded shadow-md fixed top-4 right-4 z-50 w-[300px]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">{notice.title}</h3>
        <h3
          className="font-bold text-xl hover:cursor-pointer"
          onClick={() => setShow(false)}
        >
          ×
        </h3>
      </div>
      <p>{notice.content}</p>
    </div>
  );
}
