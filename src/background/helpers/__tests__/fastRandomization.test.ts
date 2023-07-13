import { fastRandomize } from '../fastRandomization';
import { getQueryEndpoint, getSchema } from '../chromeStorageOptions';


const mockedGetQueryEndpoint = getQueryEndpoint as jest.MockedFunction<typeof getQueryEndpoint>;
const mockedGetSchema = getSchema as jest.MockedFunction<typeof getSchema>;

jest.mock('../chromeStorageOptions');

describe('fastRandomize', () => {
  beforeEach(() => {

    mockedGetQueryEndpoint.mockClear();
    mockedGetSchema.mockClear();
  });

  it('should return undefined when getQueryEndpoint returns undefined', async () => {
    mockedGetQueryEndpoint.mockResolvedValueOnce(undefined);
    expect(await fastRandomize(1, 'testId')).toBeUndefined();
  });

  it('should return undefined when getSchema returns undefined', async () => {
    mockedGetQueryEndpoint.mockResolvedValueOnce('query__endpoint');
    mockedGetSchema.mockResolvedValueOnce(undefined);
    expect(await fastRandomize(1, 'testId')).toBeUndefined();
  });

  it('should return error response when query parsing fails', async () => {
    mockedGetQueryEndpoint.mockResolvedValueOnce('invalid query__endpoint');
    mockedGetSchema.mockResolvedValueOnce('type Query { name: String }');
    const result = await fastRandomize(1, 'testId');
    expect(result.message).toBe('ERROR_GENERATING_RANDOM_RESPONSE');
  });

  it('should return success response when query parsing is successful', async () => {
    mockedGetQueryEndpoint.mockResolvedValueOnce('query { name }__endpoint');
    mockedGetSchema.mockResolvedValueOnce('type Query { name: String }');
    const result = await fastRandomize(1, 'testId');
    expect(result.message).toBe('SUCCESS');
    expect(typeof result.data.name).toBe('string');
  });
});
