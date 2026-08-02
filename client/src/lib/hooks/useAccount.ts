import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginSchema } from "../Schemas/loginSchema";
import type { RegisterSchema } from "../Schemas/registerSchema";
import agent from "../api/agent";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

export const useAccount = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const loginUser = useMutation({
    mutationFn: async (creds: LoginSchema) => {
      await agent.post("/login?useCookies=true", creds);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["user"],
      });
      
    },
  });

  const logoutUser = useMutation({
    mutationFn: async () => {
      // AccountController lives under api/[controller], and MapIdentityApi does
      // not expose a logout endpoint - "/logout" alone is a 404.
      await agent.post("/account/logout");
    },
    onSuccess: () => {
      // Drop the cached identity immediately so the NavBar flips to the
      // logged-out state without waiting for a refetch.

      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.removeQueries({ queryKey: ["activities"] });
      navigate("/", { replace: true });
    },
  });

  const registerUser = useMutation({
    mutationFn: async (creds: RegisterSchema) => {
      await agent.post("/account/register", creds);
    },
    onSuccess:  () => {
      toast.success("Registration successful - you can now log in");
      navigate("/login", { replace: true });
    }
  });

  const { data: currentUser, isLoading: loadingUserInfo } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await agent.get<User>("/account/user-info");
      // Anonymous callers get 204 No Content, which axios surfaces as an
      // empty string. Normalise it so the cache holds `null`, not `""`.
      return response.data || null;
    },
    enabled: !queryClient.getQueryData(["user"]),
  });

  return {
    loginUser,
    registerUser,
    logoutUser,
    currentUser,
    loadingUserInfo,
  };
};
