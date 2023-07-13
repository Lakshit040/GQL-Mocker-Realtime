import { MessageType } from "../common/types";
import { v4 as uuidv4 } from "uuid";

interface CapturedResponse {
  response: string | null;
  statusCode: number;
}

interface MockResponseEventDetail {
  requestId: string;
  response: string | null;
  statusCode: number;
}

interface DoFetchEventDetail {
  requestId: string;
  data: {
    url: string;
    body: string;
    originalRequestId: string;
  };
}

interface CapturedRequestConfig {
  config?: RequestInit;
}

const capturedRequests = new Map();
const capturedRequestConfigs: Map<string, CapturedRequestConfig> = new Map();

const capture = (path: string, config?: RequestInit) => {
  return new Promise<CapturedResponse>((resolve, reject) => {
    if (!/.*graphql.*/.test(path) || config?.method?.toLowerCase() !== "post")
      return reject();

    const requestId = uuidv4();
    capturedRequests.set(requestId, [resolve, reject]);
    capturedRequestConfigs.set(requestId, { config });

    const message = {
      type: MessageType.RequestIntercepted,
      data: {
        host: window.location.origin,
        path,
        config: JSON.parse(JSON.stringify(config)),
        requestId,
      },
    };
    const event = new CustomEvent("request-intercepted", {
      detail: { data: message, requestId },
    });
    window.dispatchEvent(event);
  });
};

// Capture fetch requests
const __oldFetch__: (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response> = window.fetch;
window.fetch = (req, config = undefined) => {
  return capture(req as string, config)
    .then(({ response, statusCode }) => {
      return new Response(response, {
        headers:
          config?.headers !== undefined
            ? JSON.parse(JSON.stringify(config?.headers))
            : new Headers([]),
        status: statusCode,
      });
    })
    .catch(() => __oldFetch__(req, config));
};

window.addEventListener("mock-response", (event) => {
  const { requestId, response, statusCode } = (event as any)
    .detail as MockResponseEventDetail;
  if (!capturedRequests.has(requestId)) return;

  const [resolve, reject] = capturedRequests.get(requestId);

  if (response) {
    resolve({ response, statusCode });
  } else {
    reject();
  }

  capturedRequests.delete(requestId);
  capturedRequestConfigs.delete(requestId);
});

window.addEventListener("do-fetch", async (event) => {
  const { requestId, data } = (event as any).detail as DoFetchEventDetail;
  const { url, body, originalRequestId } = data;

  const requestConfig = capturedRequestConfigs.get(originalRequestId)?.config;

  if (requestConfig !== undefined) {
    const requestConfigCopy = { ...requestConfig };
    requestConfigCopy.body = body;

    const response = await __oldFetch__(url, requestConfigCopy);
    const responseJSON = await response.json();

    const reply = new CustomEvent("fetch-response", {
      detail: { requestId, data: responseJSON },
    });
    window.dispatchEvent(reply);
  } else {
    window.dispatchEvent(
      new CustomEvent("fetch-response", {
        detail: {
          requestId,
          data: {
            error: "ERROR_FETCHING_DATA",
          },
        },
      })
    );
  }

  capturedRequestConfigs.delete(originalRequestId);
});
