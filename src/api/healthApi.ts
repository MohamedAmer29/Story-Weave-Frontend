import { api } from "./axios";

export const healthApi = {
  check: () => api.get("/health").then((r) => r.data),
  ready: () => api.get("/health/ready").then((r) => r.data),
};