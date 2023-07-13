import { parse } from 'graphql';
import giveRandomResponse from '../randomMockDataGenerator';

describe('giveRandomResponse function', () => {

  const mockFieldTypes: Map<string, any> = new Map();
  mockFieldTypes.set('name', 'String');
  mockFieldTypes.set('age', 'Int');
  mockFieldTypes.set('address', 'Object');
  mockFieldTypes.set('active', 'Boolean');
  mockFieldTypes.set('scores', '[Float]');

  const mockEnumTypes = new Map();
  const mockUnionTypes = new Map();
  const mockInterfaceTypes = new Map();

  const mockDataSet = {
    stringLength: 5,
    arrayLength: 3,
    numberStart: 1,
    numberEnd: 100,
    digitsAfterDecimal: 2,
    booleanValues: "TRUE",
    isSpecialAllowed: false,
  };

  it('should correctly handle Query operation', () => {
    const queryString = `
      query {
        user {
          name
          age
          address
          active
          scores
        }
      }
    `;

    const documentNode = parse(queryString);

    const result = giveRandomResponse(documentNode, mockFieldTypes, mockEnumTypes, mockUnionTypes, mockInterfaceTypes, mockDataSet);
    if(typeof result === "object"){
      expect(typeof result.user.name).toBe('string');
      expect(typeof result.user.age).toBe('number');
      expect(typeof result.user.address).toBe('object');
      expect(typeof result.user.active).toBe('boolean');
      expect(Array.isArray(result.user.scores)).toBe(true);
    }
    
  });

  it('should correctly handle Mutation operation', () => {
    const mutationString = `
      mutation {
        updateUser(id: 1, data: {
          name: "New Name"
          age: 25
        }) {
          name
          age
          address
          active
          scores
        }
      }
    `;

    const documentNode = parse(mutationString);

    const result = giveRandomResponse(documentNode, mockFieldTypes, mockEnumTypes, mockUnionTypes, mockInterfaceTypes, mockDataSet);
    if(typeof result === "object"){
      expect(typeof result.updateUser.name).toBe('string');
      expect(typeof result.updateUser.age).toBe('number');
      expect(typeof result.updateUser.address).toBe('object');
      expect(typeof result.updateUser.active).toBe('boolean');
      expect(Array.isArray(result.updateUser.scores)).toBe(true);
    }
    
  });

});
