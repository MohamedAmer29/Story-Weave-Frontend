import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { favouritesApi } from "../api/favouritesApi";
import { getErrorMessage } from "../api/axios";
import { useLanguage } from "../i18n";

export function useFavouritesIds(enabled = true) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["favourites", "ids"],
    queryFn: async () => {
      const ids = new Set<string>();
      let page = 1;
      for (;;) {
        const res = await favouritesApi.list({ page, limit: 50 });
        for (const item of res.data) {
          ids.add(item.id);
        }
        if (page >= (res.meta?.totalPages ?? 1) || res.data.length === 0) break;
        page += 1;
      }
      return ids;
    },
    enabled: Boolean(enabled),
    staleTime: 30_000,
  });

  const favIds = query.data ?? new Set<string>();

  const toggleMutation = useMutation({
    mutationFn: ({ id, favorited }: { id: string; favorited: boolean }) =>
      favorited ? favouritesApi.remove(id) : favouritesApi.add(id),
    onMutate: async ({ id, favorited }) => {
      await queryClient.cancelQueries({ queryKey: ["favourites", "ids"] });
      const previous = queryClient.getQueryData<Set<string>>([
        "favourites",
        "ids",
      ]);
      queryClient.setQueryData<Set<string>>(
        ["favourites", "ids"],
        (old) => {
          const next = new Set(old ?? []);
          if (favorited) next.delete(id);
          else next.add(id);
          return next;
        },
      );
      return { previous };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["favourites"] });
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["favourites", "ids"], ctx.previous);
      }
      toast.error(getErrorMessage(err) ?? t.common.error);
    },
  });

  return {
    favIds,
    isLoaded: query.isSuccess,
    isPending: toggleMutation.isPending,
    toggle: (id: string) =>
      toggleMutation.mutate({
        id,
        favorited: favIds.has(id),
      }),
  };
}