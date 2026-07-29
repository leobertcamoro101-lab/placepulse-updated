import Card from '../../shared/components/UIElements/Card';
import PlaceItem from './PlaceItem';
import Button from '../../shared/components/FormElements/Button';

function PlaceList ({ items, onDeletePlace }) {
  if (items.length === 0) {
    return (
      <div className="list-none m-auto p-0 w-90% max-w-2xl mx-auto px-4">
        <Card>
          <h2>No places found. Maybe create one?</h2>
          <Button to="/places/new">Share Place</Button>
        </Card>
      </div>
    );
  }

  return (
    // change "imageUrl" to "image"
    <ul className="list-none m-auto p-0 w-90% max-w-2xl">
      {items.map(({ id, image, title, description, address, creator, location }) => (
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
        />
      ))}
    </ul>
  );
};

export default PlaceList;
