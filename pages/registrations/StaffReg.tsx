import { useState } from "react";
import { useAuth } from "../../src/context/AuthContext";
import { useUpload } from "../../src/context/UploadContext";
import { useFieldArray } from "react-hook-form";
import Navbar from "../../components/NavBar";

const StaffReg = () => {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { createStaffAcct, formMethods, uploading, subjects, classOptions } =
    useAuth();
  const { handleFileChange } = useUpload();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    getValues,
    setValue,
    watch,
  } = formMethods;

  // Work Experience Field Array
  const {
    fields: workFields,
    append: addWork,
    remove: removeWork,
  } = useFieldArray({
    control,
    name: "workExperiences",
  });

  /////////////////////////////////////////////////////////
  // Qualifications Field Array (For Certifications)
  const certifications = watch("certifications") || [];
  const addCert = () => {
    const currentCerts = getValues("certifications") || [];
    setValue("certifications", [...currentCerts, ""]);
  };

  const removeCert = (index: number) => {
    const currentCerts = getValues("certifications") || [];
    setValue(
      "certifications",
      currentCerts.filter((_: unknown, i: number) => i !== index)
    );
  };

  ////////////////////////////////////////////////

  const { fields, append } = useFieldArray({
    control,
    name: "subjectAssignments",
  });

  return (
    <div className="min-h-screen bg-[#FFF7ED] text-[#065F46]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10 mt-26 ">
        <div className="bg-[#fde996] p-8 rounded-xl shadow-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-[#78350F]">
            Staff Registration
          </h2>

          <form onSubmit={handleSubmit(createStaffAcct)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block font-medium">Email</label>
              <input
                {...register("email")}
                className="w-full p-2 border border-gray-700 rounded-xl"
              />
              <p className="text-red-500 text-sm">{errors.email?.message}</p>
            </div>

            {/* Password */}
            <div>
              <label className="block font-medium">Password</label>
              <input
                {...register("password")}
                type="password"
                className="w-full p-2 border border-gray-700 rounded-xl"
              />
              <p className="text-red-500 text-sm">{errors.password?.message}</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-medium">Confirm Password</label>
              <input
                {...register("confirmPassword")}
                type="password"
                className="w-full p-2 border border-gray-700 rounded-xl"
              />
              <p className="text-red-500 text-sm">
                {errors.confirmPassword?.message}
              </p>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">First Name</label>
                <input
                  {...register("firstName")}
                  className="w-full p-2 border border-gray-700 rounded-xl"
                />
                <p className="text-red-500 text-sm">
                  {errors.firstName?.message}
                </p>
              </div>
              <div>
                <label className="block font-medium">Last Name</label>
                <input
                  {...register("lastName")}
                  className="w-full p-2 border border-gray-700 rounded-xl"
                />
                <p className="text-red-500 text-sm">
                  {errors.lastName?.message}
                </p>
              </div>
            </div>

            {/* Profile Picture Upload */}
            <div>
              <label className="block font-medium">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="border w-full p-2 rounded-lg"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block font-medium">Date of Birth</label>
              <input
                type="date"
                {...register("dateOfBirth")}
                className="w-full p-2 border border-gray-700 rounded-xl"
              />
            </div>

            {/* Gender & Nationality */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Gender</label>
                <select
                  {...register("gender")}
                  className="w-full p-2 border border-gray-700 rounded-xl"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-medium">Nationality</label>
                <input
                  {...register("nationality")}
                  className="w-full p-2 border border-gray-700 rounded-xl"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block font-medium">Phone Number</label>
              <input
                {...register("phoneNumber")}
                className="w-full p-2 border border-gray-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-medium">Address</label>
              <input
                {...register("address")}
                className="w-full p-2 border border-gray-700 rounded-xl"
              />
            </div>
            {/* System Access - Role */}
            <div>
              <label className="block font-medium">Role</label>
              <select
                {...register("role")}
                className="w-full p-2 border border-gray-700 rounded-xl"
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="SubjectTeacher">Subject Teacher</option>
                <option value="FormTeacher">Form Teacher</option>
                <option value="Admin">Admin</option>
                <option value="Proprietor">Proprietor</option>
                <option value="Guardian">Guardian</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Accountant">Accountant</option>
                <option value="Librarian">Librarian</option>
                <option value="HOD">Head of Department</option>
              </select>
            </div>

            {/* Employment Type & Account Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Date of Employment</label>
                <input
                  type="date"
                  {...register("dateOfEmployment")}
                  className="w-full p-2 border border-gray-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-medium">Employment Type</label>
                <select
                  {...register("employmentType")}
                  className="w-full p-2 border border-gray-700 rounded-xl"
                >
                  <option value="">Select</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            {/* Qualifications Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Qualifications
              </h3>
            </div>
            {/* Highest Degree */}
            <div>
              <label className="block font-medium">Highest Degree</label>
              <input
                {...register("highestDegree")}
                type="text"
                placeholder="Enter highest degree"
                className="border rounded-md p-2 w-full"
              />
              <p className="text-red-500 text-sm">
                {errors.highestDegree?.message}
              </p>
            </div>

            {/* Certifications List */}
            <div>
              <label className="block font-medium">Certifications</label>
              {certifications.map((_: unknown, index: number) => (
                <div key={index}>
                  <h4 className="font-normal text-sm text-gray-500">
                    School: Certificate acquired
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      {...register(`certifications.${index}`)}
                      type="text"
                      placeholder="Enter certification"
                      className="border rounded-md p-2 w-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeCert(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addCert}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-200 hover:cursor-pointer mt-2"
              >
                Add Certification
              </button>
            </div>

            {/* Work Experience Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Work Experience
              </h3>
            </div>

            {workFields.map((field, index) => (
              <div
                key={field.id}
                className="flex flex-col space-y-2 border p-4 rounded-lg"
              >
                <div>
                  <label>Number of Years:</label>
                  <input
                    type="number"
                    {...register(`workExperiences.${index}.years`)}
                    className="border p-2 w-full"
                  />
                </div>

                <div>
                  <label>Job Title:</label>
                  <input
                    {...register(`workExperiences.${index}.title`)}
                    className="border p-2 w-full"
                  />
                </div>

                <div>
                  <label>Location:</label>
                  <input
                    {...register(`workExperiences.${index}.location`)}
                    className="border p-2 w-full"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeWork(index)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addWork({ years: 0, title: "", location: "" })}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-200 hover:cursor-pointer"
            >
              Add Work Experience
            </button>

            {/* Class Assigned */}
            {selectedRole === "FormTeacher" ? (
              <div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Select Assigned Class for Form Teacher
                  </h3>
                  <select
                    {...register("formTeacherClass")}
                    className="w-full p-2 border border-gray-700 rounded-xl"
                  >
                    {classOptions.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Select Assigned Subject and Class
                  </h3>

                  {fields.map((field, index) => (
                    <div key={field.id} className="mb-3 flex gap-3">
                      {/* Subject Select Field */}
                      <select
                        {...register(`subjectAssignments.${index}.subject`)}
                        className="w-full p-2 border border-gray-700 rounded-xl"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>

                      {/* Class Select Field */}
                      <select
                        {...register(`subjectAssignments.${index}.class`)}
                        className="w-full p-2 border border-gray-700 rounded-xl"
                      >
                        <option value="">Select Class</option>
                        {classOptions.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}

                  {/* Button to Add More Subject-Class Pairs */}
                  <button
                    type="button"
                    onClick={() => append({ subject: "", class: "" })}
                    className="bg-emerald-500 text-white px-4 py-2 rounded"
                  >
                    Add More
                  </button>
                </div>
              </div>
            ) : selectedRole === "SubjectTeacher" ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Select Assigned Subject and Class
                </h3>

                {fields.map((field, index) => (
                  <div key={field.id} className="mb-3 flex gap-3">
                    {/* Subject Select Field */}
                    <select
                      {...register(`subjectAssignments.${index}.subject`)}
                      className="w-full p-2 border border-gray-700 rounded-xl"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>

                    {/* Class Select Field */}
                    <select
                      {...register(`subjectAssignments.${index}.class`)}
                      className="w-full p-2 border border-gray-700 rounded-xl"
                    >
                      <option value="">Select Class</option>
                      {classOptions.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                {/* Button to Add More Subject-Class Pairs */}
                <button
                  type="button"
                  onClick={() => append({ subject: "", class: "" })}
                  className="bg-emerald-500 text-white px-4 py-2 rounded"
                >
                  Add More
                </button>
              </div>
            ) : null}

            {/* {Object.keys(errors).length > 0 && (
              <div className="bg-red-100 text-red-600 p-2">
                <p>❌ Fix the following errors:</p>
                <ul>
                  {Object.entries(errors).map(([key, value]) => (
                    <li key={key}>
                      {key}: {value.message}
                    </li>
                  ))}
                </ul>
              </div>
            )} */}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#F59E0B] hover:bg-[#d97706] text-white font-semibold py-2 rounded-lg transition-all hover:cursor-pointer"
              disabled={uploading}
              onClick={() => console.log("Register button clicked")}
            >
              {uploading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffReg;
