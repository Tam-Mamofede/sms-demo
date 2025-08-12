import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase.config";
import { useAuth } from "../../src/context/AuthContext";
import Navbar from "../../components/NavBar";
import { Input } from "../../src/components/ui/input";
import { Textarea } from "../../src/components/ui/textarea";
import { Button } from "../../src/components/ui/button";
import { Card, CardContent } from "../../src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import { useAlert } from "../../src/context/AlertContext";

export default function SetClassGuardianNotice() {
  const { classOptions, user } = useAuth();
  const { showAlert } = useAlert();

  const [form, setForm] = useState({
    title: "",
    content: "",
    targetClass: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.title ||
      !form.content ||
      !form.targetClass ||
      !form.startDate ||
      !form.endDate
    ) {
      showAlert("Please fill in all fields.", "warning");
      return;
    }

    try {
      setLoading(true);
      if (!user) {
        return <p>no user logged in</p>;
      }
      await addDoc(collection(db, "classes", form.targetClass, "notices"), {
        ...form,
        role: "Guardian",
        targetClass: form.targetClass,
        startDate: Timestamp.fromDate(new Date(form.startDate)),
        endDate: Timestamp.fromDate(new Date(form.endDate)),
        createdAt: Timestamp.now(),
      });
      showAlert("Guardian notice created!", "success");
      setForm({
        title: "",
        content: "",
        targetClass: "",
        startDate: "",
        endDate: "",
      });
    } catch (err) {
      console.error("Error creating notice:", err);
      showAlert("Failed to create notice.", "error");
    } finally {
      setLoading(false);
    }
  };

  const acceptedRoles = ["FormTeacher", "IT", "Proprietor"];
  const curUserRole = user?.role || "";
  if (!acceptedRoles.includes(curUserRole)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-sky-100 ">
        <h2 className="text-2xl font-bold">
          You are not authorized to create a notice
        </h2>
      </div>
    );
  }

  if (user?.formTeacherClass) {
    form.targetClass = user.formTeacherClass;
  }

  return (
    <div className="bg-[#FFF7ED] min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto py-16 px-6 mt-20">
        <Card className="bg-[#FDE68A] shadow-xl border-none rounded-2xl">
          <CardContent className="p-8 space-y-6">
            <h1 className="text-3xl font-bold text-[#065F46]">
              Create Guardian Notice
            </h1>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Notice Title"
                className="bg-white"
              />

              <Textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Enter notice content"
                className="bg-white"
              />

              {!user?.formTeacherClass && (
                <Select
                  value={form.targetClass}
                  onValueChange={(val) =>
                    setForm((prev) => ({ ...prev, targetClass: val }))
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Target Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#78350F] mb-1">
                    Start Date
                  </label>
                  <Input
                    type="datetime-local"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#78350F] mb-1">
                    End Date
                  </label>
                  <Input
                    type="datetime-local"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className="bg-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#10B981] text-white hover:bg-emerald-700"
              >
                {loading ? "Posting..." : "Post Notice"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
