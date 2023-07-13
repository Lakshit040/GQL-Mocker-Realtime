import {
  GraphQLInputObjectType,
  isEnumType,
  isUnionType,
  isInputObjectType,
  isInterfaceType,
  isObjectType,
  GraphQLInterfaceType,
} from "graphql";

export const giveTypeMaps = async (typeMap: any) => {
  const processedTypes = new Set();
  const interfaceTypes: Map<string, any> = new Map();
  const fieldTypes: Map<string, any> = new Map();
  const enumTypes: Map<string, string[]> = new Map();
  const unionTypes: Map<string, any> = new Map();

  const addInputFields = (inputType: GraphQLInputObjectType) => {
    if(inputType === null || processedTypes.has(inputType.name)) {
      return;
    }
    processedTypes.add(inputType.name);
    const fields = inputType.getFields();
    Object.values(fields).forEach((field) => {
      if (!inputType.name.startsWith("__")) {
        fieldTypes.set(field.name, String(field.type).replace(/!/g, ""));
      }
      if (field.type !== null && field.type instanceof GraphQLInputObjectType) {
        addInputFields(field.type);
      }
    });
  };

  const addInterfaceFields = (interfaceType: GraphQLInterfaceType) => {
    const fields = interfaceType.getFields();
    Object.values(fields).forEach((field) => {
      if (
        "ofType" in field.type &&
        field.type.ofType !== undefined &&
        "name" in field.type.ofType
      )
        fieldTypes.set(field.name, field.type.ofType.name);
    });
  };

  Object.values(typeMap).forEach((graphQLType: any) => {
    if (isEnumType(graphQLType) && !graphQLType.name.startsWith("__")) {
      enumTypes.set(
        String(graphQLType),
        graphQLType.getValues().map((value) => value.value)
      );
    }
    if (isObjectType(graphQLType)) {
      const fields = graphQLType.getFields();
      Object.values(fields).forEach((field) => {
        if (!graphQLType.name.startsWith("__")) {
          fieldTypes.set(field.name, String(field.type).replace(/!/g, ""));
        }
      });
    }
    if (isInputObjectType(graphQLType)) {
      addInputFields(graphQLType);
    }
    if (isUnionType(graphQLType) && !graphQLType.name.startsWith("__")) {
      unionTypes.set(graphQLType.name, graphQLType);
    }
    if (isInterfaceType(graphQLType) && !graphQLType.name.startsWith("__")) {
      interfaceTypes.set(graphQLType.name, graphQLType);
      addInterfaceFields(graphQLType);
    }
  });
  
  return [fieldTypes, enumTypes, unionTypes, interfaceTypes];
};
