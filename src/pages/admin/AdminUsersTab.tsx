import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Search } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { Input, Select } from "../../components/ui/field";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { Pagination } from "../../components/ui/Pagination";
import { getErrorMessage } from "../../api/axios";
import { useLanguage } from "../../i18n";
import type { UserRole } from "../../api/types";

export function AdminUsersTab() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"" | UserRole>("");

  const query = useQuery({
    queryKey: ["admin", "users", { page, search, role }],
    queryFn: () => adminApi.listUsers({ page, limit: 10, search: search || undefined, role: role || undefined }),
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const roleMutation = useMutation({
    mutationFn: ({ id, newRole }: { id: string; newRole: UserRole }) => adminApi.updateUserRole(id, newRole),
    onSuccess: invalidate,
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const activeMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminApi.setUserActive(id, isActive),
    onSuccess: invalidate,
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const users = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-fg">{t.admin.usersTitle}</h2>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-faint" aria-hidden />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t.admin.searchUsers}
            className="ps-10"
          />
        </div>
        <Select value={role} onChange={(e) => { setRole(e.target.value as "" | UserRole); setPage(1); }} className="sm:w-44">
          <option value="">{t.admin.userRole}</option>
          <option value="USER">USER</option>
          <option value="MANAGER">MANAGER</option>
          <option value="ADMIN">ADMIN</option>
        </Select>
      </div>

      {query.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[640px] text-start text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-fg-faint">
                <th className="px-4 py-3 text-start font-semibold">{t.auth.email}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.userRole}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.userStatus}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.userStories}</th>
                <th className="px-4 py-3 text-end font-semibold">{"Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-surface-2/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-fg">{user.name}</p>
                    <p className="text-xs text-fg-muted">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={user.role}
                      onChange={(e) => roleMutation.mutate({ id: user.id, newRole: e.target.value as UserRole })}
                      className="w-32"
                      aria-label={t.admin.userRole}
                    >
                      <option value="USER">USER</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="ADMIN">ADMIN</option>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={user.isActive ? "success" : "danger"} dot>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-fg-muted">{user.storyCount}</td>
                  <td className="px-4 py-3 text-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => activeMutation.mutate({ id: user.id, isActive: !user.isActive })}
                      loading={activeMutation.isPending}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination className="mt-6" page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}