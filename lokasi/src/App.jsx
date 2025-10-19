import React, { useState, useRef } from 'react';
import './App.css'

function App() {
  const [warehouses, setWarehouses] = useState([]);
  const [activeWarehouse, setActiveWarehouse] = useState(1);
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showInfo, setShowInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Zoom & Pan states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const infoTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [newWarehouseName, setNewWarehouseName] = useState('');
  const [newWarehouseLocation, setNewWarehouseLocation] = useState('');

  const [newItem, setNewItem] = useState({
    name: '',
    color: '#646cff',
    url: '',
    fifo: new Date().toISOString().split('T')[0],
    expired: '',
    quantity: 0,
    status: 'stop',
    category: ''
  });

  const [tempItem, setTempItem] = useState({});

  const currentWarehouse = warehouses.find(w => w.id === activeWarehouse);

  const filteredItems = currentWarehouse?.items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchSearch && matchStatus;
  }) || [];

  const isExpiringSoon = (expiredDate) => {
    if (!expiredDate) return false;
    const today = new Date();
    const expired = new Date(expiredDate);
    const diffDays = Math.ceil((expired - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  const isExpired = (expiredDate) => {
    if (!expiredDate) return false;
    const today = new Date();
    const expired = new Date(expiredDate);
    return expired < today;
  };

  // Zoom & Pan handlers
// ZOOM WITH TRACKPAD/SCROLL - DISABLED buka untuk zoom dg trackpad
 // const handleWheel = (e) => {
 //   e.preventDefault();
 //   const delta = e.deltaY > 0 ? -0.1 : 0.1;
 //   const newZoom = Math.min(Math.max(0.3, zoom + delta), 3);
 //   setZoom(newZoom);
 // };

  const handlePanStart = (e) => {
    if (e.target === containerRef.current || e.target === canvasRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handlePanMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Drag handlers
  const handleMouseDown = (e, itemId) => {
    if (e.target.closest('.item-controls') || e.target.closest('.item-info-box')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const item = currentWarehouse.items.find(i => i.id === itemId);
    const dragElement = e.currentTarget;
    
    const rect = dragElement.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / zoom;
    const offsetY = (e.clientY - rect.top) / zoom;

    let hasMoved = false;

    const handleMove = (event) => {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      let newX = (event.clientX - canvasRect.left - pan.x) / zoom - offsetX;
      let newY = (event.clientY - canvasRect.top - pan.y) / zoom - offsetY;
      
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);
      
      if (Math.abs(newX - item.x) > 5 || Math.abs(newY - item.y) > 5) {
        hasMoved = true;
      }
      
      setWarehouses(prev => prev.map(w => 
        w.id === activeWarehouse 
          ? {
              ...w,
              items: w.items.map(i => 
                i.id === itemId ? { ...i, x: newX, y: newY } : i
              )
            }
          : w
      ));
    };
    
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      
      if (!hasMoved && item.url) {
        window.open(item.url, '_blank');
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const addWarehouse = () => {
    if (!newWarehouseName.trim()) {
      alert('Nama gudang harus diisi!');
      return;
    }
    
    const newWarehouse = {
      id: Math.max(...warehouses.map(w => w.id)) + 1,
      name: newWarehouseName,
      location: newWarehouseLocation,
      items: []
    };
    
    setWarehouses([...warehouses, newWarehouse]);
    setShowAddWarehouse(false);
    setNewWarehouseName('');
    setNewWarehouseLocation('');
    setActiveWarehouse(newWarehouse.id);
  };

  const deleteWarehouse = (warehouseId) => {
    /*if (warehouses.length === 1) {
      alert('Minimal harus ada 1 gudang!');
      return;
    }*/
    
    if (window.confirm('Yakin ingin menghapus gudang ini? Semua barang di dalamnya akan terhapus.')) {
      setWarehouses(warehouses.filter(w => w.id !== warehouseId));
      if (activeWarehouse === warehouseId) {
        setActiveWarehouse(warehouses[0].id);
      }
    }
  };

  const editWarehouse = (warehouseId) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    const newName = window.prompt('Nama gudang:', warehouse.name);
    const newLocation = window.prompt('Lokasi gudang:', warehouse.location);
    
    if (newName) {
      setWarehouses(prev => prev.map(w => 
        w.id === warehouseId 
          ? { ...w, name: newName, location: newLocation || w.location }
          : w
      ));
    }
  };

  const addItem = () => {
    if (!newItem.name.trim()) {
      alert('Nama barang harus diisi!');
      return;
    }
    
    const item = {
      ...newItem,
      id: currentWarehouse.items.length > 0 
        ? Math.max(...currentWarehouse.items.map(i => i.id)) + 1 
        : 1,
      x: 300,
      y: 200
    };
    
    setWarehouses(prev => prev.map(w => 
      w.id === activeWarehouse 
        ? { ...w, items: [...w.items, item] }
        : w
    ));
    
    setShowAddItem(false);
    setNewItem({
      name: '',
      color: '#646cff',
      url: '',
      fifo: new Date().toISOString().split('T')[0],
      expired: '',
      quantity: 0,
      status: 'stop',
      category: ''
    });
  };

  const deleteItem = (itemId) => {
    setWarehouses(prev => prev.map(w => 
      w.id === activeWarehouse 
        ? { ...w, items: w.items.filter(i => i.id !== itemId) }
        : w
    ));
  };

  const duplicateItem = (itemId) => {
    const item = currentWarehouse.items.find(i => i.id === itemId);
    const newItemCopy = {
      ...item,
      id: Math.max(...currentWarehouse.items.map(i => i.id)) + 1,
      x: item.x + 30,
      y: item.y + 30
    };
    
    setWarehouses(prev => prev.map(w => 
      w.id === activeWarehouse 
        ? { ...w, items: [...w.items, newItemCopy] }
        : w
    ));
  };

  const startEdit = (itemId) => {
    const item = currentWarehouse.items.find(i => i.id === itemId);
    setTempItem({ ...item });
    setEditingItem(itemId);
  };

  const saveEdit = () => {
    setWarehouses(prev => prev.map(w => 
      w.id === activeWarehouse 
        ? {
            ...w,
            items: w.items.map(i => 
              i.id === editingItem ? tempItem : i
            )
          }
        : w
    ));
    setEditingItem(null);
  };

  const toggleInfo = (itemId) => {
    if (infoTimeoutRef.current) {
      clearTimeout(infoTimeoutRef.current);
    }

    if (showInfo === itemId) {
      setShowInfo(null);
    } else {
      setShowInfo(itemId);
      infoTimeoutRef.current = setTimeout(() => {
        setShowInfo(null);
      }, 5000);
    }
  };

  const closeInfo = () => {
    if (infoTimeoutRef.current) {
      clearTimeout(infoTimeoutRef.current);
    }
    setShowInfo(null);
  };

  const stats = {
    totalItems: currentWarehouse?.items.length || 0,
    stopItems: currentWarehouse?.items.filter(i => i.status === 'stop').length || 0,
    outItems: currentWarehouse?.items.filter(i => i.status === 'out').length || 0,
    expiringSoon: currentWarehouse?.items.filter(i => isExpiringSoon(i.expired)).length || 0,
    expired: currentWarehouse?.items.filter(i => isExpired(i.expired)).length || 0
  };

  // 💥 FUNGSI CETAK LOKASI GUDANG BARU 💥
  const printWarehouseLayout = (warehouse) => {
    if (!warehouse) return;

    // Sortir item berdasarkan Nama (untuk kerapian laporan)
    const sortedItems = [...warehouse.items].sort((a, b) => 
        a.name.localeCompare(b.name)
    );

    // Buat konten HTML untuk cetak
    let printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Laporan Lokasi Gudang: ${warehouse.name}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                h1 { color: #2d3748; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                h2 { color: #4a5568; margin-top: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
                th { background-color: #f7fafc; font-weight: 600; }
                /* Styles untuk Laporan Cetak */
                .status-stop { background-color: #fcebeb; color: #c53030; font-weight: bold; padding: 2px 5px; border-radius: 4px; display: inline-block;}
                .status-out { background-color: #d1fae5; color: #276749; font-weight: bold; padding: 2px 5px; border-radius: 4px; display: inline-block;}
                .status-badge { text-transform: uppercase; }
            </style>
        </head>
        <body>
            <h1>Laporan Lokasi Gudang</h1>
            <h2>${warehouse.name} (${warehouse.location}) - Total: ${warehouse.items.length} Barang</h2>
            
            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Nama Barang</th>
                        <th>Code</th>
                        <th>Qty</th>
                        <th>Lokasi (X, Y)</th>
                        <th>Status</th>
                        <th>FIFO</th>
                        <th>Expired</th>
                    </tr>
                </thead>
                <tbody>
    `;

    sortedItems.forEach((item, index) => {
        let statusClass = item.status ? `status-${item.status}` : '';
        
        printContent += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.category || '-'}</td>
                <td>${item.quantity}</td>
                <td>(${Math.round(item.x)}, ${Math.round(item.y)})</td>
                <td><span class="${statusClass} status-badge">${item.status ? item.status.toUpperCase() : '-'}</span></td>
                <td>${item.fifo || '-'}</td>
                <td>${item.expired || '-'}</td>
            </tr>
        `;
    });

    printContent += `
                </tbody>
            </table>
        </body>
        </html>
    `;

    // Buka jendela baru dan cetak
    const printWindow = window.open('', '_blank', 'height=600,width=800');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };
  
  return (
    <div className="wms-container">

      <div className="warehouse-tabs">
        <div className="tabs-list">
          {warehouses.map(warehouse => (
            <div
              key={warehouse.id}
              className={`warehouse-tab ${activeWarehouse === warehouse.id ? 'active' : ''}`}
              onClick={() => setActiveWarehouse(warehouse.id)}
            >
              <div className="tab-content">
                <span className="tab-name">{warehouse.name}</span>
                <span className="tab-location">{warehouse.location}</span>
                <span className="tab-count">{warehouse.items.length} item</span>
              </div>
              <div className="tab-actions">
                <button onClick={(e) => { e.stopPropagation(); editWarehouse(warehouse.id); }} title="Edit">✏️</button>
                <button onClick={(e) => { e.stopPropagation(); deleteWarehouse(warehouse.id); }} title="Hapus">🗑️</button>
              </div>
            </div>
          ))}
          <button className="add-warehouse-btn" onClick={() => setShowAddWarehouse(true)}>
            ➕ Tambah Gudang
          </button>
        </div>
      </div>

      <div className="stats-dashboard">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalItems}</div>
            <div className="stat-label">Total Barang</div>
          </div>
        </div>
        <div className="stat-card stop">
          <div className="stat-icon">⏸️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.stopItems}</div>
            <div className="stat-label">Status STOP</div>
          </div>
        </div>
        <div className="stat-card out">
          <div className="stat-icon">📤</div>
          <div className="stat-info">
            <div className="stat-value">{stats.outItems}</div>
            <div className="stat-label">Status OUT</div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.expiringSoon}</div>
            <div className="stat-label">Segera Expired</div>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <div className="stat-value">{stats.expired}</div>
            <div className="stat-label">Sudah Expired</div>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            placeholder="🔍 Cari barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Semua Status</option>
            <option value="stop">STOP</option>
            <option value="out">OUT</option>
          </select>
        </div>
        {/* 💥 PERBAIKAN: PENEMPATAN TOMBOL CETAK 💥 */}
        <div className="toolbar-right">
          <div className="zoom-controls">
            <button onClick={() => setZoom(Math.min(zoom + 0.2, 3))} title="Zoom In">🔍+</button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.max(zoom - 0.2, 0.3))} title="Zoom Out">🔍-</button>
            <button onClick={resetView} title="Reset View">🎯</button>
          </div>
          
          <button className="add-item-btn print-btn" onClick={() => printWarehouseLayout(currentWarehouse)} title="Cetak Lokasi Gudang">
            🖨️ Cetak Lokasi
          </button>
          
          <button className="add-item-btn" onClick={() => setShowAddItem(true)}>
            ➕ Tambah Barang
          </button>
        </div>
      </div>

      <div 
        className="warehouse-canvas-wrapper" 
        ref={containerRef}
        /* onWheel={handleWheel} */ /* ZOOM WITH TRACKPAD - DISABLED */
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        <div 
          className="warehouse-canvas"
          ref={canvasRef}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`warehouse-item ${isExpired(item.expired) ? 'expired' : isExpiringSoon(item.expired) ? 'expiring' : ''}`}
              onMouseDown={(e) => handleMouseDown(e, item.id)}
              style={{
                left: item.x,
                top: item.y,
                cursor: 'grab'
              }}
            >
              <div className="item-label" style={{ backgroundColor: item.color }}>
                <div className="item-name"> jenis : {item.name} = {item.quantity}</div>
                {item.status && 
                  (item.status === 'stop' || item.status === 'out') && 
                  (
                    <span className={`status-badge status-${item.status}`}>
                      {item.status.toUpperCase()}
                    </span>
                  )
                } {item.fifo}
              </div>

              <div className="item-controls item-controls-hover">
                <button onClick={(e) => { e.stopPropagation(); toggleInfo(item.id); }} title="Info">ℹ️</button>
                <button onClick={(e) => { e.stopPropagation(); startEdit(item.id); }} title="Edit">✏️</button>
                <button onClick={(e) => { e.stopPropagation(); duplicateItem(item.id); }} title="copy">📋</button>
                <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} title="Hapus">🗑️</button>
              </div>

              {showInfo === item.id && (
                <div className="item-info-box" onClick={(e) => e.stopPropagation()}>
                  <button className="info-close" onClick={closeInfo}>✕</button>
                  <div className="info-row"><strong>Nama:</strong> {item.name}</div>
                  <div className="info-row"><strong>Code:</strong> {item.category}</div>
                  <div className="info-row"><strong>FIFO:</strong> {item.fifo}</div>
                  <div className="info-row"><strong>Expired:</strong> {item.expired || '-'}</div>
                  <div className="info-row"><strong>Jumlah:</strong> {item.quantity}</div>
                  <div className="info-row">
                    <strong>Status:</strong>
                    <span className={`status-badge status-${item.status}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>Gudang Kosong</h3>
              <p>Belum ada barang di gudang ini. Klik "Tambah Barang" untuk mulai mengelola inventori.</p>
            </div>
          )}
        </div>
      </div>

      {showAddWarehouse && (
        <div className="modal-overlay" onClick={() => setShowAddWarehouse(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Tambah Gudang Baru</h2>
            <label>
              Nama Gudang: <span className="required">*</span>
              <input type="text" value={newWarehouseName} onChange={(e) => setNewWarehouseName(e.target.value)} placeholder="Contoh: Gudang A" />
            </label>
            <label>
              Lokasi:
              <input type="text" value={newWarehouseLocation} onChange={(e) => setNewWarehouseLocation(e.target.value)} placeholder="Contoh: Surabaya" />
            </label>
            <div className="modal-actions">
              <button className="btn-primary" onClick={addWarehouse}>💾 Simpan</button>
              <button className="btn-secondary" onClick={() => setShowAddWarehouse(false)}>❌ Batal</button>
            </div>
          </div>
        </div>
      )}

      {showAddItem && (
        <div className="modal-overlay" onClick={() => setShowAddItem(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>Tambah Barang Baru</h2>
            <div className="modal-grid">
              <label>Nama Barang: <span className="required">*</span><input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} /></label>
              <label>Code:<input type="text" value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} /></label>
              <label>Warna Label:<div style={{display: 'flex', gap: '10px'}}><input type="color" value={newItem.color} onChange={(e) => setNewItem({...newItem, color: e.target.value})} /><input type="text" value={newItem.color} onChange={(e) => setNewItem({...newItem, color: e.target.value})} style={{width: '100px'}} /></div></label>
              <label>URL Link:<input type="text" value={newItem.url} onChange={(e) => setNewItem({...newItem, url: e.target.value})} /></label>
              <label>Tanggal Masuk (FIFO):<input type="date" value={newItem.fifo} onChange={(e) => setNewItem({...newItem, fifo: e.target.value})} /></label>
              <label>Tanggal Expired:<input type="date" value={newItem.expired} onChange={(e) => setNewItem({...newItem, expired: e.target.value})} /></label>
              <label>Jumlah:<input type="number" value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})} min="0" /></label>
              <label>Status:<select value={newItem.status} onChange={(e) => setNewItem({...newItem, status: e.target.value})}><option value="stop">STOP</option><option value="out">OUT</option></select></label>
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={addItem}>💾 Simpan</button>
              <button className="btn-secondary" onClick={() => setShowAddItem(false)}>❌ Batal</button>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Barang</h2>
            <div className="modal-grid">
              <label>Nama Barang:<input type="text" value={tempItem.name} onChange={(e) => setTempItem({...tempItem, name: e.target.value})} /></label>
              <label>Kategori:<input type="text" value={tempItem.category} onChange={(e) => setTempItem({...tempItem, category: e.target.value})} /></label>
              <label>Warna Label:<div style={{display: 'flex', gap: '10px'}}><input type="color" value={tempItem.color} onChange={(e) => setTempItem({...tempItem, color: e.target.value})} /><input type="text" value={tempItem.color} onChange={(e) => setTempItem({...tempItem, color: e.target.value})} style={{width: '100px'}} /></div></label>
              <label>URL Link:<input type="text" value={tempItem.url} onChange={(e) => setTempItem({...tempItem, url: e.target.value})} /></label>
              <label>Tanggal Masuk (FIFO):<input type="date" value={tempItem.fifo} onChange={(e) => setTempItem({...tempItem, fifo: e.target.value})} /></label>
              <label>Tanggal Expired:<input type="date" value={tempItem.expired} onChange={(e) => setTempItem({...tempItem, expired: e.target.value})} /></label>
              <label>Jumlah:<input type="number" value={tempItem.quantity} onChange={(e) => setTempItem({...tempItem, quantity: parseInt(e.target.value) || 0})} min="0" /></label>
              <label>Status:<select value={tempItem.status} onChange={(e) => setTempItem({...tempItem, status: e.target.value})}><option value="stop">STOP</option><option value="out">OUT</option></select></label>
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={saveEdit}>💾 Simpan</button>
              <button className="btn-secondary" onClick={() => setEditingItem(null)}>❌ Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
