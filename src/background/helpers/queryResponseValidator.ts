export const queryResponseValidator = (
  response: any,
  fieldTypes: Map<string, any>
): any => {
  if (typeof response !== "object") {
    return { errors: [], fieldNotFound: [] };
  }

  if(response === ""){
    return {errors: [], fieldNotFound: []}
  }

  const responseTypeMap: Map<string, string> = new Map();

  const getResponseFieldMap = (obj: any) => {
    Object.keys(obj).forEach((key) => {
      if (Array.isArray(obj[key])) {
        responseTypeMap.set(key, `array`);
        if (obj[key].length > 0 && typeof obj[key][0] !== "object") {
        } else if (obj[key].length > 0) {
          getResponseFieldMap(obj[key][0]);
        }
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        responseTypeMap.set(key, String(typeof obj[key]));
        getResponseFieldMap(obj[key]);
      } else {
        responseTypeMap.set(key, String(typeof obj[key]));
      }
    });
  };

  getResponseFieldMap(response);
  const errors: string[] = [];

  const fieldNotFound: string[] = [];
  responseTypeMap.forEach((value, key) => {
    if (value.startsWith("[")) {
      if (fieldTypes.has(key)) {
        const fieldValue = fieldTypes.get(key);
        if (typeof fieldValue === "string" && fieldValue.charAt(0) !== "[") {
          errors.push(`${key} must be an array`);
        }
      } else {
        fieldNotFound.push(key);
      }
    } else {
      if (fieldTypes.has(key)) {
        let fieldValue = fieldTypes.get(key);
        if (typeof fieldValue === "string") {
          fieldValue = fieldValue.toLowerCase();
          if (fieldValue === "int" || fieldValue === "float") {
            fieldValue = "number";
          } else if (
            fieldValue === "id" ||
            fieldValue === "date" ||
            fieldValue === "url"
          ) {
            fieldValue = "string";
          } else if (fieldValue !== "boolean" && fieldValue !== "string") {
            if (fieldValue.startsWith("[")) fieldValue = "array";
            else {
              fieldValue = "object";
            }
          }
          if (fieldValue !== value) {
            errors.push(
              `${key} must be a ${fieldValue} and you provided a ${value}`
            );
          }
        }
      } else {
        fieldNotFound.push(key);
      }
    }
  })
  return { errors: errors, fieldNotFound: fieldNotFound };
};
