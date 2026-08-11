import Card from '../../shared/components/UIElements/Card';
import PlaceItem from './PlaceItem';
import Button from '../../shared/components/FormElements/Button';
import { Place } from '../../shared/types/place';

// interface Creator {
//   _id?: string;
//   name?: string;
//   image?: string;
// }

// interface Place {
//   id: string;
//   image: string;
//   title: string;
//   description: string;
//   address: string;
//   creator?: Creator | string;
//   location: {
//     lat: number;
//     lng: number;
//   };
//   creatorName?: string;
//   creatorImage?: string;
//   createdAt?: string;
// }

interface PlaceListProps {
  items: Place[];
  onDeletePlace: (id: string) => void;
}

function PlaceList({ items, onDeletePlace }: PlaceListProps) {
  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] w-full px-4">
        <Card className="text-center p-6 max-w-md w-full">
          <h2 className="text-lg text-gray-800 mb-4">No places found. Maybe create one?</h2>
          <Button
            to="/places/new"
            className="rounded-full bg-blue-600 hover:bg-blue-700 border-blue-600 text-white font-semibold px-6 py-3"
          >
            Share Place
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <ul className="list-none m-auto p-0 w-90% max-w-2xl">
      {items.map(({ id, image, title, description, address, creator, location, creatorName, creatorImage, createdAt }) => {
        const creatorObj = typeof creator === 'object' ? creator : undefined;
        const resolvedCreatorId = creatorObj?._id || (typeof creator === 'string' ? creator : undefined);

        return (
          <PlaceItem
            key={id}
            id={id}
            image={image}
            title={title}
            description={description}
            address={address}
            creatorId={resolvedCreatorId}
            coordinates={location}
            onDelete={onDeletePlace}
            creatorName={creatorObj?.name || creatorName}
            creatorImage={creatorObj?.image || creatorImage}
            createdAt={createdAt}
          />
        );
      })}
    </ul>
  );
}

export default PlaceList;