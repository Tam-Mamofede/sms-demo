export type StudentAttendanceType = {
  [studentId: string]: {
    firstName: string;
    lastName: string;
    // present: "yes" | "no";
    present: {
      firstName: string;
      lastName: string;
      present: "yes" | "no";
      timestamp: number;
    };

    timestamp?: number;
  };
};
