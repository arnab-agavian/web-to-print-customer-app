import { apiInstance } from "./apiClient";

export const approveProof = (proofId) =>
  apiInstance.post(`/proofs/${proofId}/approve`);

export const requestProofChanges = (proofId, message) =>
  apiInstance.post(`/proofs/${proofId}/change-request`, { message });
