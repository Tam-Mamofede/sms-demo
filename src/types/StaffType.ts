// src/types/Teacher.ts
export interface StaffType {
  uid: string;
  staffId: string; // Unique ID for the staff member
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  pfp?: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  nationality: string;

  // contact
  email: string;
  phoneNumber: string;
  address?: string;

  // employment
  employeeId: string;
  classesAssigned: string[];
  dateOfEmployment: string;
  employmentType: "Full-time" | "Part-time" | "Contract";
  baseSalary?: number;
  bonuses?: number;
  deductions?: number;
  allowances?: number;
  // qualifications
  highestDegree: string;
  certifications?: string[];

  // work experience
  workExperiences: {
    years: number;
    title: string;
    location: string;
  }[];

  //classes
  formTeacherClass: string;
  subjectAssignments: { subject: string; class: string }[];
  // systemAccess
  role:
    | "IT"
    | "SubjectTeacher"
    | "FormTeacher"
    | "HOD"
    | "Proprietor"
    | "Guardian"
    | "Librarian"
    | "Receptionist"
    | "Accountant";
  accountStatus: "Active" | "Suspended" | "Retired" | "Vacation";

  // additionalInfo
  classSchedule?: Record<string, string[]>;
  performanceReviews?: string[]; // List of review IDs
  parentTeacherLogs?: string[]; // List of communication log IDs
  uploadedDocuments?: string[]; // URLs to documents
}
