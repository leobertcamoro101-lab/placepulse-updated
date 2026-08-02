import { AlertTriangle, X } from 'lucide-react';
import Modal from './Modal';
import Button from '../FormElements/Button';

function ConfirmModal({
  show,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) {
  return (
    <Modal
      show={show}
      onCancel={onCancel}
      headerClass="!bg-white !text-gray-900 !rounded-t-lg !p-0"
      header={
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 m-0">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      }
      contentClass="!pt-0"
      footerClass="!pt-0"
      footer={
        <div className="flex gap-3 w-full sm:w-auto sm:ml-auto">
          <Button
            inverse
            onClick={onCancel}
            className="!flex-1 sm:!flex-none rounded-lg border border-gray-300 !text-gray-800 font-semibold px-6 py-3 hover:!bg-gray-50"
          >
            {cancelText}
          </Button>
          <Button
            danger
            onClick={onConfirm}
            className="!flex-1 sm:!flex-none rounded-lg border-red-600 bg-red-600 hover:bg-red-700 hover:border-red-600 text-white font-semibold px-6 py-3"
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-gray-600 px-4 sm:px-6 pb-2">{message}</p>
    </Modal>
  );
}

export default ConfirmModal;