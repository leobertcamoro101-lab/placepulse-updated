import { Link } from 'react-router-dom';

import Avatar from '../../shared/components/UIElements/Avatar';
import Card from '../../shared/components/UIElements/Card';

interface UserItemProps {
  id: string;
  image: string;
  name: string;
  placeCount: number;
  createdAt?: string;
}

function UserItem({ id, image, name, placeCount, createdAt }: UserItemProps) {
  return (
    <li className="w-full max-w-[40rem] group">
      <Card className="p-0 overflow-hidden">
        <Link
          to={`/${id}/places`}
          className="flex items-center w-full h-full no-underline p-4 text-gray-900 bg-gray-50 hover:bg-gray-100 active:bg-gray-100 transition-colors"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mr-4">
            <Avatar image={image} alt={name} />
          </div>
          <div>
            <h2 className="text-2xl m-0 mb-2 font-normal text-gray-900">
              {name}
            </h2>
            {createdAt && (
              <p className="text-xs text-gray-500 m-0">
                {new Date(createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
            <h3 className="m-0 text-gray-600">
              {placeCount} {placeCount === 1 ? "Place" : "Places"}
            </h3>
          </div>
        </Link>
      </Card>
    </li>
  );
}

export default UserItem;