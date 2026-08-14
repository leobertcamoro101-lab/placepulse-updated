import { useReducer, useEffect, ChangeEvent, FocusEvent } from 'react';
import { validate, Validator } from '../../utils/validators';
import { cn } from '../../utils/cn';

interface InputReducerState {
  value: string;
  isTouched: boolean;
  isValid: boolean;
}

type InputAction =
  | { type: 'CHANGE'; val: string; validators: Validator[] }
  | { type: 'TOUCH' };

const inputReducer = (state: InputReducerState, action: InputAction): InputReducerState => {
  switch (action.type) {
    case 'CHANGE':
      return {
        ...state,
        value: action.val,
        isValid: validate(action.val, action.validators),
      };
    case 'TOUCH':
      return {
        ...state,
        isTouched: true,
      };
    default:
      return state;
  }
};

interface SelectOption {
  value: string;
  label: string;
}

interface InputProps {
  initialValue?: string;
  initialValid?: boolean;
  id: string;
  onInput: (id: string, value: string, isValid: boolean) => void;
  validators: Validator[];
  element: 'input' | 'select' | 'textarea';
  type?: string;
  placeholder?: string;
  rows?: number;
  label?: string;
  errorText?: string;
  className?: string;
  options?: SelectOption[];
}

function Input({
  initialValue = '',
  initialValid = false,
  id,
  onInput,
  validators,
  element: elementType,
  type = 'text',
  placeholder,
  rows = 3,
  label,
  errorText,
  className,
  options, // NEW — array of { value, label } for element="select"
}: InputProps) {
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: initialValue,
    isTouched: false,
    isValid: initialValid,
  });

  const { value, isValid, isTouched } = inputState;

  useEffect(() => {
    onInput(id, value, isValid);
  }, [id, value, isValid, onInput]);

  const changeHandler = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    dispatch({
      type: 'CHANGE',
      val: event.target.value,
      validators: validators,
    });
  };

  const touchHandler = (_event: FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    dispatch({
      type: 'TOUCH',
    });
  };

  const isInvalid = !isValid && isTouched;

  const baseInputClasses = 'block w-full font-inherit p-[0.15rem_0.25rem] border outline-none transition-colors duration-200';
  const normalInputClasses = 'border-[#ccc] bg-[#f8f8f8] focus:bg-[#ebebeb] focus:border-[#510077]';
  const invalidInputClasses = 'border-red-500 bg-[#ccccc]';

  const computedInputClasses = cn(
    baseInputClasses,
    isInvalid ? invalidInputClasses : normalInputClasses,
    className
  );

  let inputElement;
  if (elementType === 'input') {
    inputElement = (
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={value}
        className={computedInputClasses}
      />
    );
  } else if (elementType === 'select') {
    inputElement = (
      <select
        id={id}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={value}
        className={computedInputClasses}
      >
        <option value="" disabled>
          {placeholder || 'Select...'}
        </option>
        {options &&
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
    );
  } else {
    inputElement = (
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={value}
        className={computedInputClasses}
      />
    );
  }

  return (
    <div className="my-4">
      <label
        htmlFor={id}
        className={`block font-bold mb-2 ${isInvalid ? 'text-red-500' : 'text-gray-900'}`}
      >
        {label}
      </label>
      {inputElement}
      {isInvalid && <p className="text-red-500 block mt-1">{errorText}</p>}
    </div>
  );
}

export default Input;
