import { useState, useContext, useRef, useEffect } from "react";
import { MoreHorizontal, MapPin, Pencil, Trash2 } from "lucide-react";
import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";
import InfoModal from '../../shared/components/UIElements/InfoModal';
import ConfirmModal from "../../shared/components/UIElements/ConfirmModal";
import Map from "../../shared/components/UIElements/Map";
import Avatar from "../../shared/components/UIElements/Avatar";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { AuthContext } from "../../shared/context/auth-context";
import { useHttpClient } from "../../shared/hooks/http-hook";

const PlaceItem = ({
  id,
  image,
  title,
  description,
  address,
  coordinates,
  onDelete,
  creatorId,
  creatorName,
  creatorImage,
  createdAt,
}) => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const openMapHandler = () => {
    setShowMap(true);
    setMenuOpen(false);
  };
  const closeMapHandler = () => setShowMap(false);
  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true);
    setMenuOpen(false);
  };
  const cancelDeleteHandler = () => setShowConfirmModal(false);

  // Close the dropdown when clicking anywhere outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      await sendRequest(
        import.meta.env.VITE_BACKEND_URL + `/places/${id}`,
        "DELETE",
        null,
        { Authorization: "Bearer " + auth.token },
      );
      onDelete(id);
    } catch (err) {
      console.log(err);
    }
  };

  const isOwner = auth.userId === creatorId;

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {/* Map Modal */}

      <InfoModal
        show={showMap}
        onCancel={closeMapHandler}
        icon={MapPin}
        title={address}
        
      >
        <div className="h-60 w-full">
          <Map center={coordinates} zoom={16} />
        </div>
      </InfoModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        onConfirm={confirmDeleteHandler}
        title="Delete this place?"
        message="Are you sure you want to delete this place? All of its data will be permanently removed. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Facebook-style Post Card */}
      <li className="my-4 list-none w-full max-w-[40rem] mx-auto">
        <Card className="p-0 overflow-visible">
          {isLoading && <LoadingSpinner asOverlay />}

          {/* Post header: avatar, name, date, three-dot menu */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10">
                <div className="w-10 h-10">
                  <Avatar
                    image={creatorImage}
                    alt={creatorName || "User"}
                    width="40px"
                  />
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900 m-0">
                  {creatorName || "Unknown user"}
                </p>
                {createdAt && (
                  <p className="text-xs text-gray-500 m-0">
                    {new Date(createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                aria-label="Post options"
              >
                <MoreHorizontal size={20} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={openMapHandler}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <MapPin size={16} /> View on Map
                  </button>

                  {isOwner && (
                    <Button
                      to={`/places/${id}`}
                      className="!w-full !flex !items-center !gap-2 !px-4 !py-2 !text-sm !text-gray-700 hover:!bg-gray-100 !bg-transparent !border-0 !rounded-none !m-0 !justify-start"
                    >
                      <Pencil size={16} /> Edit
                    </Button>
                  )}

                  {isOwner && (
                    <button
                      onClick={showDeleteWarningHandler}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Post body: title + description */}
          <div className="px-4 pb-3">
            <h2 className="text-lg font-semibold text-gray-900 m-0 mb-1">
              {title}
            </h2>
            <p className="text-sm text-gray-600 m-0">{address}</p>
            <p className="text-sm text-gray-800 mt-2 m-0">{description}</p>
          </div>

          {/* Post image */}
          <div className="w-full h-64 md:h-96">
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        </Card>
      </li>
    </>
  );
};

export default PlaceItem;
