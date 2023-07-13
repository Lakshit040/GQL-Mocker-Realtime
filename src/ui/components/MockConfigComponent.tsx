import React, { useCallback, useState, createContext, useEffect } from "react";
import {
  DeleteSVG,
  CreateSVG,
  ChevronUpSVG,
  ChevronDownSVG,
} from "./SvgComponents";
import { v4 as uuidv4 } from "uuid";
import DynamicRowComponent from "./DynamicRowComponent";
import { GraphQLOperationType, DynamicComponentData } from "../../common/types";
import {
  backgroundBindMock,
  backgroundUnbindMock,
  backgroundSetMockResponse,
  backgroundUnSetMockResponse,
} from "../helpers/utils";

import { removeQueryEndpoint } from "../../background/helpers/chromeStorageOptions";
import TableHeadingComponent from "./TableHeadingComponent";
const QUERY = "query";
const MUTATION = "mutation";

interface ContextDynamicComponentProps {
  register: (id: string, dynamicData: DynamicComponentData) => void;
  unregister: (id: string) => void;
  handleAreMockingChange: () => void;
}
export const ContextForDynamicComponents =
  createContext<ContextDynamicComponentProps>({
    register: () => {},
    unregister: () => {},
    handleAreMockingChange: () => {},
  });
interface MockConfigProps {
  id: string;
  onDelete: (id: string) => void;
}
const MockConfigComponent = ({ id, onDelete }: MockConfigProps) => {

  const [operationName, setOperationName] = useState("");
  const [operationType, setOperationType] = useState(
    GraphQLOperationType.Query
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [dynamicConfigKeys, setDynamicConfigKeys] = useState([uuidv4()]);

  useEffect(() => {
    backgroundBindMock(id, operationType, operationName);
  }, [id, operationType, operationName]);

    
  const handleExpandedButtonPressed = useCallback(() => {
    setIsExpanded((e) => !e);
  }, []);
  
  const handleOperationTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      event.target.value === QUERY
        ? setOperationType(GraphQLOperationType.Query)
        : setOperationType(GraphQLOperationType.Mutation);
    },
    []
  );
  const handleOperationNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setOperationName(event.target.value.trim());
    },
    []
  );

  const handleDeleteMockConfig = useCallback(() => {
    backgroundUnbindMock(id);
    onDelete(id);
  }, [id, onDelete]);

  const handleAddRuleButtonPressed = useCallback(() => {
    setDynamicConfigKeys((keys) => [...keys, uuidv4()]);
  }, []);

  const handleDeleteDynamicConfig = useCallback(
    (dynamicComponentId: string) => {
      backgroundUnSetMockResponse(id, dynamicComponentId);
      removeQueryEndpoint(
        chrome.devtools.inspectedWindow.tabId,
        dynamicComponentId
      );
      setDynamicConfigKeys((keys) =>
        keys.filter((key) => key !== dynamicComponentId)
      );
    },
    [id]
  );
  const handleDynamicConfigChanged = useCallback(
    (dynamicComponentId: string, data: DynamicComponentData) => {
      if (!(data.dynamicExpression === "")) {
        backgroundSetMockResponse(id, dynamicComponentId, data);
      }
    },
    [id]
  );

  
  return (
      <div className="max-w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-6 mx-auto">
        <div className="flex flex-col -m-1.5 overflow-x-auto p-1.5 min-w-full inline-block align-middle">
          <div className="border rounded-xl shadow-sm overflow-hidden bg-slate-900 border-gray-700">
            <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-700">
              <div className="flex space-x-4">
                <input
                  className="border-b border-gray-600 bg-gray-900 h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                  type="text"
                  placeholder="Operation Name"
                  value={operationName}
                  onChange={handleOperationNameChange}
                />
                <select
                  className="border-b border-gray-600 bg-gray-900 h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                  placeholder="Select Operation Type"
                  value={
                    operationType === GraphQLOperationType.Query
                      ? QUERY
                      : MUTATION
                  }
                  onChange={handleOperationTypeChange}
                >
                  <option value={QUERY}>Query</option>
                  <option value={MUTATION}>Mutation</option>
                </select>
              </div>
              <div>
                <div className="inline-flex gap-x-2">
                  <a
                    className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 outline-none  transition-all text-sm dark:focus:ring-offset-gray-800"
                    href="#"
                    title={isExpanded ? "Collapse config" : "Expand config"}
                    onClick={handleExpandedButtonPressed}
                  >
                    {isExpanded ? <ChevronUpSVG /> : <ChevronDownSVG />}
                  </a>
                  <a
                    className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 outline-none  transition-all text-sm dark:focus:ring-offset-gray-800"
                    href="#"
                    title="Create new rule"
                    onClick={handleAddRuleButtonPressed}
                  >
                    <CreateSVG />
                  </a>
                  <a
                    className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-red-600 shadow-sm align-middle hover:bg-gray-50 outline-none transition-all text-sm dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-red-500 dark:focus:ring-offset-gray-800"
                    href="#"
                    title="Delete config"
                    onClick={handleDeleteMockConfig}
                  >
                    <DeleteSVG />
                  </a>
                </div>
              </div>
            </div>
            <table
              className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${
                isExpanded ? "" : "hidden"
              }`}
            >
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  <th
                    scope="col"
                    className="pl-6 py-3 text-left"
                  >
                    <label
                      htmlFor="mainCheckbox"
                      className="flex"
                    >
                      {/* <input
                        type="checkbox"
                        checked={areMocking}
                        title={areMocking ? 'Deactivate config' : 'Activate config'}
                        onChange={handleAreMockingChange}
                        className="relative shrink-0 w-[3.25rem] h-7 bg-gray-100 checked:bg-none checked:bg-blue-600 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 border border-transparent ring-1 ring-transparent   ring-offset-white focus:outline-none appearance-none dark:bg-gray-700 dark:checked:bg-blue-600 dark:focus:ring-offset-gray-800 before:inline-block before:w-6 before:h-6 before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:shadow before:rounded-full before:transform before:ring-0 before:transition before:ease-in-out before:duration-200 dark:before:bg-gray-400 dark:checked:before:bg-blue-200"
                        id="mainCheckbox"
                      />
                      <span className="sr-only">Checkbox</span> */}
                    </label>
                  </th>
                  <TableHeadingComponent />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {dynamicConfigKeys.map((key) => (
                  <DynamicRowComponent
                    key={key}
                    id={key}
                    onDynamicRowDelete={handleDeleteDynamicConfig}
                    onDynamicRowChanged={handleDynamicConfigChanged}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};
export default MockConfigComponent;
