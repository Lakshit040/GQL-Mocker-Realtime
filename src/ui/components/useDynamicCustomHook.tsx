import { useCallback, useReducer, ChangeEvent } from "react";
import { BooleanType } from "../../common/types";

type State = {
  booleanType: string;
  numberStart: string;
  numberEnd: string;
  afterDecimals: string;
  arrayLength: string;
  stringLength: string;
  specialCharactersAllowed: boolean;
  mockResponse: string;
  responseDelay: string;
  statusCode: string;
  shouldRandomizeResponse: boolean;
  dynamicExpression: string;
  enabled: boolean;
};

type Action = {
  type: keyof State;
  payload: State[keyof State];
};

const initialState: State = {
  booleanType: "RANDOM",
  numberStart: "1",
  numberEnd: "1000",
  afterDecimals: "0",
  arrayLength: "4",
  stringLength: "8",
  specialCharactersAllowed: false,
  mockResponse: "",
  responseDelay: "0",
  statusCode: "200",
  shouldRandomizeResponse: false,
  dynamicExpression: "",
  enabled: false,
};

const reducer = (state: State, action: Action) => {
  return {
    ...state,
    [action.type]: action.payload,
  };
};

const useDynamicComponentHook = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleInputChange =
    (property: keyof State) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => {
      const value =
        typeof event === "string"
          ? event
          : event.target instanceof HTMLInputElement
          ? event.target.value
          : event.currentTarget.value;
      dispatch({
        type: property,
        payload: value,
      });
    };

  const handleCheckboxChange = useCallback(
    (type: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
      dispatch({ type, payload: event.target.checked });
    },
    []
  );

  const handleBooleanTypeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const currBooleanValue = event.target.value as keyof typeof BooleanType;
      dispatch({
        type: "booleanType",
        payload: currBooleanValue,
      });
    },
    []
  );

  const handleGenerateResponseHere = useCallback((value: string) => {
    dispatch({ type: "mockResponse", payload: value });
  }, []);

  const handlePrettifyButtonPressed = useCallback(() => {
    try {
      const prettified = JSON.stringify(
        JSON.parse(state.mockResponse),
        null,
        2
      );
      dispatch({ type: "mockResponse", payload: prettified });
    } catch (err) {}
  }, [state.mockResponse]);

  const handleToggleEnabled = useCallback(() => {
    dispatch({ type: "enabled", payload: !state.enabled });
  }, [state.enabled]);

  return {
    ...state,
    handleInputChange,
    handleCheckboxChange,
    handleBooleanTypeChange,
    handleGenerateResponseHere,
    handlePrettifyButtonPressed,
    handleToggleEnabled,
  };
};

export default useDynamicComponentHook;
