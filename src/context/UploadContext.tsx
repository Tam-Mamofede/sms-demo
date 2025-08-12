import { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase.config";
import { useAlert } from "./AlertContext";

const UploadContext = createContext<UploadContextType | undefined>(undefined);

interface UploadProviderProps {
  children: ReactNode;
}

interface UploadContextType {
  uploadToCloudinary: (file: File) => Promise<string | null>;
  uploading: boolean;
  imageUrl: string | null;
  handleFileChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
}

export const UploadProvider = ({ children }: UploadProviderProps) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const { staffId, formMethods } = useAuth();
  const { showAlert } = useAlert();
  const { setValue } = formMethods;

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "pfp_upload"); // Replace with your preset

    const isImage = file.type.startsWith("image/");
    const resourceType = isImage ? "image" : "raw";

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/defhgbept/${resourceType}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Upload failed");

      return data.secure_url || null; // Get the uploaded image URL
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      return null;
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!staffId) {
      showAlert(
        "You must be signed in to upload a profile picture.",
        "warning"
      );
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadedUrl = await uploadToCloudinary(file);
    setUploading(false);

    if (uploadedUrl) {
      setImageUrl(uploadedUrl);
      setValue("pfp", uploadedUrl, { shouldValidate: true });

      try {
        const staffRef = doc(db, "staff", staffId);
        await updateDoc(staffRef, { profilePicture: uploadedUrl });

        showAlert("Profile picture updated successfully!", "success");
      } catch (error) {
        console.error("Error updating Firestore:", error);
        showAlert("Failed to save profile picture to Firestore.", "error");
      }
    } else {
      showAlert("Failed to upload image.", "error");
    }
  };

  return (
    <UploadContext.Provider
      value={{ uploadToCloudinary, uploading, imageUrl, handleFileChange }}
    >
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = (): UploadContextType => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
};
