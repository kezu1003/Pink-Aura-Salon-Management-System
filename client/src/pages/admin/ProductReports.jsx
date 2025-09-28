import React, { useEffect, useState } from "react";
import axios from "../../api/axios"; 
import { saveAs } from "file-saver";

const AdminProductReports = () => {
  const [reportType, setReportType] = useState("summary");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lowThreshold, setLowThreshold] = useState(5);
  const [expiryDays, setExpiryDays] = useState(30);
  const [format, setFormat] = useState("json");

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("type", reportType);
      params.set("format", format);
      if (reportType === "low-stock") params.set("lowThreshold", lowThreshold);
      if (reportType === "expiry") params.set("expiryDays", expiryDays);

      const url = `/api/products/report?${params.toString()}`;
      
      const res = await axios.get(url, { responseType: format === "csv" ? "blob" : "json" });

      if (format === "csv") {
       
        const blob = res.data;
        const fileName = `product-report-${reportType}.csv`;
        saveAs(blob, fileName);
        setData(null);
      } else {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || "Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
   
    if (reportType === "summary") {
      fetchReport();
    } else {
      setData(null);
    }
   
  }, [reportType, format]);

  const onDownloadCSV = async () => {
    setFormat("csv");
    await fetchReport();
    setFormat("json");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Product Reports</h2>

      <div className="mb-4 flex gap-2 items-end">
        <div>
          <label className="block text-sm">Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="border px-2 py-1">
            <option value="summary">Summary</option>
            <option value="inventory">Inventory (full)</option>
            <option value="low-stock">Low Stock</option>
            <option value="expiry">Expiring Soon</option>
          </select>
        </div>

        {reportType === "low-stock" && (
          <div>
            <label className="block text-sm">Low Threshold</label>
            <input type="number" value={lowThreshold} min={0} onChange={(e) => setLowThreshold(Number(e.target.value))} className="border px-2 py-1 w-28" />
          </div>
        )}

        {reportType === "expiry" && (
          <div>
            <label className="block text-sm">Expiry Days</label>
            <input type="number" value={expiryDays} min={1} onChange={(e) => setExpiryDays(Number(e.target.value))} className="border px-2 py-1 w-28" />
          </div>
        )}

        <div>
          <button onClick={fetchReport} className="bg-pink-500 text-white px-3 py-1 rounded">Fetch</button>
        </div>

        <div>
          <button onClick={onDownloadCSV} className="border px-3 py-1 rounded">Download CSV</button>
        </div>
      </div>

      <div>
        {loading && <div>Loading...</div>}

        {!loading && data && reportType === "summary" && (
          <div className="space-y-4">
            <div className="p-4 border rounded">
              <h3 className="font-semibold">Overview</h3>
              <div>Total Products: {data.report.totalProducts}</div>
              <div>Total Stock Units: {data.report.totalStockUnits}</div>
              <div>Total Inventory Value: {data.report.totalInventoryValue}</div>
              <div>Average Price: {data.report.avgPrice.toFixed(2)}</div>
            </div>

            <div className="p-4 border rounded">
              <h3 className="font-semibold">By Category</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th>Category</th>
                    <th>Count</th>
                    <th>Stock Units</th>
                    <th>Inventory Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.report.byCategory.map((c) => (
                    <tr key={c.category}>
                      <td>{c.category}</td>
                      <td>{c.count}</td>
                      <td>{c.stockUnits}</td>
                      <td>{c.inventoryValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border rounded">
              <h3 className="font-semibold">Top Brands</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th>Brand</th>
                    <th>Count</th>
                    <th>Stock Units</th>
                    <th>Inventory Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.report.topBrands.map((b) => (
                    <tr key={b.brand}>
                      <td>{b.brand}</td>
                      <td>{b.count}</td>
                      <td>{b.stockUnits}</td>
                      <td>{b.inventoryValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && data && reportType === "inventory" && (
          <div>
            <h3 className="font-semibold mb-2">Inventory ({data.total})</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th>Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Stock Value</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.brand}</td>
                    <td>{p.price}</td>
                    <td>{p.stock}</td>
                    <td>{p.stockValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && data && reportType === "low-stock" && (
          <div>
            <h3 className="font-semibold mb-2">Low Stock ({data.total})</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th>Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Days to Expiry</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.brand}</td>
                    <td>{p.price}</td>
                    <td>{p.stock}</td>
                    <td>{p.expiryDaysLeft ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && data && reportType === "expiry" && (
          <div>
            <h3 className="font-semibold mb-2">Expiring Soon ({data.total})</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th>Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Expiry Date</th>
                  <th>Days to Expiry</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.brand}</td>
                    <td>{p.price}</td>
                    <td>{p.stock}</td>
                    <td>{p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : "-"}</td>
                    <td>{p.expiryDaysLeft ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !data && <div className="text-sm text-muted">No report loaded. Select a type and click Fetch.</div>}
      </div>
    </div>
  );
};

export default AdminProductReports;
