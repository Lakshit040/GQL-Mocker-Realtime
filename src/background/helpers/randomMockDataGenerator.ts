import {
  SelectionSetNode,
  FragmentDefinitionNode,
  DocumentNode,
  OperationDefinitionNode,
} from "graphql";
import { DataSet } from "./randomDataTypeGenerator";
import { times } from "lodash";
import { dynamicValueGenerator } from "./randomDataTypeGenerator";

const giveRandomResponse = (
  queryDocument: DocumentNode,
  fieldTypes: Map<string, any>,
  enumTypes: Map<string, string[]>,
  unionTypes: Map<string, any>,
  interfaceTypes: Map<string, any>,
  dataSet: DataSet
) => {
  let fieldNotFound: string = "";
  const generateMockResponse = (
    selectionSet: SelectionSetNode,
    typeMap: Map<string, any>
  ) => {
    const response: any = {};
    let inlineFragmentProcessed: boolean = false;
    for (const field of selectionSet.selections) {
      if (field.kind === "InlineFragment") {
        if (inlineFragmentProcessed) continue;
        const fragmentResponse = generateMockResponse(
          field.selectionSet!,
          typeMap
        );
        for (const fragmentKey in fragmentResponse) {
          response[fragmentKey] = fragmentResponse[fragmentKey];
        }
        inlineFragmentProcessed = true;
      } else if (field.kind === "FragmentSpread") {
        const fragmentName = field.name.value;
        const fragmentResponse = generateMockResponse(
          typeMap.get(fragmentName).selectionSet,
          typeMap
        );
        for (const fragmentKey in fragmentResponse) {
          response[fragmentKey] = fragmentResponse[fragmentKey];
        }
      } else {
        if (field.name.value.startsWith("__")) continue;

        if (!typeMap.has(field.name.value)) {
          fieldNotFound = field.name.value;
          return {};
        }
        const typeName = typeMap.get(field.name.value);

        if ("selectionSet" in field && field.selectionSet !== undefined) {
          if (typeName?.includes("[")) {
            response[field.name.value] = times(dataSet.arrayLength, () =>
              generateMockResponse(field.selectionSet!, typeMap)
            );
          } else if (unionTypes.has(typeName!)) {
            response[field.name.value] = generateMockResponse(
              field.selectionSet!,
              typeMap
            );
          } else if (interfaceTypes.has(typeName)) {
            response[field.name.value] = generateMockResponse(
              field.selectionSet,
              typeMap
            );
          } else {
            response[field.name.value] = generateMockResponse(
              field.selectionSet!,
              typeMap
            );
          }
        } else {
          if (typeName?.includes("[")) {
            response[field.name.value] = times(dataSet.arrayLength, () =>
              dynamicValueGenerator(
                typeName!.replace("[", "").replace("]", ""),
                enumTypes,
                dataSet,
                field.name.value
              )
            );
          } else {
            response[field.name.value] = dynamicValueGenerator(
              typeName!,
              enumTypes,
              dataSet,
              field.name.value
            );
          }
        }
      }
    }
    return response;
  };

  const addFragmentToTypeMap = (fragment: FragmentDefinitionNode) => {
    const fragmentName = fragment.name.value;
    fieldTypes.set(fragmentName, fragment);
  };

  const generateNestedMockResponse = (
    queryDocument: DocumentNode,
    typeMap: Map<string, any>
  ): any => {
    const fragments = queryDocument.definitions.filter(
      (def) => def.kind === "FragmentDefinition"
    );

    fragments.forEach((fragment) => {
      addFragmentToTypeMap(fragment as FragmentDefinitionNode);
    });
    const operationDefinition: OperationDefinitionNode | undefined =
      queryDocument.definitions.find(
        (def) => def.kind === "OperationDefinition"
      ) as OperationDefinitionNode;

    if (!operationDefinition) {
      return {};
    }
    if (
      operationDefinition.operation === "query" ||
      operationDefinition.operation === "mutation"
    ) {
      return generateMockResponse(operationDefinition.selectionSet, typeMap);
    }
    return {};
  };

  const generatedResponse = generateNestedMockResponse(
    queryDocument,
    fieldTypes
  );
  if (fieldNotFound.length > 0) {
    return fieldNotFound;
  }
  return generatedResponse;
};

export default giveRandomResponse;
