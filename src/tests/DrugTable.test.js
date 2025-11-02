import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import DrugTable from "../components/DrugTable";

describe("DrugTable Component - Filtering", () => {
  const mockDrugs = [
    {
      code: "D001",
      genericName: "Paracetamol",
      brandName: "Tylenol",
      company: "ABC Pharma",
      launchDate: "2022-01-10",
    },
    {
      code: "D002",
      genericName: "Ibuprofen",
      brandName: "Advil",
      company: "XYZ Labs",
      launchDate: "2023-03-05",
    },
  ];

  beforeEach(() => {
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve({ data: mockDrugs }) })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              data: mockDrugs,
              meta: { total: mockDrugs.length },
            }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              data: mockDrugs.filter((d) => d.company === "ABC Pharma"),
              meta: { total: 1 },
            }),
        })
      );
  });

  afterEach(() => jest.clearAllMocks());

  it("filters drugs by selected company", async () => {
    render(<DrugTable />);

    // Wait for initial table
    await screen.findByTestId("drug-table");

    // Open dropdown and select "ABC Pharma"
    const select = screen.getByTestId("company-filter");
    fireEvent.mouseDown(select);

    const abcOption = await screen.findByText("ABC Pharma");
    fireEvent.click(abcOption);

    await waitFor(() => {
      const abcCells = screen.getAllByText("ABC Pharma");
      expect(abcCells.length).toBeGreaterThan(0);
    });

    const companyCells = screen.getAllByRole("cell", { name: /pharma|labs/i });
    companyCells.forEach((cell) => {
      expect(cell.textContent).toBe("ABC Pharma");
    });
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
