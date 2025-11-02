import {
  CircularProgress,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";

const DrugTable = () => {
  const [drugs, setDrugs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL;
        const res = await fetch(`${API_URL}/api/drugs`);
        const data = await res.json();

        // Format & sort data
        const formatted = data
          .map((d, i) => ({
            id: i + 1,
            code: d.code,
            name: `${d.genericName} (${d.brandName})`,
            company: d.company,
            launchDate: d.launchDate,
          }))
          .sort((a, b) => new Date(b.launchDate) - new Date(a.launchDate));

        setDrugs(formatted);
        setCompanies([...new Set(formatted.map((d) => d.company))]);
      } catch (err) {
        console.error("Failed to fetch drugs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDrugs();
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleCompanyClick = (company) => {
    setFilter(company);
  };

  const filteredDrugs = filter
    ? drugs.filter((d) => d.company === filter)
    : drugs;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <CircularProgress />
        <p>Loading Data...</p>
      </div>
    );

  return (
    <div style={{ padding: 20 }}>
      <h2>Drug Info</h2>

      <Select
        value={filter}
        onChange={handleFilterChange}
        displayEmpty
        style={{ marginBottom: 20, minWidth: 200 }}
      >
        <MenuItem value="">All Companies</MenuItem>
        {companies.map((c) => (
          <MenuItem key={c} value={c}>
            {c}
          </MenuItem>
        ))}
      </Select>

      <Table data-testid="drug-table">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Company</TableCell>
            <TableCell>Launch Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredDrugs.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{d.id}</TableCell>
              <TableCell>{d.code}</TableCell>
              <TableCell>{d.name}</TableCell>
              <TableCell
                style={{ color: "blue", cursor: "pointer" }}
                onClick={() => handleCompanyClick(d.company)}
              >
                {d.company}
              </TableCell>
              <TableCell>{formatDate(d.launchDate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DrugTable;
