import { useContext } from "react";

import { ErrorType } from "../../../shared";

import { DictionaryContext } from "./context";

export function useDictionary() {
  const dictionaryContext = useContext(DictionaryContext);

  if (!dictionaryContext) throw new Error(ErrorType.ContextIsOutOfProvider);

  return dictionaryContext;
}
