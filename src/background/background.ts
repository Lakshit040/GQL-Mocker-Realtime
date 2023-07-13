import { parseIfGraphQLRequest, doesMockingRuleHold } from "../common/utils";
import {
  MessageType,
  GraphQLOperationType,
  DynamicComponentData,
} from "../common/types";
import { generateRandomizedResponse } from "./helpers/randomMockResponseGenerator";
import {
  getInvMockBinding,
  storeInvMockBinding,
  deleteInvMockBinding,
  getMockBinding,
  storeMockBinding,
  deleteMockBinding,
  getMockRules,
  storeMockRule,
  deleteMockRule,
  deleteMockRules,
  storeQueryEndpoint,
  getPreviousResponses
} from "./helpers/chromeStorageOptions";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case MessageType.RequestIntercepted: {
      const tabId = sender.tab?.id;
      const frameId = sender.frameId;
      const { host, path, config, requestId } = msg.data;
      handleInterceptedRequest(
        tabId,
        frameId,
        host,
        path,
        config,
        requestId,
        sendResponse
      );
      const isResponseAsync = true;
      return isResponseAsync;
    }
    case MessageType.BindMock: {
      const { tabId, id, operationType, operationName } = msg.data;
      bindMock(tabId, id, operationType, operationName);
      break;
    }
    case MessageType.UnbindMock: {
      const { tabId, id } = msg.data;
      unbindMock(tabId, id);
      break;
    }
    case MessageType.SetMockRule: {
      const { tabId, id, dynamicComponentId, dynamicComponentData } = msg.data;
      setMockRule(tabId, id, dynamicComponentId, dynamicComponentData);
      break;
    }
    case MessageType.UnSetMockRule: {
      const { tabId, id, dynamicComponentId } = msg.data;
      unSetMockRule(tabId, id, dynamicComponentId);
      break;
    }
    case MessageType.GetItems :{
      
    }
  }

  const isResponseAsync = false;
  return isResponseAsync;
});

const handleInterceptedRequest = async (
  tabId: number | undefined,
  frameId: number | undefined,
  host: string,
  path: string,
  config: any,
  requestId: string,
  sendResponse: (response?: any) => void
): Promise<void> => {
  const reject = () => sendResponse({ response: null, statusCode: 200 });
  const resolve = (response: string, statusCode: number) =>
    sendResponse({ response, statusCode });

  if (tabId === undefined || frameId === undefined) {
    reject();
    return;
  }

  const parsed = parseIfGraphQLRequest(config);
  if (parsed === undefined) {
    reject();
    return;
  }

  const [operationType, operationName, query, variables] = parsed;
  const key = `${operationType}_${operationName}`;

  const mockId = await getMockBinding(tabId, key);
  if (mockId === undefined) {
    reject();
    return;
  }

  const mockResponseConfig = await getMockRules(tabId, mockId);
  for (const mockingRuleKey in mockResponseConfig) {
    const mockingRule = mockResponseConfig[mockingRuleKey];
    if (!mockingRule.enabled) continue;
    await storeQueryEndpoint(tabId, mockingRuleKey, query, host, path);
    if (doesMockingRuleHold(mockingRule.dynamicExpression, variables)) {
      if (query === "" && mockingRule.shouldRandomizeResponse) {
        reject();
        // TODO: notify frontend
        return;
      }
      const generatedRandomResponse = await generateRandomizedResponse(
        tabId,
        frameId,
        host,
        path,
        config,
        requestId,
        query,
        mockingRule.numberRangeStart,
        mockingRule.numberRangeEnd,
        mockingRule.specialCharactersAllowed,
        mockingRule.arrayLength,
        mockingRule.stringLength,
        mockingRule.booleanType,
        mockingRule.afterDecimals,
        mockingRule.mockResponse,
        mockingRule.shouldRandomizeResponse
      );
      if (mockingRule.responseDelay > 0) {
        setTimeout(
          () =>
            resolve(
              JSON.stringify(generatedRandomResponse, null, 2),
              mockingRule.statusCode
            ),
          mockingRule.responseDelay
        );
      } else {
        resolve(
          JSON.stringify(generatedRandomResponse, null, 2),
          mockingRule.statusCode
        );
      }

      return;
    }
  }

  reject();
};

const bindMock = async (
  tabId: number,
  id: string,
  operationType: GraphQLOperationType,
  operationName: string
): Promise<void> => {
  const prev = await getInvMockBinding(tabId, id);
  if (prev !== undefined) {
    await deleteMockBinding(tabId, prev);
  }

  await storeMockBinding(tabId, `${operationType}_${operationName}`, id);
  await storeInvMockBinding(tabId, id, `${operationType}_${operationName}`);
};

const unbindMock = async (tabId: number, id: string): Promise<void> => {
  const prev = await getInvMockBinding(tabId, id);
  if (prev !== undefined) {
    await deleteMockBinding(tabId, prev);
  }
  await deleteInvMockBinding(tabId, id);
  await deleteMockRules(tabId, id);
};

const setMockRule = async (
  tabId: number,
  id: string,
  dynamicComponentId: string,
  dynamicComponentData: DynamicComponentData
): Promise<void> => {
  await storeMockRule(tabId, id, dynamicComponentId, dynamicComponentData);
};

const unSetMockRule = async (
  tabId: number,
  id: string,
  dynamicComponentId: string
): Promise<void> => {
  await deleteMockRule(tabId, id, dynamicComponentId);
};

const addResponseToHistory = async () :Promise<void> => {
  const items = await getPreviousResponses();
}