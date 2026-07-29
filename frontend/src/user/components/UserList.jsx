import UserItem from './UserItem';
import Card from '../../shared/components/UIElements/Card';

function UsersList ({ items }) {
  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[20rem] w-full">
        <Card>
          <h2 className="text-xl font-semibold text-gray-700">No users found.</h2>
        </Card>
      </div>
    );
  }

  return (
    <ul className="list-none mx-auto p-0 w-[90%] max-w-[50rem] flex justify-center flex-wrap">
      {items.map(({ id, image, name, places }) => (
        <UserItem
          key={id}
          id={id}
          image={image}
          name={name}
          placeCount={places.length}
        />
      ))}
    </ul>
  );
};

export default UsersList;
