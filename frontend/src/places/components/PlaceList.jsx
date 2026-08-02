import Card from '../../shared/components/UIElements/Card';
import PlaceItem from './PlaceItem';
import Button from '../../shared/components/FormElements/Button';

function PlaceList ({ items, onDeletePlace }) {
  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] w-full px-4">
        <Card className="text-center p-6 max-w-md w-full">
          <h2 className="text-lg text-gray-800 mb-4">No places found. Maybe create one?</h2>
          <Button to="/places/new" className="rounded-full bg-blue-600 hover:bg-blue-700 border-blue-600 text-white font-semibold px-6 py-3">
            Share Place
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <ul className="list-none m-auto p-0 w-90% max-w-2xl">
      {items.map(({ id, image, title, description, address, creator, location, creatorName, creatorImage, createdAt }) => (
        <PlaceItem
          key={id}
          id={id}
          image={image}
          title={title}
          description={description}
          address={address}
          creatorId={creator}
          coordinates={location}
          onDelete={onDeletePlace}
          creatorName={creatorName}
          creatorImage={creatorImage}
          createdAt={createdAt}
        />
      ))}
    </ul>
  );
};

export default PlaceList;