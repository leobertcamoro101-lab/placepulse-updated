import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import UsersList from "../components/UserList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import { useHttpClient } from "../../shared/hooks/http-hook";

interface User {
  id: string;
  image: string;
  name: string;
  places: unknown[];
  createdAt?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}

interface UsersResponse {
  users: User[];
  pagination: Pagination;
}

// Smaller than the backend's default (50) so numbered pagination actually
// becomes visible/useful in normal use — matches Places.tsx's PAGE_SIZE.
const PAGE_SIZE = 10;

function Users() {
  const [page, setPage] = useState(1);
  const { sendRequest } = useHttpClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users", page],
    queryFn: async (): Promise<UsersResponse> => {
      const responseData = await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/users?page=${page}&limit=${PAGE_SIZE}`
      );
      if (!responseData) {
        throw new Error("__silent_abort__"); // to silence the abort()
      }
      return responseData as UsersResponse;
    },
  });

  const pagination = data?.pagination;

  return (
    <>
      <ErrorModal
        error={
          error instanceof Error && error.message !== "__silent_abort__"
            ? error.message
            : undefined
        }
        onClear={() => refetch()}
      />
      {!isLoading && data && (
        <>
          <UsersList items={data.users} />

          {pagination && pagination.totalPages > 1 && (
            <nav
              className="flex justify-center items-center gap-2 my-6"
              aria-label="Users pagination"
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Prev
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  aria-current={pageNum === pagination.currentPage ? "page" : undefined}
                  className={`w-9 h-9 rounded-lg text-sm font-medium ${
                    pageNum === pagination.currentPage
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}

export default Users;
