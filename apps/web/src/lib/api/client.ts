import { ApiClient } from "@orthodontics-helper/api-client";
import { apiBaseUrl } from "@/lib/api/config";

export const apiClient = new ApiClient(apiBaseUrl);
