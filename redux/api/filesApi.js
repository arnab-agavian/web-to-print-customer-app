import { apiInstance } from "./apiClient";

export const uploadFile = (file, category = "artwork") => {
  const body = new FormData();
  body.append("file", file);
  body.append("category", category);

  return apiInstance.post("/files/upload", body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
