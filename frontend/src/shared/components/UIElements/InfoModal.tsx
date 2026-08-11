import { ReactNode, ComponentType } from 'react';
import { X } from 'lucide-react';
import Modal from './Modal';
import Button from '../FormElements/Button';

interface InfoModalProps {
  show: boolean;
  onCancel: () => void;
  icon?: ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: ReactNode;
  contentClass?: string;
  closeText?: string;
}

function InfoModal({
  show,
  onCancel,
  icon: Icon,
  title,
  children,
  contentClass,
  closeText = 'Close',
}: InfoModalProps) {
  return (
    <Modal
      show={show}
      onCancel={onCancel}
      headerClass="!bg-white !text-gray-900 !rounded-t-lg !p-0"
      header={
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-blue-600" />
              </div>
            )}
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
      contentClass={`!p-0 ${contentClass || ''}`}
      footerClass="!pt-0 !pb-4"
      footer={
        <Button
          onClick={onCancel}
          className="w-full sm:w-auto sm:ml-auto rounded-lg border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-600 text-white font-semibold px-6 py-3 mt-4"
        >
          {closeText}
        </Button>
      }
    >
      {children}
    </Modal>
  );
}

export default InfoModal;