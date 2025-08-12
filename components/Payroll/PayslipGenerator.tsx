import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { PayrollRecord } from "../../src/types/PayrollType";

type Props = {
  record: PayrollRecord;
};

export default function PayslipGenerator({ record }: Props) {
  const slipRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!slipRef.current) return;
    const canvas = await html2canvas(slipRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Payslip_${record.name.replace(/\s/g, "_")}.pdf`);
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div
        ref={slipRef}
        style={{
          width: "700px",
          margin: "0 auto",
          background: "#ffffff",
          color: "#000000",
          border: "1px solid #000",
          fontFamily: "Arial, sans-serif",
          padding: "24px",
          position: "relative",
        }}
      >
        {/* Watermark */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "72px",
            fontWeight: 800,
            color: "#000000",
            opacity: 0.05,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          Evergreen Academy
        </div>

        <div style={{ position: "relative", zIndex: 10 }}>
          <div
            style={{
              textAlign: "center",
              borderBottom: "1px solid #000",
              paddingBottom: "10px",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              Salary Payslip
            </h2>
            <p style={{ fontSize: "14px" }}>
              Month: {record.generatedAt.toDate().toLocaleDateString()}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              fontSize: "14px",
              marginBottom: "20px",
            }}
          >
            <div>
              <strong>Name:</strong> {record.name}
            </div>
            <div>
              <strong>Role:</strong> {record.role}
            </div>
            <div>
              <strong>Status:</strong> {record.paid ? "Paid" : "Not Paid"}
            </div>
            {record.paidAt && (
              <div>
                <strong>Paid At:</strong>{" "}
                {record.paidAt.toDate().toLocaleDateString()}
              </div>
            )}
          </div>

          <div
            style={{
              borderTop: "1px solid #000",
              borderBottom: "1px solid #000",
              padding: "12px 0",
              fontSize: "14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Base Salary:</span>
              <span>₦{record.baseSalary.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Allowances:</span>
              <span>₦{record.allowances.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Bonuses:</span>
              <span>₦{record.bonuses.toLocaleString()}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px dashed #000",
                paddingTop: "10px",
                marginTop: "10px",
                fontWeight: "bold",
              }}
            >
              <span>Total Earnings:</span>
              <span>
                ₦
                {(
                  record.baseSalary +
                  record.allowances +
                  record.bonuses
                ).toLocaleString()}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Deductions:</span>
              <span>-₦{record.deductions.toLocaleString()}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid #000",
                paddingTop: "10px",
                marginTop: "10px",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              <span>Net Pay:</span>
              <span>₦{record.netPay.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ marginTop: "48px" }}>
            <p style={{ marginBottom: "8px" }}>_____________________________</p>
            <p>
              <strong>Proprietor's Signature</strong>
            </p>
          </div>

          <p
            style={{ textAlign: "right", fontSize: "10px", marginTop: "24px" }}
          >
            Generated by School Management System
          </p>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "16px" }}>
        <button
          onClick={handleDownload}
          style={{
            background: "#000000",
            color: "#ffffff",
            fontWeight: "bold",
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Download Payslip
        </button>
      </div>
    </div>
  );
}
