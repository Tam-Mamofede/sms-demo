import { useState } from "react";
import { useAuth } from "../src/context/AuthContext";
import { db } from "../firebase.config";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import Navbar from "../components/NavBar";
import { Input } from "../src/components/ui/input";
import { Textarea } from "../src/components/ui/textarea";
import { Button } from "../src/components/ui/button";
import { Card, CardContent } from "../src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import { useAlert } from "../src/context/AlertContext";
import DisplayAssignments from "../components/DisplayAssignments";

export default function AddAssignment() {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const subjectClasses = user?.subjectAssignments || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !className || !subject || !dueDate) {
      showAlert("Please fill in all fields.", "warning");
      return;
    }

    try {
      setLoading(true);
      const assignment = {
        title,
        description,
        class: className,
        subject,
        dueDate: Timestamp.fromDate(new Date(dueDate)),
        createdBy: user?.uid,
        createdAt: Timestamp.now(),
      };

      await addDoc(
        collection(db, "classes", className, "assignments"),
        assignment
      );

      showAlert("Assignment sent successfully!", "success");
      setTitle("");
      setDescription("");
      setClassName("");
      setSubject("");
      setDueDate("");
    } catch (err) {
      console.error("Error sending assignment:", err);
      showAlert("Something went wrong. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" bg-[#FFF7ED]">
      <Navbar />
      <div className="max-w-2xl mx-auto pt-6 px-6 mt-20">
        <Card className="bg-[#FDE68A] border-none shadow-xl rounded-2xl">
          <CardContent className="p-8 space-y-6">
            <h1 className="text-3xl font-bold text-[#065F46]">
              Send Assignment
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Assignment Title"
                className="bg-white"
              />

              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write assignment instructions or details"
                className="bg-white"
              />

              <Select
                value={className}
                onValueChange={(val) => setClassName(val)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {subjectClasses.map((sc, i) => (
                    <SelectItem key={i} value={sc.class}>
                      {sc.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={subject} onValueChange={(val) => setSubject(val)}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {[...new Set(subjectClasses.map((s) => s.subject))].map(
                    (subj, i) => (
                      <SelectItem key={i} value={subj}>
                        {subj}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              <div>
                <label className="text-sm font-medium text-[#78350F] mb-1 block">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-white"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#10B981] text-white hover:bg-emerald-700"
              >
                {loading ? "Sending..." : "Send Assignment"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <DisplayAssignments />
    </div>
  );
}
