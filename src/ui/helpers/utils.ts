import {
  MessageType,
  GraphQLOperationType,
  DynamicComponentData,
} from "../../common/types";

export const backgroundBindMock = (
  id: string,
  operationType: GraphQLOperationType,
  operationName: string
): void => {
  if (operationName === "") return;
  const { tabId } = chrome.devtools.inspectedWindow;
  chrome.runtime.sendMessage({
    type: MessageType.BindMock,
    data: { tabId, id, operationType, operationName },
  });
};

export const backgroundUnbindMock = (id: string) => {
  const { tabId } = chrome.devtools.inspectedWindow;
  chrome.runtime.sendMessage({
    type: MessageType.UnbindMock,
    data: { tabId, id },
  });
};

export const backgroundSetMockResponse = (
  id: string,
  dynamicComponentId: string,
  dynamicComponentData: DynamicComponentData
): void => {
  const { tabId } = chrome.devtools.inspectedWindow;
  chrome.runtime.sendMessage({
    type: MessageType.SetMockRule,
    data: {
      tabId,
      id,
      dynamicComponentId,
      dynamicComponentData,
    },
  });
};

export const backgroundUnSetMockResponse = (
  id: string,
  dynamicComponentId: string
): void => {
  const { tabId } = chrome.devtools.inspectedWindow;
  chrome.runtime.sendMessage({
    type: MessageType.UnSetMockRule,
    data: { tabId, id, dynamicComponentId },
  });
};
