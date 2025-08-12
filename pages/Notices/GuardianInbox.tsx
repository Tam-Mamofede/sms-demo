import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase.config";
import { useAuth } from "../../src/context/AuthContext";
import Loader from "../../components/Loader";

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  senderName?: string;
}

export default function GuardianInbox() {
  const { guardianUser } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guardianUser) return;

    const q = query(
      collection(db, "guardians", guardianUser.id, "notices"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        ...(doc.data() as Omit<Notice, "id">),
        id: doc.id,
      }));
      setNotices(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [guardianUser]);

  if (!guardianUser) {
    return (
      <p className="text-center mt-10 text-red-500">Guardian not logged in.</p>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Loader />
      </div>
    );
  }

  if (notices.length === 0) {
    return <p className="text-center mt-10 text-gray-500">No notices yet.</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">📬 Guardian Inbox</h2>
      <div className="space-y-4">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="bg-white shadow rounded-lg p-4 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">{notice.title}</h3>
              <span className="text-sm text-gray-500">
                {notice.createdAt.toDate().toLocaleString()}
              </span>
            </div>
            <p className="text-gray-700">{notice.content}</p>
            {notice.senderName && (
              <p className="text-right mt-2 text-sm text-gray-500 italic">
                — {notice.senderName}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
