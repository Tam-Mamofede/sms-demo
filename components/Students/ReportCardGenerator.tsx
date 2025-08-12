import { useRef, useState, useEffect } from "react";
import { db } from "../../firebase.config";
import { collection, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type ScoreType = {
  type: string;
  score: number;
  maxScore: number;
};

type GradeEntry = {
  scores: ScoreType[];
  totalScore: number;
  maxTotal: number;
  percentage: number;
  grade: string;
  term: string;
};

type Props = {
  studentId: string;
  classId: string;
  firstName: string;
  lastName: string;
  term: string;
  teacherComment: string;
  teacherName?: string;
};

export default function ReportCardGenerator({
  studentId,
  classId,
  firstName,
  lastName,
  term,
  teacherComment,
  teacherName,
}: Props) {
  const [grades, setGrades] = useState<{ [subject: string]: GradeEntry }>({});
  const [loading, setLoading] = useState(true);
  const componentRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!componentRef.current) return;
    try {
      setLoading(true);
      const canvas = await html2canvas(componentRef.current, {
        useCORS: true,
        backgroundColor: "#ffffff",
        scale: 2,
        onclone: (documentClone) => {
          const printable = documentClone.querySelector(".report-card");
          if (printable) {
            printable.setAttribute(
              "style",
              `
            filter: grayscale(100%) !important;
            color: black !important;
            background: white !important;
            height: 1122px !important; /* full A4 height at 96dpi */
            width: 794px !important;   /* full A4 width at 96dpi */
            padding: 40px;
            box-sizing: border-box;
          `
            );
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = 210;
      const pdfHeight = 297;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${firstName}-${lastName}-ReportCard.pdf`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchGrades = async () => {
      setLoading(true);
      try {
        const gradesRef = collection(
          db,
          "classes",
          classId,
          "students",
          studentId,
          "grades"
        );
        const gradeSnap = await getDocs(gradesRef);

        const subjectGrades: { [subject: string]: GradeEntry } = {};
        gradeSnap.docs.forEach((doc) => {
          subjectGrades[doc.id] = doc.data() as GradeEntry;
        });

        setGrades(subjectGrades);
      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [studentId, classId]);

  return (
    <div className="mt-10 bg-[#FFF7ED] border border-[#FDE68A] rounded-3xl shadow-xl p-8">
      {/* Download Button */}
      <div className="flex justify-end">
        <button
          onClick={generatePDF}
          className="mb-6 px-6 py-2 rounded-full text-white bg-[#10B981] hover:bg-[#059669] transition"
        >
          {loading ? "Downloading..." : "Download Report Card"}
        </button>
      </div>

      <div
        ref={componentRef}
        className="report-card p-6 border border-[#78350F] text-black bg-white space-y-6 rounded-xl"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-[#065F46] mb-6">
            Evergreen International School
          </h1>
          <p className="text-sm italic text-[#78350F]">
            Excellence in Learning and Character
          </p>
          <p className="text-xs mt-1 text-[#78350F] font-medium uppercase tracking-wide">
            Academic Report Card
          </p>
        </div>

        {/* Student Info */}
        <div className="text-sm space-y-2 bg-[#FDE68A] p-4 rounded-lg border border-[#F59E0B]">
          <p>
            <strong>Student:</strong> {firstName} {lastName}
          </p>
          <p>
            <strong>Class:</strong> {classId}
          </p>
          <p>
            <strong>Term:</strong> {term}
          </p>
        </div>

        {/* Grades Table */}
        {Object.keys(grades).length === 0 ? (
          <p className="text-center text-[#78350F] italic">
            No grades available for this student.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-black mt-4 rounded-md overflow-hidden">
              <thead className="bg-[#F59E0B] text-white">
                <tr>
                  <th className="border p-2">Subject</th>
                  <th className="border p-2">Total</th>
                  <th className="border p-2">%</th>
                  <th className="border p-2">Grade</th>
                  <th className="border p-2">Term</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grades).map(([subject, grade], idx) => (
                  <tr
                    key={subject}
                    className={idx % 2 === 0 ? "bg-white" : "bg-[#FFF7ED]"}
                  >
                    <td className="border p-2">{subject}</td>
                    <td className="border p-2">
                      {grade.totalScore} / {grade.maxTotal}
                    </td>
                    <td className="border p-2">
                      {grade.percentage.toFixed(1)}%
                    </td>
                    <td className="border p-2">{grade.grade}</td>
                    <td className="border p-2">{grade.term}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Remarks */}
        <div className="text-sm mt-6 space-y-4">
          <div>
            <h3 className="font-semibold text-[#065F46] mb-4">
              Teacher's Remarks
            </h3>
            <p className="border border-[#F59E0B] bg-[#FFF7ED] rounded-lg p-3 italic">
              {teacherComment}
            </p>
          </div>

          {teacherName && (
            <p className="text-right font-medium text-[#78350F]">
              {teacherName}, Form Teacher
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-center italic text-[#78350F]">
          Generated on {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
