import { MessageType } from "../common/types";
import { guidGenerator } from "../common/utils";

interface CustomEventDetail {
  requestId: string;
  data: any;
}

const fetchRequestsMap: Map<string, (response?: any) => void> = new Map();

const interceptScript = document.createElement("script");
interceptScript.src = chrome.runtime.getURL("js/inject.js");
document.head.prepend(interceptScript);

window.addEventListener("request-intercepted", (event) => {
  let { data, requestId } = (event as any).detail as CustomEventDetail;
  chrome.runtime.sendMessage(data).then(({ response, statusCode }) => {
    let reply = new CustomEvent("mock-response", {
      detail: { requestId, response, statusCode },
    });
    window.dispatchEvent(reply);
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case MessageType.DoFetch: {
      const requestId = guidGenerator();
      fetchRequestsMap.set(requestId, sendResponse);
      const forward = new CustomEvent("do-fetch", {
        detail: { requestId, data: msg.data },
      });
      window.dispatchEvent(forward);
      break;
    }
  }

  const isResponseAsync = true;
  return isResponseAsync;
});

window.addEventListener("fetch-response", (event) => {
  const { requestId, data } = (event as any).detail as CustomEventDetail;
  const sendResponse = fetchRequestsMap.get(requestId);
  if (sendResponse !== undefined) {
    sendResponse(data);
    fetchRequestsMap.delete(requestId);
  }
});
