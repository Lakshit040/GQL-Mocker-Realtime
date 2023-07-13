import {
  readFromSessionStorage,
  writeToSessionStorage,
  deleteFromSessionStorage,
} from "../../../common/chromeStorageHelpers";
import {
  getSchema,
  storeSchema,
  getQueryEndpoint,
  storeQueryEndpoint,
  removeQueryEndpoint,
} from "../../helpers/chromeStorageOptions";

jest.mock("../../../common/chromeStorageHelpers");

describe("Chrome Storage Helpers", () => {
  beforeEach(() => {
    (readFromSessionStorage as jest.Mock).mockClear();
    (writeToSessionStorage as jest.Mock).mockClear();
    (deleteFromSessionStorage as jest.Mock).mockClear();
  });

  it("getSchema should call readFromSessionStorage with correct parameters", async () => {
    await getSchema("testHost", "testPath");
    expect(readFromSessionStorage).toHaveBeenCalledWith(
      "CACHED_SCHEMA",
      "testHost_testPath"
    );
  });

  it("storeSchema should call writeToSessionStorage with correct parameters", async () => {
    await storeSchema("testHost", "testPath", "testSchema");
    expect(writeToSessionStorage).toHaveBeenCalledWith(
      "CACHED_SCHEMA",
      "testHost_testPath",
      "testSchema"
    );
  });
});
