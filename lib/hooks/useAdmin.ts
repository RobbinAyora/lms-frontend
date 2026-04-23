import { useQuery } from "@tanstack/react-query";
import { adminApi, type AdminUser, type AdminCourse } from "@/lib/api/admin";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: adminApi.getUsers,
  });
}

export function useAdminCourses() {
  return useQuery({
    queryKey: ["admin-courses"],
    queryFn: adminApi.getAllCourses,
  });
}
