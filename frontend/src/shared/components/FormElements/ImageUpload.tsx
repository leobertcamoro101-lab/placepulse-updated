import { useRef, useState, useEffect, ChangeEvent } from 'react';
import Button from './Button';

interface ImageUploadProps {
  id: string;
  onInput: (id: string, value: string | File | undefined, isValid: boolean) => void;
  errorText?: string;
  center?: boolean;
}

function ImageUpload({ id, onInput, errorText }: ImageUploadProps) {
  const [file, setFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [isValid, setIsValid] = useState(false);

  const filePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const pickHandler = (event: ChangeEvent<HTMLInputElement>) => {
    let pickedFile: File | undefined;
    let fileIsValid: boolean;

    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      setFile(pickedFile);
      setIsValid(true);
      fileIsValid = true;
    } else {
      setIsValid(false);
      fileIsValid = false;
    }
    onInput(id, pickedFile, fileIsValid);
  };

  const pickImageHandler = () => {
    filePickerRef.current?.click();
  };

  return (
    <div className="mb-4">
      <input
        id={id}
        ref={filePickerRef}
        style={{ display: 'none' }}
        type="file"
        accept=".jpg,.png,.jpeg"
        onChange={pickHandler}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-48 h-48 border border-gray-300 rounded flex items-center justify-center overflow-hidden bg-gray-50">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <p className="text-sm text-gray-500 text-center px-2">Please pick an image.</p>
          )}
        </div>
        <Button
          type="button"
          onClick={pickImageHandler}
          className="rounded-full border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-600 text-white font-semibold py-3 text-lg"
        >
          PICK IMAGE
        </Button>
      </div>
      {!isValid && errorText && (
        <p className="text-red-600 text-sm mt-1 text-center">{errorText}</p>
      )}
    </div>
  );
}

export default ImageUpload;