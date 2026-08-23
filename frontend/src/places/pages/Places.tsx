import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PlaceList from "../components/PlaceList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { Place } from '../../shared/types/place';

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}

interface PlacesResponse {
  places: Place[];
  pagination: Pagination;
}

// Smaller than the backend's default (50) so numbered pagination actually
// becomes visible/useful in normal use, rather than needing 51+ places
// before a second page ever appears.
const PAGE_SIZE = 10;

function Places() {
  const [page, setPage] = useState(1);
  const { sendRequest } = useHttpClient();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['places', page],
    queryFn: async (): Promise<PlacesResponse> => {
      const responseData = await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/places?page=${page}&limit=${PAGE_SIZE}`
      );
      if (!responseData) {
        throw new Error('__silent_abort__');
      }
      return responseData as PlacesResponse;
    },
  });

  const placeDeletedHandler = () => {
    // A manual cache splice can't correctly update totalCount/totalPages
    // once results are paginated, so the current page is refetched instead
    // — slightly more network traffic, but always accurate.
    queryClient.invalidateQueries({ queryKey: ['places'] });
  };

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
          <PlaceList items={data.places} onDeletePlace={placeDeletedHandler} />

          {pagination && pagination.totalPages > 1 && (
            <nav
              className="flex justify-center items-center gap-2 my-6"
              aria-label="Places pagination"
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

export default Places;
