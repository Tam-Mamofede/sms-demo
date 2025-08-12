import GeneratePayroll from "../components/Payroll/GeneratePayroll";
import PayrollSummary from "../components/Payroll/PayrollSummary";
import Navbar from "../components/NavBar";

export default function Payroll() {
  return (
    <div>
      <Navbar />
      <div className="mt-26">
        <GeneratePayroll />
        <PayrollSummary />
      </div>
    </div>
  );
}
