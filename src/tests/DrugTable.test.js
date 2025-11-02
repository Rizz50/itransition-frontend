import {
  render,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import DrugTable from "../components/DrugTable";

describe("DrugTable Component", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            {
              code: "D001",
              genericName: "Paracetamol",
              brandName: "Tylenol",
              company: "ABC Pharma",
              launchDate: "2024-02-10",
            },
            {
              code: "D002",
              genericName: "Ibuprofen",
              brandName: "Advil",
              company: "XYZ Labs",
              launchDate: "2023-10-05",
            },
          ]),
      })
    );
  });

  afterEach(() => jest.clearAllMocks());

  test("renders and filters correctly by company", async () => {
    render(<DrugTable />);

    await waitForElementToBeRemoved(() => screen.queryByText(/Loading Data/i));

    expect(screen.getByText("ABC Pharma")).toBeInTheDocument();
    expect(screen.getByText("XYZ Labs")).toBeInTheDocument();

    const select = screen.getByRole("combobox");
    fireEvent.mouseDown(select);

    const listbox = await screen.findByRole("listbox");
    const abcOption = within(listbox).getByText("ABC Pharma");

    fireEvent.click(abcOption);

    const table = screen.getByTestId("drug-table");
    await waitFor(() =>
      expect(within(table).getByText("ABC Pharma")).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(within(table).queryByText("XYZ Labs")).toBeNull()
    );
  });

  test("resets filter when selecting 'All Companies'", async () => {
    render(<DrugTable />);
    await waitForElementToBeRemoved(() => screen.queryByText(/Loading Data/i));

    const select = screen.getByRole("combobox");
    fireEvent.mouseDown(select);

    const listbox1 = await screen.findByRole("listbox");
    fireEvent.click(within(listbox1).getByText("ABC Pharma"));

    // reopen dropdown to select "All Companies"
    fireEvent.mouseDown(select);
    const listbox2 = await screen.findByRole("listbox");
    fireEvent.click(within(listbox2).getByText("All Companies"));

    await screen.findByText("ABC Pharma");
    await screen.findByText("XYZ Labs");
  });
});
