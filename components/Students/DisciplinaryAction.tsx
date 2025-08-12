import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase.config";

const DisciplinaryAction = ({ incidentId, currentAction }) => {
  const [action, setAction] = useState(currentAction || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAction = async () => {
    setIsSaving(true);
    try {
      const incidentDocRef = doc(db, "behaviorIncidents", incidentId);
      await updateDoc(incidentDocRef, { actionTaken: action });
      console.log("Disciplinary action updated!");
    } catch (error) {
      console.error("Error updating action:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold">Manage Disciplinary Action</h3>
      <input
        type="text"
        value={action}
        onChange={(e) => setAction(e.target.value)}
        className="w-full p-2 border rounded-md"
        placeholder="Enter disciplinary action..."
      />
      <button
        onClick={handleSaveAction}
        disabled={isSaving}
        className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
      >
        {isSaving ? "Saving..." : "Save Action"}
      </button>
    </div>
  );
};

export default DisciplinaryAction;
