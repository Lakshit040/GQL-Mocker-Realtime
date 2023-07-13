import { ChevronDownSVG, ChevronUpSVG, DeleteSVG } from "./SvgComponents";
import React, { useCallback, useState, useContext, useEffect } from "react";
import ExpandedRowComponent from "./ExpandedRowComponent";
import useDynamicComponentHook from "./useDynamicCustomHook";
import { fastRandomize } from "../../background/helpers/fastRandomization";
import TableDataCellComponent from "./TableDataCellComponent";
import { DynamicComponentData } from "../../common/types";

interface DynamicRowProps {
  id: string;
  onDynamicRowDelete: (id: string) => void;
  onDynamicRowChanged: (id: string, data: DynamicComponentData) => void;
}


const DynamicRowComponent = ({
  id,
  onDynamicRowDelete,
  onDynamicRowChanged
}: DynamicRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dynamicHook = useDynamicComponentHook();
  
  useEffect(() => {
    onDynamicRowChanged(id, dynamicHook);
  }, [id, dynamicHook, onDynamicRowChanged]);


  const handleDeleteRowButtonPressed = useCallback(() => {
    onDynamicRowDelete(id);
  }, [id, onDynamicRowDelete]);
  const handleRowExpanded = useCallback(() => {
    setIsExpanded((e) => !e);
  }, []);
  const handleResponseHere = useCallback(
    async (id: string) => {
      const { tabId } = chrome.devtools.inspectedWindow;
      const response = await fastRandomize(tabId, id);
      if (response !== undefined) {
        dynamicHook.handleGenerateResponseHere(
          JSON.stringify(response, null, 2)
        );
      }
    },
    [dynamicHook]
  );

  return (
    <>
      <tr>
        <td className="h-px w-px whitespace-nowrap">
          <div className="pl-6 py-2">
            <label
              htmlFor={`rule-${id}`}
              className="flex"
            >
              <input
                type="checkbox"
                className="relative shrink-0 w-[3.25rem] h-7 bg-gray-100 checked:bg-none checked:bg-blue-600 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 border border-transparent ring-1 ring-transparent   ring-offset-white focus:outline-none appearance-none dark:bg-gray-700 dark:checked:bg-blue-600 dark:focus:ring-offset-gray-800

before:inline-block before:w-6 before:h-6 before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:shadow before:rounded-full before:transform before:ring-0 before:transition before:ease-in-out before:duration-200 dark:before:bg-gray-400 dark:checked:before:bg-blue-200"
                id={`rule-${id}`}
                title={dynamicHook.enabled ? 'Stop mocking' : 'Start mocking'}
                checked={dynamicHook.enabled && dynamicHook.dynamicExpression.trim() !== ""}
                onChange={dynamicHook.handleToggleEnabled}
              />
              <span className="sr-only">Checkbox</span>
            </label>
          </div>
        </td>
        <td className="h-px w-px whitespace-nowrap">
          <div className="px-6 py-2">
            <div className="flex items-center gap-x-2">
              <div className="grow">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <input
                    type="text"
                    placeholder="id == '5', *, age > 18 && count != 5"
                    className="px-1 py-1 bg-gray-900 border-b border-gray-600 outline-none min-w-full"
                    value={dynamicHook.dynamicExpression}
                    onChange={dynamicHook.handleInputChange(
                      "dynamicExpression"
                    )}
                  />
                </span>
              </div>
            </div>
          </div>
        </td>
        <TableDataCellComponent
          type="text"
          placeholder="0"
          value={dynamicHook.responseDelay}
          onChange={dynamicHook.handleInputChange("responseDelay")}
        />
        <TableDataCellComponent
          type="text"
          placeholder="200"
          value={dynamicHook.statusCode}
          onChange={dynamicHook.handleInputChange("statusCode")}
        />
        <TableDataCellComponent
          type="checkbox"
          checked={dynamicHook.shouldRandomizeResponse}
          onChange={dynamicHook.handleCheckboxChange("shouldRandomizeResponse")}
        />
        <td className="h-px w-px whitespace-nowrap">
          <div className="px-6 py-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              <div className="flex space-x-2">
                <a
                  className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-red-600 shadow-sm align-middle hover:bg-gray-50 outline-none   transition-all text-sm dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-red-500 dark:focus:ring-offset-gray-800"
                  href="#"
                  title={isExpanded ? "Collapse rule" : "Expand rule"}
                  onClick={handleRowExpanded}
                >
                  {isExpanded ? <ChevronUpSVG /> : <ChevronDownSVG />}
                </a>
                <a
                  className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-red-600 shadow-sm align-middle hover:bg-gray-50 outline-none   transition-all text-sm dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-red-500 dark:focus:ring-offset-gray-800"
                  href="#"
                  title="Delete rule"
                  onClick={handleDeleteRowButtonPressed}
                >
                  <DeleteSVG />
                </a>
              </div>
            </span>
          </div>
        </td>
      </tr>
      <tr>
        <td
          colSpan={6}
          style={{ display: isExpanded ? "table-cell" : "none" }}
        >
          <ExpandedRowComponent
            id={id}
            arrayLength={dynamicHook.arrayLength}
            stringLength={dynamicHook.stringLength}
            numberStart={dynamicHook.numberStart}
            numberEnd={dynamicHook.numberEnd}
            mockResponse={dynamicHook.mockResponse}
            booleanType={dynamicHook.booleanType}
            specialCharactersAllowed={dynamicHook.specialCharactersAllowed}
            onArrayLengthChange={dynamicHook.handleInputChange("arrayLength")}
            onBooleanTypeChange={dynamicHook.handleBooleanTypeChange}
            onGenerateResponseHereButtonPressed={handleResponseHere}
            onMockResponseChange={dynamicHook.handleInputChange("mockResponse")}
            onNumberEndChange={dynamicHook.handleInputChange("numberEnd")}
            onNumberStartChange={dynamicHook.handleInputChange("numberStart")}
            onPrettifyButtonPressed={dynamicHook.handlePrettifyButtonPressed}
            onSpecialCharactersAllowedChange={dynamicHook.handleCheckboxChange(
              "specialCharactersAllowed"
            )}
            onStringLengthChange={dynamicHook.handleInputChange("stringLength")}
          />
        </td>
      </tr>
    </>
  );
};
export default React.memo(DynamicRowComponent);
