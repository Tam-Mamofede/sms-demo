import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase.config";
import { useAlert } from "../../src/context/AlertContext";
import Loader from "../Loader";

type Props = {
  staffId: string;
};

export default function EditStaffPayroll({ staffId }: Props) {
  const { showAlert } = useAlert();

  const [bonuses, setBonuses] = useState("");
  const [allowances, setAllowances] = useState("");
  const [deductions, setDeductions] = useState("");
  const [baseSalary, setBaseSalary] = useState(0);

  const [initialValues, setInitialValues] = useState({
    bonuses: "0",
    allowances: "0",
    deductions: "0",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPayrollFields = async () => {
      try {
        const docRef = doc(db, "staff", staffId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const b = String(data.bonuses ?? 0);
          const a = String(data.allowances ?? 0);
          const d = String(data.deductions ?? 0);

          setBonuses(b);
          setAllowances(a);
          setDeductions(d);
          setBaseSalary(data.baseSalary || 0);

          setInitialValues({ bonuses: b, allowances: a, deductions: d });
        }
      } catch (err) {
        console.error("Error fetching staff payroll fields", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollFields();
  }, [staffId]);

  const hasChanges =
    bonuses !== initialValues.bonuses ||
    allowances !== initialValues.allowances ||
    deductions !== initialValues.deductions;

  const netPay =
    baseSalary +
    (parseFloat(allowances) || 0) +
    (parseFloat(bonuses) || 0) -
    (parseFloat(deductions) || 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      const ref = doc(db, "staff", staffId);
      await updateDoc(ref, {
        bonuses: parseFloat(bonuses),
        allowances: parseFloat(allowances),
        deductions: parseFloat(deductions),
      });
      showAlert("Payroll values updated", "success");

      // Update initial values so Save button hides again
      setInitialValues({ bonuses, allowances, deductions });
    } catch (err) {
      console.error(err);
      showAlert("Failed to update payroll values", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Loader />
      </div>
    );

  return (
    <div className="mt-10 bg-white p-8 rounded-2xl shadow-md max-w-lg mx-auto border border-amber-200 space-y-6">
      <h3 className="text-2xl font-bold text-[#065F46]">
        Adjust Payroll Details
      </h3>

      {/* Bonuses */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-[#78350F]">
          Bonuses (₦)
        </label>
        <input
          type="number"
          value={bonuses}
          onChange={(e) => setBonuses(e.target.value)}
          placeholder="Enter bonuses"
          className="w-full px-4 py-2 border rounded-lg bg-[#FFFBF0] focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Allowances */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-[#78350F]">
          Allowances (₦)
        </label>
        <input
          type="number"
          value={allowances}
          onChange={(e) => setAllowances(e.target.value)}
          placeholder="Enter allowances"
          className="w-full px-4 py-2 border rounded-lg bg-[#FFFBF0] focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Deductions */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-[#78350F]">
          Deductions (₦)
        </label>
        <input
          type="number"
          value={deductions}
          onChange={(e) => setDeductions(e.target.value)}
          placeholder="Enter deductions"
          className="w-full px-4 py-2 border rounded-lg bg-[#FFFBF0] focus:outline-none focus:ring-2 focus:ring-red-300"
        />
      </div>

      {/* Payroll Summary */}
      <div className="pt-4 text-sm text-gray-800">
        <p className="mb-1">
          Base Salary:{" "}
          <span className="font-semibold">₦{baseSalary.toLocaleString()}</span>
        </p>
        <p className="text-lg font-bold">Net Pay: ₦{netPay.toLocaleString()}</p>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
        >
          {saving ? "Saving..." : "Save Payroll Changes"}
        </button>
      )}
    </div>
  );

  // return (
  //   <div className="mt-8 p-6 border rounded-lg bg-gray-50 max-w-md mx-auto">
  //     <h3 className="text-lg font-bold mb-4">Adjust Payroll Details</h3>

  //     <label className="block mb-2 font-medium">Bonuses (₦)</label>
  //     <input
  //       type="number"
  //       value={bonuses}
  //       onChange={(e) => setBonuses(e.target.value)}
  //       className="w-full mb-4 p-2 border rounded"
  //     />

  //     <label className="block mb-2 font-medium">Allowances (₦)</label>
  //     <input
  //       type="number"
  //       value={allowances}
  //       onChange={(e) => setAllowances(e.target.value)}
  //       className="w-full mb-4 p-2 border rounded"
  //     />

  //     <label className="block mb-2 font-medium">Deductions (₦)</label>
  //     <input
  //       type="number"
  //       value={deductions}
  //       onChange={(e) => setDeductions(e.target.value)}
  //       className="w-full mb-4 p-2 border rounded"
  //     />

  //     <div className="mt-6 text-sm font-medium">
  //       <p>
  //         Base Salary:{" "}
  //         <span className="font-semibold">₦{baseSalary.toLocaleString()}</span>
  //       </p>
  //       <p>
  //         <strong>Net Pay Preview:</strong>{" "}
  //         <span className="text-lg font-bold">₦{netPay.toLocaleString()}</span>
  //       </p>
  //     </div>

  //     {hasChanges && (
  //       <button
  //         onClick={handleSave}
  //         disabled={saving}
  //         className="w-full mt-6 py-2 px-4 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-bold"
  //       >
  //         {saving ? "Saving..." : "Save Payroll Changes"}
  //       </button>
  //     )}
  //   </div>
  // );
}
