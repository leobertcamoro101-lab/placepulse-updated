import { useCallback, useReducer } from 'react';

const formReducer = (state, { type, inputId, value, isValid, inputs, formIsValid }) => {
  switch (type) {
    case 'INPUT_CHANGE': {
      let overallFormIsValid = true;
      
      for (const id in state.inputs) {
        if (!state.inputs[id]) continue;
        
        if (id === inputId) {
          overallFormIsValid = overallFormIsValid && isValid;
        } else {
          overallFormIsValid = overallFormIsValid && state.inputs[id].isValid;
        }
      }
      
      return {
        ...state,
        inputs: {
          ...state.inputs,
          [inputId]: { value, isValid }
        },
        isValid: overallFormIsValid
      };
    }
    case 'SET_DATA':
      return {
        inputs,
        isValid: formIsValid
      };
    default:
      return state;
  }
};

export const useForm = (initialInputs, initialFormValidity) => {
  const [formState, dispatch] = useReducer(formReducer, {
    inputs: initialInputs,
    isValid: initialFormValidity
  });

  const inputHandler = useCallback((id, value, isValid) => {
    dispatch({
      type: 'INPUT_CHANGE',
      inputId: id,
      value,
      isValid
    });
  }, []);

  const setFormData = useCallback((inputData, formValidity) => {
    dispatch({
      type: 'SET_DATA',
      inputs: inputData,
      formIsValid: formValidity
    });
  }, []);

  return [formState, inputHandler, setFormData];
};


// import { useCallback, useReducer } from 'react';

// const formReducer = (state, action) => {
//   switch (action.type) {
//     case 'INPUT_CHANGE':
//       let formIsValid = true;
//       for (const inputId in state.inputs) {
//         if (!state.inputs[inputId]) {
//           continue;
//         }
//         if (inputId === action.inputId) {
//           formIsValid = formIsValid && action.isValid;
//         } else {
//           formIsValid = formIsValid && state.inputs[inputId].isValid;
//         }
//       }
//       return {
//         ...state,
//         inputs: {
//           ...state.inputs,
//           [action.inputId]: { value: action.value, isValid: action.isValid }
//         },
//         isValid: formIsValid
//       };
//     case 'SET_DATA':
//       return {
//         inputs: action.inputs,
//         isValid: action.formIsValid
//       };
//     default:
//       return state;
//   }
// };

// export const useForm = (initialInputs, initialFormValidity) => {
//   const [formState, dispatch] = useReducer(formReducer, {
//     inputs: initialInputs,
//     isValid: initialFormValidity
//   });

//   const inputHandler = useCallback((id, value, isValid) => {
//     dispatch({
//       type: 'INPUT_CHANGE',
//       value: value,
//       isValid: isValid,
//       inputId: id
//     });
//   }, []);

//   const setFormData = useCallback((inputData, formValidity) => {
//     dispatch({
//       type: 'SET_DATA',
//       inputs: inputData,
//       formIsValid: formValidity
//     });
//   }, []);

//   return [formState, inputHandler, setFormData];
// };