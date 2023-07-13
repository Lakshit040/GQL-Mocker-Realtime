import {
  ALL_CHARACTERS,
  NORMAL_CHARACTERS,
} from "../../common/types";
import {random, uniqueId, sampleSize, times} from "lodash";
import { specificFieldGenerator } from "./specificFieldGenerator";

const stringGenerator = (
  stringLength: number,
  isSpecialAllowed: boolean
): string => {
  return sampleSize(
    isSpecialAllowed ? ALL_CHARACTERS : NORMAL_CHARACTERS,
    stringLength
  ).join("");
};

const intGenerator = (numberFrom: number, numberTo: number): number => {
  return random(numberFrom, numberTo);
};

const floatGenerator = (
  numberFrom: number,
  numberTo: number,
  noOfDecimals: number
): number => {
  return Number(random(numberFrom, numberTo, true).toFixed(noOfDecimals));
};

const booleanGenerator = (booleanValue: string): boolean => {
  return booleanValue === "TRUE"
    ? true
    : booleanValue === "FALSE"
    ? false
    : random() < 0.5;
};


export interface DataSet {
  stringLength: number;
  arrayLength: number;
  numberStart: number;
  numberEnd: number;
  digitsAfterDecimal: number;
  booleanValues: string;
  isSpecialAllowed: boolean;
}

const baseTypes = ["String", "Int", "Float", "Boolean", "Number"];

export const dynamicValueGenerator = (
  dataType: string,
  enumTypes: Map<string, any>,
  dataSet: DataSet,
  fieldName: string
): any => {
  fieldName = fieldName.toLowerCase();

  try {
    if (baseTypes.includes(dataType)) {
      const result = specificFieldGenerator(fieldName);
      if (result !== undefined) {
        return result;
      }
    }
  } catch {}

  dataType = dataType.replace(/!/g, "");
  switch (dataType) {
    case "String":
      return stringGenerator(dataSet.stringLength, dataSet.isSpecialAllowed);
    case "Number":
    case "Int":
      return intGenerator(dataSet.numberStart, dataSet.numberEnd);
    case "ID":
      return uniqueId();
    case "Float":
      return floatGenerator(
        dataSet.numberStart,
        dataSet.numberEnd,
        dataSet.digitsAfterDecimal
      );
    case "Boolean":
      return booleanGenerator(dataSet.booleanValues);
    default: {
      if (dataType.startsWith("[")) {
        return times(dataSet.arrayLength, () =>
          dynamicValueGenerator(
            dataType.replace("[", "").replace("]", ""),
            enumTypes,
            dataSet,
            fieldName
          )
        );
      } else if (enumTypes.has(dataType)) {
        const enumValues = enumTypes.get(dataType)!;
        return enumValues[random(0, enumValues.length - 1)];
      } else {
        return stringGenerator(dataSet.stringLength, dataSet.isSpecialAllowed);
      }
    }
  }
};
