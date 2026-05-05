import * as authApi from "./authApi";
import * as supportApi from "./support";
import { api } from "./api/client";
import * as notifications from "./api/notifications";
import * as courses from "./api/courses";
import * as assignments from "./api/assignments";
import * as instructor from "./api/instructor";
import * as admin from "./api/admin";

// Re-export all APIs
export { authApi, supportApi };
export { api };
export * from "./api/notifications";
export * from "./api/courses";
export * from "./api/assignments";
export * from "./api/instructor";
export * from "./api/admin";
export * from "./auth";