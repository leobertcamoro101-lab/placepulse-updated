import { useEffect, useState } from "react";

import UsersList from "../components/UserList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";

function Users() {
  const {isLoading, error, sendRequest, clearError} = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const responseData = await sendRequest(import.meta.env.VITE_BACKEND_URL + "/users");
        
        if(responseData){
          // i put this inside the if because of component http-hook.js abort-handling
          // Fix — guard against responseData being undefined before using it:
          setLoadedUsers(responseData.users); //why users because of the backend "res.json({ users: users.map((user) => user.toObject({ getters: true })) });"
        }
        
      } catch (err) {
        // the catch is empty because it's set when using useHttpClient inside http-hook.js file
        console.log(err) // to get rid or curly marked (to know the error message in console)
      }
      
    };
    fetchUsers();
  }, [sendRequest]);

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
    </>
  );
}

export default Users;
