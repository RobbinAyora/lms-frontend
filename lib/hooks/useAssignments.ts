import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentApi, Assignment } from "@/lib/api/assignments";

export function useAssignments() {
  return useQuery({
    queryKey: ["assignments"],
    queryFn: assignmentApi.getAssignments,
  });
}

export function useAssignmentDetails(id: string) {
  return useQuery({
    queryKey: ["assignment", id],
    queryFn: () => assignmentApi.getAssignment(id),
    enabled: !!id,
  });
}

export function useSubmitAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      content,
      attachments,
    }: {
      id: string;
      content: string;
      attachments?: File[];
    }) => assignmentApi.submitAssignment(id, content, attachments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

export function usePendingAssignments() {
  const { data: assignments = [], isLoading } = useAssignments();

  return {
    data: assignments.filter((a: Assignment) => a.status === "pending"),
    isLoading,
  };
}
