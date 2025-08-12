export type EvaluationType = {
  id: string; // doc id
  evaluatorId: string; // the Proprietor's UID
  evaluatorName: string;
  date: string; // ISO string
  overallScore: number;
  strengths: string;
  weaknesses: string;
  recommendations: string;
};
