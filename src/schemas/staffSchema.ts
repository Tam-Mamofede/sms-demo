import * as yup from "yup";

export const staffSchema = yup.object({
  password: yup.string().min(4).max(20).required(),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords Don't Match")
    .required(),
  lastName: yup.string().required("Last name is required"),
  firstName: yup.string().required("First name is required"),
  pfp: yup.mixed().optional(),
  dateOfBirth: yup.string().required("Date of Birth is required"),
  gender: yup
    .string()
    .oneOf(["Male", "Female", "Other"], "Invalid gender")
    .required(),
  nationality: yup.string().required("Nationality is required"),

  email: yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: yup.string().required("Phone number is required"),
  address: yup.string().optional(),

  employeeId: yup.string().optional(),
  dateOfEmployment: yup.string().optional(),
  employmentType: yup
    .string()
    .oneOf(["Full-time", "Part-time", "Contract"], "Invalid type")
    .optional(),
  baseSalary: yup.number().optional(),
  bonuses: yup.number().optional(),
  deductions: yup.number().optional(),
  allowances: yup.number().optional(),
  highestDegree: yup.string().optional(),
  certifications: yup.array().of(yup.string()).optional(),

  workExperiences: yup.array().of(
    yup.object().shape({
      years: yup.number().min(0, "Years must be positive").optional(),
      title: yup.string().optional(),
      location: yup.string().optional(),
    })
  ),
  formTeacherClass: yup.string().optional(),
  subjectAssignments: yup
    .array()
    .of(
      yup.object().shape({
        subject: yup.string().optional(),
        class: yup.string().optional(),
      })
    )
    .optional(),

  role: yup
    .string()
    .oneOf(
      [
        "IT",
        "SubjectTeacher",
        "HOD",
        "Librarian",
        "FormTeacher",
        "Proprietor",
        "Guardian",
        "Receptionist",
        "Accountant",
      ],
      "Invalid role"
    )
    .required(),
  accountStatus: yup
    .string()
    .oneOf(["Active", "Suspended", "Retired"], "Invalid status")
    .optional(),
});

export type staffFormData = yup.InferType<typeof staffSchema>;
