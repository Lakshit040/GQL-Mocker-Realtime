import {
  readFromSessionStorage,
  writeToSessionStorage,
  deleteFromSessionStorage,
} from "../../common/chromeStorageHelpers";
import { DynamicComponentData, StoredResponse} from "../../common/types";

const Namespaces = {
  CachedSchema: "CACHED_SCHEMA",
  QueryEndpoint: "QUERY_ENDPOINT",
  MockBinding: "MOCK_BINDING",
  InvMockBinding: "INV_MOCK_BINDING",
  MockRulesList: "MOCK_RULES_LIST",
  MockRule: "MOCK_RULE",
  ResponseHistory: "RESPONSE_HISTORY"
};

export const getSchema = async (endpointHost: string, endpointPath: string) => {
  return await readFromSessionStorage(
    Namespaces.CachedSchema,
    `${endpointHost}_${endpointPath}`
  );
};

export const storeSchema = async (
  endpointHost: string,
  endpointPath: string,
  schemaString: string
) => {
  await writeToSessionStorage(
    Namespaces.CachedSchema,
    `${endpointHost}_${endpointPath}`,
    schemaString
  );
};

export const getQueryEndpoint = async (tabId: number, expressionId: string) => {
  return await readFromSessionStorage(
    Namespaces.QueryEndpoint,
    `${tabId}_${expressionId}`
  );
};

export const storeQueryEndpoint = async (
  tabId: number,
  expressionId: string,
  query: string,
  origin: string,
  path: string
) => {
  await writeToSessionStorage(
    Namespaces.QueryEndpoint,
    `${tabId}_${expressionId}`,
    `${query}__${origin}__${path}`
  );
};

export const removeQueryEndpoint = async (
  tabId: number,
  expressionId: string
) => {
  await deleteFromSessionStorage(
    Namespaces.QueryEndpoint,
    `${tabId}_${expressionId}`
  );
};

export const getMockBinding = async (tabId: number, key: string) => {
  return await readFromSessionStorage(
    Namespaces.MockBinding,
    `${tabId}_${key}`
  );
};

export const storeMockBinding = async (
  tabId: number,
  key: string,
  id: string
) => {
  await writeToSessionStorage(Namespaces.MockBinding, `${tabId}_${key}`, id);
};

export const deleteMockBinding = async (tabId: number, key: string) => {
  await deleteFromSessionStorage(Namespaces.MockBinding, `${tabId}_${key}`);
};

export const getInvMockBinding = async (tabId: number, id: string) => {
  return await readFromSessionStorage(
    Namespaces.InvMockBinding,
    `${tabId}_${id}`
  );
};

export const storeInvMockBinding = async (
  tabId: number,
  id: string,
  key: string
) => {
  await writeToSessionStorage(Namespaces.InvMockBinding, `${tabId}_${id}`, key);
};

export const deleteInvMockBinding = async (tabId: number, id: string) => {
  await deleteFromSessionStorage(Namespaces.InvMockBinding, `${tabId}_${id}`);
};

export const getMockRulesList = async (
  tabId: number,
  id: string
): Promise<string[]> => {
  return (
    (await readFromSessionStorage(
      Namespaces.MockRulesList,
      `${tabId}_${id}`
    )) ?? []
  );
};

export const storeMockRulesListItem = async (
  tabId: number,
  id: string,
  dynamicComponentId: string
) => {
  const mockRulesList = await getMockRulesList(tabId, id);
  if (!mockRulesList.includes(dynamicComponentId)) {
    mockRulesList.push(dynamicComponentId);
    await writeToSessionStorage(
      Namespaces.MockRulesList,
      `${tabId}_${id}`,
      mockRulesList
    );
  }
};

export const deleteMockRulesListItem = async (
  tabId: number,
  id: string,
  dynamicComponentId: string
) => {
  const mockRulesList = await getMockRulesList(tabId, id);
  await writeToSessionStorage(
    Namespaces.MockRulesList,
    `${tabId}_${id}`,
    mockRulesList.filter((item) => item !== dynamicComponentId)
  );
};

export const deleteMockRulesList = async (tabId: number, id: string) => {
  await deleteFromSessionStorage(Namespaces.MockRulesList, `${tabId}_${id}`);
};

export const getMockRules = async (
  tabId: number,
  id: string
): Promise<Record<string, DynamicComponentData>> => {
  const mockRulesList = await getMockRulesList(tabId, id);
  const mockRules: Record<string, DynamicComponentData> = {};
  for (const dynamicComponentId of mockRulesList) {
    mockRules[dynamicComponentId] = await readFromSessionStorage(
      Namespaces.MockRule,
      `${tabId}_${id}_${dynamicComponentId}`
    );
  }
  return mockRules;
};

export const storeMockRule = async (
  tabId: number,
  id: string,
  dynamicComponentId: string,
  dynamicComponentData: DynamicComponentData
) => {
  await storeMockRulesListItem(tabId, id, dynamicComponentId);
  await writeToSessionStorage(
    Namespaces.MockRule,
    `${tabId}_${id}_${dynamicComponentId}`,
    dynamicComponentData
  );
};

export const deleteMockRule = async (
  tabId: number,
  id: string,
  dynamicComponentId: string
) => {
  await deleteMockRulesListItem(tabId, id, dynamicComponentId);
  await deleteFromSessionStorage(
    Namespaces.MockRule,
    `${tabId}_${id}_${dynamicComponentId}`
  );
};

export const deleteMockRules = async (tabId: number, id: string) => {
  const mockRulesList = await getMockRulesList(tabId, id);
  for (const dynamicComponentId of mockRulesList) {
    await deleteFromSessionStorage(
      Namespaces.MockRule,
      `${tabId}_${id}_${dynamicComponentId}`
    );
  }
  await deleteMockRulesList(tabId, id);
};

export const getPreviousResponses = async () => {
  return new Promise<any>((resolve, reject) => {
    chrome.storage.local.get('responses', (result) => {
      if(chrome.runtime.lastError){
        resolve(undefined);
      }
      else{
        resolve(result['responses'] || []);
      }
    });
  });
}

export const storeInResponseHistory = async (response: StoredResponse) => {
  return new Promise(async (resolve, reject) => {
    let responses = await getPreviousResponses();
    if(responses){
      responses = JSON.parse(responses);
      responses.push(response);
    }
    else{
      responses = [response];
    }
    chrome.storage.local.set({'responses' : JSON.stringify(responses)}, () => {
      console.log('New response stored in local history!!');
    })
  })
}