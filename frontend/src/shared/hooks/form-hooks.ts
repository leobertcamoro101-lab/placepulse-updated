import { useCallback, useReducer } from 'react';

export interface InputState {
  value: string | File | undefined;
  isValid: boolean;
}

interface FormState {
  inputs: Record<string, InputState>;
  isValid: boolean;
}

type FormAction =
  | { type: 'INPUT_CHANGE'; inputId: string; value: string | File | undefined; isValid: boolean }
  | { type: 'SET_DATA'; inputs: Record<string, InputState>; formIsValid: boolean };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'INPUT_CHANGE': {
      let overallFormIsValid = true;

      for (const id in state.inputs) {
        if (!state.inputs[id]) continue;

        if (id === action.inputId) {
          overallFormIsValid = overallFormIsValid && action.isValid;
        } else {
          overallFormIsValid = overallFormIsValid && state.inputs[id].isValid;
        }
      }

      return {
        ...state,
        inputs: {
          ...state.inputs,
          [action.inputId]: { value: action.value, isValid: action.isValid },
        },
        isValid: overallFormIsValid,
      };
    }
    case 'SET_DATA':
      return {
        inputs: action.inputs,
        isValid: action.formIsValid,
      };
    default:
      return state;
  }
};

export const useForm = (
  initialInputs: Record<string, InputState>,
  initialFormValidity: boolean
) => {
  const [formState, dispatch] = useReducer(formReducer, {
    inputs: initialInputs,
    isValid: initialFormValidity,
  });

  const inputHandler = useCallback((id: string, value: string | File | undefined, isValid: boolean) => {
    dispatch({
      type: 'INPUT_CHANGE',
      inputId: id,
      value,
      isValid,
    });
  }, []);

  const setFormData = useCallback(
    (inputData: Record<string, InputState>, formValidity: boolean) => {
      dispatch({
        type: 'SET_DATA',
        inputs: inputData,
        formIsValid: formValidity,
      });
    },
    []
  );

  return [formState, inputHandler, setFormData] as const;
};