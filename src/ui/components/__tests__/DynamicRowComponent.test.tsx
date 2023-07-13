import { render, fireEvent } from "@testing-library/react";
import DynamicRowComponent from "../DynamicRowComponent";

describe("<DynamicRowComponent />", () => {
  const mockProps = {
    id: "1",
    onDynamicRowDelete: jest.fn(),
    onDynamicRowChanged: jest.fn()
  };

  it("should render correctly", () => {
    const { getByLabelText, getByPlaceholderText, getByTitle } = render(
      <DynamicRowComponent {...mockProps} />
    );

    expect(getByLabelText(/Checkbox/i)).toBeInTheDocument();
    expect(
      getByPlaceholderText(/id == '5', \*, age > 18 && count != 5/i)
    ).toBeInTheDocument();
    expect(getByTitle(/Expand rule/i)).toBeInTheDocument();
    expect(getByTitle(/Delete rule/i)).toBeInTheDocument();
  });


  it("should call onDynamicRowComponentDelete when Delete rule button is clicked", () => {
    const { getByTitle } = render(<DynamicRowComponent {...mockProps} />);

    fireEvent.click(getByTitle(/Delete rule/i));
    expect(mockProps.onDynamicRowDelete).toHaveBeenCalledWith(
      mockProps.id
    );
  });

  it("should call handleRowExpanded when Expand rule button is clicked", () => {
    const { getByTitle } = render(<DynamicRowComponent {...mockProps} />);
    const expandButton = getByTitle(/Expand rule/i);
    fireEvent.click(expandButton);
    expect(expandButton).toBeInTheDocument();
    expect(expandButton.title).toBe("Collapse rule");
  });
});
