import {
  CircularProgress,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";

const DrugTable = () => {
  const [drugs, setDrugs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL;
  const fetchDrugs = async (pageNum = 0, limitNum = 25, company = "") => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: pageNum + 1,
        limit: limitNum,
        ...(company && { company }),
      });

      const res = await fetch(`${API_URL}/api/drugs?${query.toString()}`);
      const data = await res.json();

      const drugsList = data.data || [];
      const meta = data.meta || {};

      const formatted = drugsList.map((d, i) => ({
        id: i + 1 + pageNum * limitNum,
        code: d.code,
        name: `${d.genericName} (${d.brandName})`,
        company: d.company,
        launchDate: d.launchDate,
      }));

      setDrugs(formatted);
      setTotal(meta.total || 0);
    } catch (err) {
      console.error("Failed to fetch drugs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all companies once
  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${API_URL}/api/drugs?limit=10000`);
      const data = await res.json();
      const drugsList = data.data || data;
      setCompanies([...new Set(drugsList.map((d) => d.company))]);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchDrugs(page, rowsPerPage, filter);
  }, [page, rowsPerPage, filter]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(0);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleCompanyClick = (company) => {
    setFilter(company);
  };

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
        data-testid="company-filter"
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
          {drugs.map((d) => (
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

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[25, 50, 100]}
      />
    </div>
  );
};

export default DrugTable;
