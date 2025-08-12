import * as yup from "yup";

export const studentSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  dateOfBirth: yup.string().required("Date of Birth is required"),
  gender: yup.string().oneOf(["Male", "Female"], "Invalid gender").required(),
  nationality: yup.string().required("Nationality is required"),
  pfp: yup.string().optional(),

  phoneNumber: yup.string().optional(),
  address: yup.string().required("Address is required"),
  class: yup.string().required("Class is required"),
  subjects: yup.array().of(yup.string()).min(1, "Select at least one subject"),

  guardianEmail: yup.string().email("Invalid email").required(),
  guardianName: yup.string().required("Guardian name is required"),
  guardianPhone: yup.string().required("Guardian phone number is required"),
  guardianAddress: yup.string().required("Guardian address is required"),
  guardianWorkAddress: yup
    .string()
    .required("Guardian work address is required"),
});
export type StudentFormData = yup.InferType<typeof studentSchema>;
