import { AlertCircle, X } from 'lucide-react';
import Modal from './Modal';
import Button from '../FormElements/Button';

interface ErrorModalProps {
  onClear: () => void;
  error?: string;
}

const ErrorModal = ({ onClear, error }: ErrorModalProps) => {
  return (
    <Modal
      show={!!error}
      onCancel={onClear}
      headerClass="!bg-white !text-gray-900 !rounded-t-lg !p-0"
      header={
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 m-0">An Error Occurred</h2>
          </div>
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      }
      contentClass="!p-0"
      footerClass="!pt-0 !pb-4"
      footer={
        <Button
          onClick={onClear}
          className="w-full sm:w-auto sm:ml-auto rounded-lg border-red-600 bg-red-600 hover:bg-red-700 hover:border-red-600 text-white font-semibold px-6 py-3"
        >
          Okay
        </Button>
      }
    >
      <p className="text-gray-600 px-4 sm:px-6 pb-2">{error}</p>
    </Modal>
  );
};

export default ErrorModal;