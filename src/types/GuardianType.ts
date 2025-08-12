import { StudentType } from "./StudentType";

type GuardianBase = Pick<
  StudentType,
  | "guardianName"
  | "guardianPhone"
  | "guardianEmail"
  | "guardianAddress"
  | "guardianWorkAddress"
  | "role"
  | "guardianId"
>;

export type GuardianType = GuardianBase & {
  studentIds: string[];
  id: string;
};
