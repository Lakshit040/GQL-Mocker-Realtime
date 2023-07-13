import { useState, useCallback } from "react";
import AppSidebar from "./components/AppSidebar";
import Navbar from "./components/Navbar";
import MockConfigComponent from "./components/MockConfigComponent";
import { PlusIcon } from "@heroicons/react/24/solid";

import { v4 as uuidv4 } from "uuid";

function App() {
  const [mockResponseConfigKeys, setMockResponseConfigKeys] = useState(
    [] as string[]
  );

  const handleAddButtonPressed = useCallback(() => {
    setMockResponseConfigKeys((keys) => [...keys, uuidv4()]);
  }, []);

  const handleDeleteMockResponseConfig = useCallback((id: string) => {
    setMockResponseConfigKeys((keys) => keys.filter((key) => key !== id));
  }, []);

  return (
    <div className="h-screen bg-gray-900">
      <div className="flex bg-gray-900">
        <div className="hidden lg:flex lg:w-64 ">
          <AppSidebar />
        </div>
        <div className="flex-1 bg-gray-900 text-white">
          <div className="sticky top-0 z-50">
            <Navbar />
          </div>
          <div className="h-auto">
            <div className="flex ">
              <div className="w-full h-full  border-r border-gray-800 overflow-y-auto">
                <div className="w-full shrink-0 items-center flex px-4 pb-0 mt-4">
                  <h1 className="text-white items-center text-xl ">
                    Mock GraphQL Requests
                  </h1>
                  <PlusIcon
                    title="Add new operation"
                    className="w-10 h-10 p-2 shrink-0 rounded-full ml-auto text-white hover:bg-gray-600"
                    onClick={handleAddButtonPressed}
                  />
                </div>
                {mockResponseConfigKeys.map((key) => (
                  <MockConfigComponent
                    key={key}
                    id={key}
                    onDelete={handleDeleteMockResponseConfig}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
