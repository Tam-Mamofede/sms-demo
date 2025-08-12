export interface StudentType {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "Male" | "Female";
  nationality: string;
  pfp: string;
  studentId: string;
  id: string;

  phoneNumber: string;
  address: string;
  class: string;
  subjects: string[];

  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianAddress: string;
  guardianWorkAddress: string;
  role: string;
  guardianId: string;
  status: "Active" | "Expelled" | "Transferred" | "Withdrawn";
}
