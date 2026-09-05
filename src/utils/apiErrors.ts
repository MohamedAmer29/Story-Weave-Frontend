import { toast } from "react-toastify";
import { getErrorMessage } from "../api/axios";

const DEFAULT_ERROR = "Something went wrong. Please try again.";

export function notifyError(error: unknown, fallback?: string): void {
  toast.error(getErrorMessage(error) ?? fallback ?? DEFAULT_ERROR);
}

export function notifySuccess(message: string): void {
  toast.success(message);
}

export function notifyWarning(message: string): void {
  toast.warning(message);
}

export function notifyInfo(message: string): void {
  toast.info(message);
}