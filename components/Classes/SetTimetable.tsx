// TimetableEditor.tsx
import { useEffect, useState } from "react";
import { db } from "../../firebase.config";
import { useAuth } from "../../src/context/AuthContext";
import { doc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";

import WeeklySubjectView from "./WeeklySubjectView";
import { useAlert } from "../../src/context/AlertContext";

interface Slot {
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
}

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday"];

const SetTimeTable = ({ classId }: { classId: string }) => {
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [userSub, setUserSub] = useState("");
  const [selectedDay, setSelectedDay] = useState("monday");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [newSlot, setNewSlot] = useState<Slot>({
    startTime: "",
    endTime: "",
    subjectId: "",
    teacherId: user?.staffId || "",
  });
  const [subjectName, setSubjectName] = useState<string>("");
  //////////////////////////////
  useEffect(() => {
    if (!user || !classId) return;

    const match = user.subjectAssignments.find(
      (assign) => assign.class === classId
    );

    if (match) {
      setSubjectName(match.subject);
      setNewSlot((prev) => ({
        ...prev,
        subjectId: match.subject,
      }));
    }
  }, [classId, user]);
  ///////////////////////////////////

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "classes", classId, "timetable", selectedDay),
      (docSnap) => {
        if (docSnap.exists()) {
          setSlots(docSnap.data().slots || []);
        } else {
          setSlots([]);
        }
      }
    );
    return () => unsub();
  }, [classId, selectedDay]);

  //////////////////////////////////////

  const setSub = () => {
    user?.subjectAssignments?.some((sa) => {
      setUserSub(sa.subject);
    });
  };

  const handleAddSlot = async () => {
    if (
      !user?.subjectAssignments?.some((sa) => sa.subject === newSlot.subjectId)
    ) {
      showAlert("You can't assign a subject you don't teach.", "warning");
      return;
    }

    // Check for overlapping time slots
    const newStart = newSlot.startTime;
    const newEnd = newSlot.endTime;

    const overlaps = slots.some((slot) => {
      return (
        (newStart >= slot.startTime && newStart < slot.endTime) ||
        (newEnd > slot.startTime && newEnd <= slot.endTime) ||
        (newStart <= slot.startTime && newEnd >= slot.endTime)
      );
    });

    if (overlaps) {
      showAlert(
        "A slot already exists for this time. Please pick another time.",
        "warning"
      );
      return;
    }
    setSub();

    const updatedSlots = [...slots, newSlot];
    const ref = doc(db, "classes", classId, "timetable", selectedDay);
    await setDoc(ref, { slots: updatedSlots });
    setNewSlot({
      startTime: "",
      endTime: "",
      subjectId: userSub,
      teacherId: user?.staffId,
    });
  };

  /////////////////////////////////

  const handleDeleteSlot = async (index: number) => {
    const updatedSlots = slots.filter((_, i) => i !== index);
    const ref = doc(db, "classes", classId, "timetable", selectedDay);
    await updateDoc(ref, { slots: updatedSlots });
  };

  const hasConflict = slots.some((slot) => {
    return (
      (newSlot.startTime >= slot.startTime &&
        newSlot.startTime < slot.endTime) ||
      (newSlot.endTime > slot.startTime && newSlot.endTime <= slot.endTime) ||
      (newSlot.startTime <= slot.startTime && newSlot.endTime >= slot.endTime)
    );
  });

  return (
    <>
      <WeeklySubjectView classId={classId} subjectId={subjectName} />

      <div className="p-6 mt-8 bg-white rounded-2xl shadow border border-[#FDE68A]">
        <h2 className="text-xl font-bold text-[#065F46] mb-4 text-center">
          🕒 Timetable for {selectedDay.toUpperCase()}
        </h2>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <select
            className="w-full sm:w-1/3 p-2 rounded-lg border border-emerald-300 focus:ring-2 focus:ring-[#10B981]"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* New Slot Form */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <input
            type="time"
            value={newSlot.startTime}
            onChange={(e) =>
              setNewSlot({ ...newSlot, startTime: e.target.value })
            }
            className="p-2 border rounded-lg"
          />
          <input
            type="time"
            value={newSlot.endTime}
            onChange={(e) =>
              setNewSlot({ ...newSlot, endTime: e.target.value })
            }
            className="p-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Subject ID"
            value={newSlot.subjectId}
            onChange={(e) =>
              setNewSlot({ ...newSlot, subjectId: e.target.value })
            }
            className="p-2 border rounded-lg"
          />
          <button
            onClick={handleAddSlot}
            disabled={hasConflict}
            className={`px-4 py-2 rounded-lg text-white font-semibold transition ${
              hasConflict
                ? "bg-red-300 cursor-not-allowed"
                : "bg-[#10B981] hover:bg-[#059669]"
            }`}
          >
            Add Slot
          </button>
        </div>

        {/* Slot Table */}
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-[#FDE68A] text-[#78350F]">
            <tr>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-left">Teacher</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, index) => {
              const isConflict =
                (newSlot.startTime >= slot.startTime &&
                  newSlot.startTime < slot.endTime) ||
                (newSlot.endTime > slot.startTime &&
                  newSlot.endTime <= slot.endTime) ||
                (newSlot.startTime <= slot.startTime &&
                  newSlot.endTime >= slot.endTime);

              return (
                <tr
                  key={index}
                  className={`border-t ${
                    isConflict
                      ? "bg-red-100 text-red-700"
                      : "hover:bg-[#FFF7ED] transition"
                  }`}
                >
                  <td className="p-3">
                    {slot.startTime} - {slot.endTime}
                  </td>
                  <td className="p-3">{slot.subjectId}</td>
                  <td className="p-3">{slot.teacherId}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteSlot(index)}
                      className="text-red-500 hover:underline font-semibold"
                    >
                      Delete
                    </button>
                    {isConflict && (
                      <span className="ml-2 text-xs text-red-600 font-bold">
                        🚫 Conflict
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SetTimeTable;
