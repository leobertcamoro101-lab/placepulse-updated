import { useEffect, useState } from "react";

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
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState<User[]>();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const responseData = await sendRequest(import.meta.env.VITE_BACKEND_URL + "/users");

        if (responseData) {
          setLoadedUsers(responseData.users);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchUsers();
  }, [sendRequest]);

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
    </>
  );
}

export default Users;