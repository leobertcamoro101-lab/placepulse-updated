import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext, AuthContextType } from "./shared/context/auth-context";

export const mockAuthContext: AuthContextType = {
  isLoggedIn: false,
  userId: null,
  name: null,
  image: null,
  token: null,
  login: () => {},
  logout: () => {},
  updateUserInfo: () => {},
};

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

interface TestProvidersProps {
  children: ReactNode;
  authValue?: Partial<AuthContextType>;
  queryClient?: QueryClient;
}

// Wraps a component with the same providers it expects in the real app
// (React Query + AuthContext), so component tests don't crash on missing context.
// Routing is intentionally left out here — wrap with MemoryRouter/Routes
// per-test, since navigation destinations differ test to test.
// Pass your own `queryClient` when a test needs to spy on invalidateQueries etc.
export function TestProviders({ children, authValue = {}, queryClient }: TestProvidersProps) {
  const client = queryClient ?? createTestQueryClient();
  return (
    <QueryClientProvider client={client}>
      <AuthContext.Provider value={{ ...mockAuthContext, ...authValue }}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
