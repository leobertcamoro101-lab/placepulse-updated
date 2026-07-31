import Modal from './Modal';
import Button from '../FormElements/Button';

function ErrorModal  ({ onClear, error })  {
  return (
    <Modal
      onCancel={onClear}
      header="An Error Occurred!"
      show={!!error}
      footer={
        <Button 
          onClick={onClear}
          className="rounded border-red-600 bg-red-600 hover:bg-red-700 hover:border-red-600 text-white font-semibold py-3 text-lg"
        >
          Okay
        </Button>
      }
    >
      <p>{error}</p>
    </Modal>
  );
};

export default ErrorModal;