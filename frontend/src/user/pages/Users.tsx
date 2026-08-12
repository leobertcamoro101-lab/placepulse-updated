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

function Users() {
  const { sendRequest } = useHttpClient();

  const {
    data: loadedUsers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const responseData = await sendRequest(
        import.meta.env.VITE_BACKEND_URL + "/users",
      );
      if (!responseData) {
        // throw new Error("Request was cancelled, please try again."); //commented to never to see again in ErrorModal
        throw new Error("__silent_abort__"); // to silence the abort()
      }
      return responseData.users as User[];
    },
  });

  return (
    <>
      {/* commented to silence the abort() */}
      {/* <ErrorModal error={error instanceof Error ? error.message : undefined} onClear={() => refetch()} /> */}
      <ErrorModal
        error={
          error instanceof Error && error.message !== "__silent_abort__"
            ? error.message
            : undefined
        }
        onClear={() => refetch()}
      />
      {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
    </>
  );
}

export default Users;
