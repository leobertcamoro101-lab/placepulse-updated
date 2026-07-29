import { useState, useContext } from 'react';
import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import Map from '../../shared/components/UIElements/Map';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';

const PlaceItem = ({ id, image, title, description, address, coordinates, onDelete, creatorId }) => {
  const {isLoading, error, sendRequest, clearError} = useHttpClient();
  const auth = useContext(AuthContext);
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const openMapHandler = () => setShowMap(true);
  const closeMapHandler = () => setShowMap(false);
  const showDeleteWarningHandler = () => setShowConfirmModal(true);
  const cancelDeleteHandler = () => setShowConfirmModal(false);

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try{
      await sendRequest(
        import.meta.env.VITE_BACKEND_URL + `/places/${id}`, 
        'DELETE',
        null,
        {
          Authorization: 'Bearer ' + auth.token
        }
      );
      onDelete(id);
    }catch(err){
      // the catch is empty because it's set when using useHttpClient inside http-hook.js file
        console.log(err) // to get rid or curly marked (to know the error message in console)
    }
    
  };
  return (
    <>
      {/* Map Modal */}
      <ErrorModal error={error} onClear={clearError}/>
      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        header={address}
        contentClass="p-0"
        footerClass="text-right"
        footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
      >
        <div className="h-60 w-full">
          <Map center={coordinates} zoom={16} />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="text-right"
        footer={
          <>
            <Button inverse onClick={cancelDeleteHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </>
        }
      >
        <p>
          Do you want to proceed and delete this place? Please note that it
          can't be undone thereafter.
        </p>
      </Modal>
      {/* Place Item Card */}
      <li className="my-4 list-none">
        <Card className="p-0">
          {isLoading && <LoadingSpinner asOverlay/>}
          <div className="h-50 w-full mr-6 md:h-80">
            <img 
              // src={`${import.meta.env.VITE_BACKEND_ASSET_URL}/${props.image}`} // removed switched to Cloudinary, VITE_BACKEND_ASSET_URL is no longer needed
              src={image} 
              alt={title} 
              className="h-full w-full object-cover"
            />
          </div>
          
          <div className="p-4 text-center">
            <h2 className="m-0 mb-2">{title}</h2>
            <h3 className="m-0 mb-2">{address}</h3>
            <p className="m-0 mb-2">{description}</p>
          </div>
          
          <div className="p-4 text-center border-t border-[#ccc] [&>*]:m-2">
            <Button inverse onClick={openMapHandler}>
              VIEW ON MAP
            </Button>
            
            {auth.userId === creatorId && (
              <Button to={`/places/${id}`}>EDIT</Button>
            )}

            {auth.userId === creatorId && (
              <Button danger onClick={showDeleteWarningHandler}>
                DELETE
              </Button>
            )}
          </div>
        </Card>
      </li>
    </>
  );
};

export default PlaceItem;


// import { useState, useContext } from 'react';
// import Card from '../../shared/components/UIElements/Card';
// import Button from '../../shared/components/FormElements/Button';
// import Modal from '../../shared/components/UIElements/ModalOverlay';
// import Map from '../../shared/components/UIElements/Map';
// import { AuthContext } from '../../shared/context/auth-context';

// function PlaceItem ({ id, image, title, description, address, coordinates }) {
//   const auth = useContext(AuthContext);
//   const [showMap, setShowMap] = useState(false);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);

//   const openMapHandler = () => setShowMap(true);
//   const closeMapHandler = () => setShowMap(false);

//   const showDeleteWarningHandler = () => setShowConfirmModal(true);
//   const cancelDeleteHandler = () => setShowConfirmModal(false);

//   const confirmDeleteHandler = () => {
//     setShowConfirmModal(false);
//     console.log('DELETING...');
//   };

//   return (
//     <>
//           <Map center={coordinates} zoom={16} />

//       <Modal
//         show={showConfirmModal}
//         onCancel={cancelDeleteHandler}
//         header="Are you sure?"
//         footerClass="text-right"
//         footer={
//           <>
//             <Button inverse onClick={cancelDeleteHandler}>
//               CANCEL
//             </Button>
//             <Button danger onClick={confirmDeleteHandler}>
//               DELETE
//             </Button>
//           </>
//         }
//       >
//         <p>
//           Do you want to proceed and delete this place? Please note that it
//           can't be undone thereafter.
//         </p>
//       </Modal>

//       <li className="mt-4 mb-4">
//         <Card className="p-0">
//           <div className="w-full h-[12.5rem] mr-6">
//             <img src={image} alt={title} />
//           </div>
//           <div className="p-4 text-center">
//             <h2>{title}</h2>
//             <h3>{address}</h3>
//             <p>{description}</p>
//           </div>
//           <div className="p-4 text-center border-t border-gray-300">
//             <Button inverse onClick={openMapHandler}>
//               VIEW ON MAP
//             </Button>
//             {auth.isLoggedIn && (
//               <Button to={`/places/${id}`}>EDIT</Button>
//             )}
//             {auth.isLoggedIn && (
//               <Button danger onClick={showDeleteWarningHandler}>
//                 DELETE
//               </Button>
//             )}
//           </div>
//         </Card>
//       </li>
//     </>
//   );
// };

// export default PlaceItem;
