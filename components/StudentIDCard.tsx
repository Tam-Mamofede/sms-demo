import { useRef } from "react";
import { useStudent } from "../src/context/StudentContext";

const StudentIDCard = () => {
  const { currentStudent } = useStudent();
  const cardRef = useRef<HTMLDivElement>(null);

  if (!currentStudent) {
    return <p className="text-center text-gray-500">No student selected</p>;
  }

  return (
    <div className=" flex flex-col items-center justify-center p-4">
      <div
        ref={cardRef}
        className="w-80 bg-white shadow-lg rounded-xl border border-gray-300 p-4 text-center relative"
      >
        {/* Profile Picture */}
        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-blue-500">
          <img
            src={currentStudent.pfp || "https://via.placeholder.com/100"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Student Info */}
        <h2 className="text-xl font-bold mt-2">
          {currentStudent.firstName} {currentStudent.lastName}
        </h2>
        <p className="text-gray-600 text-sm">Class: {currentStudent.class}</p>
        <p className="text-gray-600 text-sm">
          ID: {currentStudent.studentId || "N/A"}
        </p>

        <div className="mt-4 border-t border-gray-300 pt-2 text-xs text-gray-500">
          <p>DOB: {currentStudent.dateOfBirth}</p>
          <p>Phone: {currentStudent.phoneNumber}</p>
          <p>Guardian: {currentStudent.guardianName}</p>
        </div>
      </div>
      {/* Print Button */}
      {/* set up proper print function */}
      {/* <button
        onClick={handlePrint}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Print ID Card
      </button> */}
    </div>
  );
};

export default StudentIDCard;
