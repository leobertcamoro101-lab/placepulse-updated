import { Link } from 'react-router-dom';

import Avatar from '../../shared/components/UIElements/Avatar';
import Card from '../../shared/components/UIElements/Card';

function UserItem ({ id, image, name, placeCount }) {
  return (
    <li className="m-4 w-[calc(45%-2rem)] min-w-[17.5rem] group">
      <Card className="p-0 overflow-hidden">
        <Link 
          to={`/${id}/places`}
          className="flex items-center w-full h-full no-underline p-4 text-white bg-[#292929] hover:bg-[#ffd900] active:bg-[#ffd900] transition-colors"
        >
          <div className="w-16 h-16 mr-4">
            <Avatar
              //image={`${import.meta.env.VITE_BACKEND_ASSET_URL}/${props.image}`} // removed switched to Cloudinary, import.meta.env.VITE_BACKEND_ASSET_URL is no longer needed 
              image={image} 
              alt={name} 
            />
          </div>
          <div>
            <h2 className="text-2xl m-0 mb-2 font-normal text-[#ffd900] group-hover:text-[#292929] group-active:text-[#292929]">
              {name}
            </h2>
            <h3 className="m-0 group-hover:text-[#292929] group-active:text-[#292929]">
              {placeCount} {placeCount === 1 ? 'Place' : 'Places'}
            </h3>
          </div>
        </Link>
      </Card>
    </li>
  );
};

export default UserItem;
