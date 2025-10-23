// src/pages/Dashboard.jsx (FULL - Modul Data Stok Dipindah Ke Kanan & Muncul Saat Diklik)
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth, ROLE_NAME_MAP } from "../context/AuthContext";
import { useState, useMemo } from "react";

// ====================================================================
// DEFINISI HALAMAN CUSTOM (Dimulai dari Page 0)
// ====================================================================
const PAGE_MAP = {
  0: "",
  1: "",
  2: "",
  3: "",
  4: "",
  5: "",
  6: "",
  7: "",
  8: "",
  9: "",
  10: "",
  11: "",
  12: "",
  13: "",
  14: "",
  15: "",
  16: "",
  17: "",
  18: "",
  19: "",
  20: "",
  21: "",
  22: "",
  23: "",
  24: "",
  25: "",
  26: "",
  27: "",
  28: "",
  29: "",
  30: "",
  31: "",
  32: "",
  33: "",
  34: "",
  35: "",
  36: "",
  37: "",
  38: "",
  39: "",
  40: "",
};

const pages = Object.keys(PAGE_MAP).map(Number);

// ====================================================================
// KOMPONEN UTAMA DASHBOARD
// ====================================================================
export default function Dashboard() {
  const { user, userRole, signOut, SPECIAL_ADMIN_EMAIL } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    setTimeout(() => navigate("/login"), 10);
  };

  const isSpecialAdmin = user?.email === SPECIAL_ADMIN_EMAIL;

  const accessiblePages = pages.filter((num) => {
    if (num === 0) return isSpecialAdmin;
    return isSpecialAdmin || num === userRole;
  });

  return (
    <div>
      <nav>
        <div>
          <div>
            {accessiblePages.map((num) => (
              <Link key={num} to={`/page/${num}`}>
                {PAGE_MAP[num]} {num}.
              </Link>
            ))}
          </div>
        </div>
        <div>
          <span>
            Hallo, <strong>{user?.email}</strong>
            {isSpecialAdmin && <span> kamu login sebagai </span>} 0
            {userRole || "N/A"}1
          </span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main>
        <Routes>
          {pages.map((num) => (
            <Route
              key={num}
              path={`/page/${num}`}
              element={
                <PageContent
                  number={num}
                  userRole={userRole}
                  pageName={PAGE_MAP[num]}
                  isSpecialAdmin={isSpecialAdmin}
                />
              }
            />
          ))}
          <Route
            path="/"
            element={
              <h2>
                Selamat datang di Dashboard! Role Anda adalah **{userRole}**.
                Silakan klik link{" "}
                {isSpecialAdmin
                  ? "salah satu"
                  : `**${PAGE_MAP[userRole]}** (${userRole})`}{" "}
                di atas.
              </h2>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function PageContent({ number, userRole, pageName, isSpecialAdmin }) {
  if (number === 0) {
    if (!isSpecialAdmin) {
      return (
        <div>
          <h1>Akses Ditolak! 🛑 SERVER 0</h1>
          <p>Halaman ini hanya untuk Super Admin.</p>
        </div>
      );
    }
    return <ServerDashboardContent pageName={pageName} />;
  }

  if (!isSpecialAdmin && userRole !== number) {
    return (
      <div>
        <h1>Akses Ditolak! 🛑</h1>
        <p>Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>{pageName}</h1>
      <p>Halaman akses terbatas untuk Role {number}.</p>
    </div>
  );
}

// ====================================================================
// SERVER CONTENT
// ====================================================================
const INITIAL_STOCK = {};

function ServerDashboardContent({ pageName }) {
  const [requests, setRequests] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [stockData, setStockData] = useState(INITIAL_STOCK);
  const [selectedView, setSelectedView] = useState("status");
  const [filterTgl, setFilterTgl] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [deliveryForm, setDeliveryForm] = useState(null);

  const downloadJson = (data, filename) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = filename;
    link.click();
  };

  const handleResetData = () => {
    if (!window.confirm("Yakin reset semua data stok?")) return;
    setStockData({});
    alert("Stok direset");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        setStockData(parsed);
        alert("Stok berhasil diimpor");
        event.target.value = "";
      } catch {
        alert("Gagal impor stok");
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handlePrintLaporan = () => {
    window.print();
  };

  const handleAddRequests = (newRequestsArray) => {
    setRequests((prev) => [...prev, ...newRequestsArray]);
    setSelectedView("status");
  };

  const handleOpenDeliverForm = (requestId) => {
    const req = requests.find((r) => r.idPermintaan === requestId);
    if (!req) return;
    const qtySisa = req.qtyDiminta - (req.qtyDeliveredTotal || 0);
    const currentStock = stockData[req.nomorItem] || 0;
    const maxQtyToDeliver = Math.min(qtySisa, currentStock);
    if (maxQtyToDeliver <= 0) {
      alert("Stok kosong");
      return;
    }
    setDeliveryForm({
      idPermintaan: requestId,
      nomorItem: req.nomorItem,
      jenisBarang: req.jenisBarang,
      unitSatuan: req.unitSatuan,
      qtySisa,
      maxQty: maxQtyToDeliver,
      qtyToDeliver: maxQtyToDeliver,
      tglRequest: req.tglRequest,
      departemen: req.departemen,
      pengirim: "Gudang",
      tglKedatangan: new Date().toISOString().slice(0, 10),
      tglExpired: "2099-12-31",
      noLabel: "LBL-" + Date.now().toString().slice(-4),
    });
  };

  const handleProcessDelivery = (e) => {
    e.preventDefault();
    const {
      idPermintaan,
      qtyToDeliver,
      nomorItem,
      jenisBarang,
      unitSatuan,
      tglRequest,
      departemen,
      pengirim,
      tglKedatangan,
      tglExpired,
      noLabel,
    } = deliveryForm;
    const qty = parseInt(qtyToDeliver, 10);
    if (qty <= 0 || qty > deliveryForm.maxQty) {
      alert("Qty tidak valid");
      return;
    }
    const deliveredRequest = requests.find(
      (r) => r.idPermintaan === idPermintaan
    );
    if (!deliveredRequest) return;
    const qtyDeliveredNewTotal =
      (deliveredRequest.qtyDeliveredTotal || 0) + qty;
    let newStatus =
      qtyDeliveredNewTotal >= deliveredRequest.qtyDiminta
        ? "DELIVERED"
        : "PARTIAL_DELIVERED";
    setDeliveries((prev) => [
      ...prev,
      {
        id: Date.now(),
        idPermintaan,
        status: newStatus,
        nomorItem,
        jenisBarang,
        qty,
        sat: unitSatuan,
        sisa: deliveredRequest.qtyDiminta - qtyDeliveredNewTotal,
        lot: noLabel,
        expired: tglExpired,
        telFIFO: new Date().toISOString().slice(0, 10),
        departemen,
        diserahkan: pengirim,
        diterima: departemen,
        type: deliveredRequest.type,
        tglRequest,
        tglKedatangan,
        noLabel,
        qtyDiminta: deliveredRequest.qtyDiminta,
        qtyDeliveredNewTotal,
      },
    ]);
    setRequests((prev) =>
      prev.map((req) =>
        req.idPermintaan === idPermintaan
          ? {
              ...req,
              status: newStatus,
              qtyDeliveredTotal: qtyDeliveredNewTotal,
            }
          : req
      )
    );
    setStockData((prev) => ({
      ...prev,
      [nomorItem]: (prev[nomorItem] || 0) - qty,
    }));
    alert("Kirim berhasil");
    setDeliveryForm(null);
  };

  // 🔝 URUTAN: URGENT → BELUM DIKIRIM → SUDAH DIKIRIM (by timestamp)
  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      // 1. URGENT selalu di atas
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;

      // 2. BELUM DIKIRIM di atas SUDAH DIKIRIM
      const aDelivered = a.status === "DELIVERED";
      const bDelivered = b.status === "DELIVERED";
      if (!aDelivered && bDelivered) return -1;
      if (aDelivered && !bDelivered) return 1;

      // 3. DIKIRIM: urutkan dari lama ke baru (paling lama di bawah)
      if (aDelivered && bDelivered) {
        return new Date(a.tglRequest) - new Date(b.tglRequest);
      }

      // 4. BELUM DIKIRIM: urutkan dari baru ke lama (paling baru di atas)
      return new Date(b.tglRequest) - new Date(a.tglRequest);
    });
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return sortedRequests.filter((req) => {
      const matchesDate = !filterTgl || req.tglRequest.includes(filterTgl);
      const matchesJenis =
        !filterJenis ||
        req.jenisBarang.toLowerCase().includes(filterJenis.toLowerCase()) ||
        req.nomorItem.toLowerCase().includes(filterJenis.toLowerCase());
      return matchesDate && matchesJenis;
    });
  }, [sortedRequests, filterTgl, filterJenis]);

  const filteredStock = useMemo(() => {
    return Object.entries(stockData).filter(([code, qty]) => {
      const lower = stockFilter.toLowerCase();
      const matchCode = code.toLowerCase().includes(lower);
      const matchName = code.toLowerCase().includes(lower);
      const matchFIFO = "2025-10-24".includes(lower);
      const matchExp = "2099-12-31".includes(lower);
      return matchCode || matchName || matchFIFO || matchExp;
    });
  }, [stockData, stockFilter]);

  const StatusPermintaanTable = () => (
    <div>
      <h3>Status Permintaan</h3>
      <table>
        <thead>
          <tr>
            <th4>Tgl</th4>
            <th4>Barang</th4>
            <th4>Diminta</th4>
            <th4>DiKirim</th4>
            <th4>Status</th4>
            <th4>Aksi</th4>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.map((req) => {
            const sisa = req.qtyDiminta - (req.qtyDeliveredTotal || 0);
            return (
              <tr key={req.idPermintaan}>
                <td>{req.tglRequest}</td>
                <td>
                  {req.jenisBarang} ({req.nomorItem})
                </td>
                <td>
                  {sisa} {req.unitSatuan}
                </td>
                <td>
                  {req.qtyDeliveredTotal || 0} {req.unitSatuan}
                </td>
                <td>
                  {req.status}
                  {req.isUrgent && " 🚨URGENT"}
                </td>
                <td>
                  {req.status !== "DELIVERED" && req.status !== "CANCELED" && (
                    <button
                      onClick={() => handleOpenDeliverForm(req.idPermintaan)}
                    >
                      Kirim ({sisa})
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const SerahTerimaTable = () => (
    <div>
      <h3> Formulir Serah Terima</h3>
      <table>
        <thead>
          <tr>
            <th4>Tgl Minta</th4>
            <th4>Tgl Kirim</th4>
            <th4>Kode</th4>
            <th4>Nama</th4>
            <th4>Minta</th4>
            <th4>Kirim</th4>
            <th4>Peminta</th4>
            <th4>Pengirim</th4>
            <th4>Fifo</th4>
            <th4>Fefo</th4>
            <th4>Label</th4>
            <th4>Satuan</th4>
            <th4>Dept</th4>
          </tr>
        </thead>
        <tbody>
          {(deliveries || []).map((d) => (
            <tr key={d.id}>
              <td>{d.tglRequest} 00:00</td>
              <td>{d.telFIFO} 00:00</td>
              <td>{d.nomorItem}</td>
              <td>{d.jenisBarang}</td>
              <td>
                {d.qtyDiminta} {d.sat}
              </td>
              <td>
                {d.qty} {d.sat}
              </td>
              <td>{d.diterima}</td>
              <td>{d.diserahkan}</td>
              <td>{d.tglKedatangan}</td>
              <td>{d.expired}</td>
              <td>{d.noLabel}</td>
              <td>
                {d.qty} {d.sat}
              </td>
              <td>{d.departemen}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const FormPermintaanMultiItem = ({ addRequests }) => {
    const [items, setItems] = useState([
      {
        nomorItem: "",
        namaBarang: "",
        qtyDiminta: 0,
        isUrgent: false,
        unit: "pcs",
      },
    ]);
    const [departemenTujuan, setDepartemenTujuan] = useState("PACKING");
    const [tanggalPermintaan, setTanggalPermintaan] = useState(
      new Date().toISOString().slice(0, 10)
    );

    const addItem = () =>
      setItems([
        ...items,
        {
          nomorItem: "",
          namaBarang: "",
          qtyDiminta: 0,
          isUrgent: false,
          unit: "pcs",
        },
      ]);

    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

    const handleSubmit = (e) => {
      e.preventDefault();
      if (
        items.some(
          (item) =>
            !item.nomorItem ||
            !item.namaBarang ||
            parseInt(item.qtyDiminta, 10) <= 0
        )
      ) {
        alert("Isi semua kolom (kode, nama, qty > 0)");
        return;
      }
      const newRequests = items.map((item, index) => ({
        idPermintaan: `REQ-${tanggalPermintaan.replace(
          /-/g,
          ""
        )}-${departemenTujuan
          .slice(0, 3)
          .toUpperCase()}-${Date.now()}-${index}`,
        nomorItem: item.nomorItem,
        jenisBarang: item.namaBarang,
        qtyDiminta: parseInt(item.qtyDiminta, 10),
        qtyDeliveredTotal: 0,
        isUrgent: item.isUrgent,
        unitSatuan: item.unit,
        departemen: departemenTujuan,
        tglRequest: tanggalPermintaan,
        status: "REQUESTED",
        type:
          item.nomorItem.toUpperCase().includes("ADD") ||
          item.nomorItem.toUpperCase().includes("SOLVEN")
            ? "ADDITIVE"
            : "BARANG",
      }));
      addRequests(newRequests);
      setItems([
        {
          nomorItem: "",
          namaBarang: "",
          qtyDiminta: 0,
          isUrgent: false,
          unit: "pcs",
        },
      ]);
    };

    return (
      <div>
        <h3>Formulir Permintaan</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Departemen:</label>
            <input
              value={departemenTujuan}
              onChange={(e) => setDepartemenTujuan(e.target.value)}
            />
            <label>Tanggal:</label>
            <input
              type="date"
              value={tanggalPermintaan}
              onChange={(e) => setTanggalPermintaan(e.target.value)}
            />
          </div>

          <div>
            {items.map((item, i) => (
              <div key={i}>
                <span>{i + 1}. </span>
                <input
                  placeholder="Item Code"
                  value={item.nomorItem}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[i].nomorItem = e.target.value;
                    setItems(newItems);
                  }}
                />
                <input
                  placeholder="Nama Item"
                  value={item.namaBarang}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[i].namaBarang = e.target.value;
                    setItems(newItems);
                  }}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.qtyDiminta}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[i].qtyDiminta = e.target.value;
                    setItems(newItems);
                  }}
                />
                <select
                  value={item.unit}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[i].unit = e.target.value;
                    setItems(newItems);
                  }}
                >
                  <option value="pcs">pcs</option>
                  <option value="gr">gr</option>
                  <option value="liter">liter</option>
                  <option value="unit">unit</option>
                  <option value="lmbr">lmbr</option>
                </select>
                <label>
                  <input
                    type="checkbox"
                    checked={item.isUrgent}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[i].isUrgent = e.target.checked;
                      setItems(newItems);
                    }}
                  />
                  urgent
                </label>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)}>
                    Hapus
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <button type="button" onClick={addItem}>
              + Tambah Item
            </button>
            <button type="submit">Minta Sekarang</button>
          </div>
        </form>
      </div>
    );
  };

  const StockTable = () => (
    <div>
      <h2>All Stok</h2>
      <label>
        Cari (Kode / Nama / FIFO / Exp):
        <input
          type="text"
          placeholder="Contoh: PK001 atau 2025-12"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        />
      </label>
      <table>
        <thead>
          <tr>
            <th>Kode Item</th>
            <th>Nama Item</th>
            <th>Stok Tersedia</th>
            <th>FIFO Kedatangan</th>
            <th>Expired</th>
          </tr>
        </thead>
        <tbody>
          {filteredStock.map(([code, qty]) => (
            <tr key={code}>
              <td>{code}</td>
              <td>{code}</td>
              <td>{qty} unit</td>
              <td>2025-10-24</td>
              <td>2099-12-31</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <h1>{pageName} server</h1>
      <p>Semua fitur manajemen sistem berada di sini.</p>

      {/* DELIVERY FORM MODAL */}
      {deliveryForm && (
        <div>
          <h3>Form Kirim</h3>
          <p>ID: {deliveryForm.idPermintaan}</p>
          <p>Item: {deliveryForm.nomorItem}</p>
          <p>
            Sisa: {deliveryForm.qtySisa} {deliveryForm.unitSatuan} | Stok:{" "}
            {stockData[deliveryForm.nomorItem] || 0}
          </p>
          <form onSubmit={handleProcessDelivery}>
            <label>
              Qty Kirim:{" "}
              <input
                type="number"
                value={deliveryForm.qtyToDeliver}
                onChange={(e) =>
                  setDeliveryForm({
                    ...deliveryForm,
                    qtyToDeliver: e.target.value,
                  })
                }
                min="1"
                max={deliveryForm.maxQty}
                required
              />
            </label>
            <button type="submit">Kirim</button>
            <button type="button" onClick={() => setDeliveryForm(null)}>
              Batal
            </button>
          </form>
        </div>
      )}

      {/* NAVIGASI - MODUL DATA STOK JADI TOMBOL BARU */}
      <div>
        <button onClick={() => setSelectedView("permintaan")}>
          Permintaan
        </button>
        <button onClick={() => setSelectedView("status")}>
          Status Permintaan
        </button>
        <button onClick={() => setSelectedView("serah")}>Serah Terima</button>
        <button onClick={handlePrintLaporan}>Cetak</button>
        <button onClick={() => setSelectedView("stock")}> Stok</button>
        <button onClick={() => setSelectedView("modul")}>Modul</button>
      </div>

      {/* FILTER UNTUK STATUS & SERAH */}
      {(selectedView === "status" || selectedView === "serah") && (
        <div>
          <label>
            Filter Tgl:{" "}
            <input
              type="date"
              value={filterTgl}
              onChange={(e) => setFilterTgl(e.target.value)}
            />
          </label>
          <label>
            Cari:{" "}
            <input
              placeholder="Kode/Nama Barang"
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
            />
          </label>
        </div>
      )}

      {/* KONTEN */}
      {selectedView === "permintaan" && (
        <FormPermintaanMultiItem addRequests={handleAddRequests} />
      )}
      {selectedView === "status" && <StatusPermintaanTable />}
      {selectedView === "serah" && <SerahTerimaTable />}
      {selectedView === "stock" && (
        <>
          <label>
            Cari (Kode / Nama / FIFO / Exp):{" "}
            <input
              type="text"
              placeholder="Contoh: PK001 atau 2025-12"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            />
          </label>
          <table>
            <thead>
              <tr>
                <th>Kode Item</th>
                <th>Nama Item</th>
                <th>Stok Tersedia</th>
                <th>FIFO Kedatangan</th>
                <th>Expired</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.map(([code, qty]) => (
                <tr key={code}>
                  <td>{code}</td>
                  <td>{code}</td>
                  <td>{qty} unit</td>
                  <td>2025-10-24</td>
                  <td>2099-12-31</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* MODUL DATA - STOK: MUNCUL HANYA SAAT KLIK "Modul Data - Stok" */}
      {selectedView === "modul" && (
        <div
          style={{
            marginTop: "15px",
            border: "1px solid black",
            padding: "10px",
            width: "fit-content",
          }}
        >
          <h3>Modul Data - Stok</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => downloadJson(stockData, "stock.json")}>
              Download JSON
            </button>
            <button onClick={handleResetData}>Reset Data</button>
            <label style={{ border: "1px solid #ccc", padding: "5px" }}>
              Upload JSON
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
