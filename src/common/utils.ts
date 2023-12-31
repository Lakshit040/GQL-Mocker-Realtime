import gql from "graphql-tag";
import jsep from "jsep";
import { isEqual } from "lodash";
import { GraphQLOperationType } from "./types";
import { CONDITION_REGEX, OBJECT_REGEX, ARRAY_REGEX } from "./regex";

export const parseIfGraphQLRequest = (
  config: any
): [GraphQLOperationType, string, string, object] | undefined => {
  const body = config.body;
  if (body === undefined) {
    return undefined;
  }
  try {
    const bodyObject = JSON.parse(body);

    let operationType = GraphQLOperationType.Query;
    let operationName: string | undefined = bodyObject.operationName;
    const query: string = bodyObject.query ?? "";
    const variables: object = bodyObject.variables ?? {};

    if (query !== "") {
      const { definitions } = gql(query);
      const firstDefinition =
        definitions.length > 0 ? definitions[0] : undefined;
      if (
        firstDefinition !== undefined &&
        firstDefinition.kind === "OperationDefinition"
      ) {
        operationType =
          firstDefinition.operation === "query"
            ? GraphQLOperationType.Query
            : GraphQLOperationType.Mutation;
        operationName = operationName ?? firstDefinition.name?.value;
      }
    }

    if (operationName !== undefined) {
      return [operationType, operationName, query, variables];
    }
  } catch (err) {}

  return undefined;
};

const helper = (str: string, values: any): string => {
  const matches = str.match(CONDITION_REGEX)!;
  const extractedConditions = matches.map((match) =>
    match.replace(/[()]/g, "").trim()
  );

  extractedConditions.forEach((condition, index) => {
    for (const [key, value] of Object.entries(values)) {
      if (Array.isArray(value)) {
        if (condition.includes(key))
          try {
            const match = condition.match(ARRAY_REGEX);
            if (match && match[1] && match[2]) {
              let result: boolean;
              if (match[1] === "==" || match[1] === "===") {
                result = isEqual(value, JSON.parse(match[2]));
              } else result = !isEqual(value, JSON.parse(match[2]));
              str = str.replace(condition, String(result));
            }
          } catch {
            str = str.replace(condition, String(false));
          }
      } else if (typeof value === "object") {
        if (condition.includes(key))
          try {
            const match = condition.match(OBJECT_REGEX);
            let result = false;
            if (match && match[1] && match[2]) {
              if (match[1] === "==" || match[1] === "===")
                result = isEqual(value, JSON.parse(match[2]));
              else result = !isEqual(value, JSON.parse(match[2]));
            }
            str = str.replace(condition, String(result));
          } catch {
            str = str.replace(condition, String(false));
          }
      }
    }
  });
  return str;
};

export const doesMockingRuleHold = (
  dynamicExpression: string,
  variableValues: any
): boolean => {
  dynamicExpression = dynamicExpression.trim();
  if (dynamicExpression === "*") {
    return true;
  }
  if (dynamicExpression === "") {
    return false;
  }
  try {
    const ast = jsep(helper(dynamicExpression, variableValues));
    const evaluate = (node: any): any => {
      switch (node.type) {
        case "BinaryExpression":
          return evalBinaryExpression(node);
        case "Literal":
          return node.value;
        case "Identifier":
          return variableValues[node.name];
        default:
          return undefined;
      }
    };

    const evalBinaryExpression = (node: any): any => {
      const left = evaluate(node.left);
      const right = evaluate(node.right);

      switch (node.operator) {
        case "==" || "===":
          return left == right;
        case "!=" || "!==":
          return left != right;
        case "&&":
          return left && right;
        case "||":
          return left || right;
        case ">=":
          return left >= right;
        case "<=":
          return left <= right;
        case "<":
          return left < right;
        case ">":
          return left > right;
        default:
          return false;
      }
    };
    return evaluate(ast);
  } catch {
    return false;
  }
};
