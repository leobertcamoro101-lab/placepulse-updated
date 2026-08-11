import UserItem from './UserItem';
import Card from '../../shared/components/UIElements/Card';

interface User {
  id: string;
  image: string;
  name: string;
  places: unknown[];
  createdAt?: string;
}

interface UsersListProps {
  items: User[];
}

function UsersList({ items }: UsersListProps) {
  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] w-full px-4">
        <Card className="text-center p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold text-gray-700">No users found.</h2>
        </Card>
      </div>
    );
  }

  return (
    <ul className="list-none mx-auto p-0 w-[90%] max-w-[50rem] flex flex-col items-center gap-4 m-4">
      {items.map(({ id, image, name, places, createdAt }) => (
        <UserItem
          key={id}
          id={id}
          image={image}
          name={name}
          placeCount={places.length}
          createdAt={createdAt}
        />
      ))}
    </ul>
  );
}

export default UsersList;