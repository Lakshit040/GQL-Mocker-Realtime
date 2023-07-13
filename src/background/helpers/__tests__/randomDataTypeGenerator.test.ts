import { dynamicValueGenerator } from "../randomDataTypeGenerator";

describe('dynamicValueGenerator function', () => {
  const mockEnumTypes = new Map<string, any>();
  const mockDataSet = {
    stringLength: 5,
    arrayLength: 5,
    numberStart: 1,
    numberEnd: 10,
    digitsAfterDecimal: 2,
    booleanValues: "TRUE",
    isSpecialAllowed: true
  };

  mockEnumTypes.set('TestEnum', ['A', 'B', 'C']);

  it('should generate a string for type "String"', () => {
    const result = dynamicValueGenerator('String', mockEnumTypes, mockDataSet, 'name');
    expect(typeof result).toBe('string');
  });

  it('should generate a number for type "Int"', () => {
    const result = dynamicValueGenerator('Int', mockEnumTypes, mockDataSet, 'age');
    expect(typeof result).toBe('number');
  });

  it('should generate a unique string for type "ID"', () => {
    const result = dynamicValueGenerator('ID', mockEnumTypes, mockDataSet, 'id');
    expect(typeof result).toBe('string');
  });

  it('should generate a float for type "Float"', () => {
    const result = dynamicValueGenerator('Float', mockEnumTypes, mockDataSet, 'price');
    expect(typeof result).toBe('number');
  });

  it('should generate a boolean for type "Boolean"', () => {
    const result = dynamicValueGenerator('Boolean', mockEnumTypes, mockDataSet, 'active');
    expect(typeof result).toBe('boolean');
  });

  it('should generate an array for an array type', () => {
    const result = dynamicValueGenerator('[String]', mockEnumTypes, mockDataSet, 'names');
    expect(Array.isArray(result)).toBe(true);
  });

  it('should generate a valid enum value for an enum type', () => {
    const result = dynamicValueGenerator('TestEnum', mockEnumTypes, mockDataSet, 'enumValue');
    expect(mockEnumTypes.get('TestEnum')).toContain(result);
  });

  it('should generate a string for an unknown type', () => {
    const result = dynamicValueGenerator('UnknownType', mockEnumTypes, mockDataSet, 'unknown');
    expect(typeof result).toBe('string');
  });
});
