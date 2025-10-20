import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Package } from "lucide-react";

// Component for inventory item controls
function InventoryItemControls({ item, onStockChange }) {
  const [quantity, setQuantity] = useState("");

  const handleAdd = () => {
    const qty = parseInt(quantity);
    if (qty && qty > 0) {
      onStockChange(item.id, qty);
      setQuantity("");
    }
  };

  const handleRemove = () => {
    const qty = parseInt(quantity);
    if (qty && qty > 0) {
      onStockChange(item.id, -qty);
      setQuantity("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        data-testid={`quantity-${item.id}`}
        type="number"
        placeholder="Menge"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        onKeyPress={handleKeyPress}
        className="rdr-input flex-1"
      />
      <Button
        data-testid={`add-stock-${item.id}`}
        onClick={handleAdd}
        className="rdr-button"
      >
        +
      </Button>
      <Button
        data-testid={`remove-stock-${item.id}`}
        onClick={handleRemove}
        className="rdr-button"
      >
        -
      </Button>
    </div>
  );
}

export default function Hunter({ user }) {
  const [inventory, setInventory] = useState([]);
  const [protocol, setProtocol] = useState([]);
  const [packages, setPackages] = useState(1);
  const [newItem, setNewItem] = useState({ name: "", price: 0, stock: 0 });
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saleItems, setSaleItems] = useState([]);

  useEffect(() => {
    loadInventory();
    loadProtocol();
  }, []);

  const loadInventory = async () => {
    try {
      const res = await axios.get(`${API}/inventory`);
      setInventory(res.data);
    } catch (err) {
      toast.error("Fehler beim Laden des Inventars");
    }
  };

  const loadProtocol = async () => {
    try {
      const res = await axios.get(`${API}/protocol`);
      setProtocol(res.data);
    } catch (err) {
      toast.error("Fehler beim Laden des Protokolls");
    }
  };

  const calculatePackagePrice = () => {
    const qty = parseInt(packages) || 0;
    let pricePerPackage = 40;
    if (qty >= 10) pricePerPackage = 35;
    else if (qty >= 5) pricePerPackage = 37;
    return qty * pricePerPackage;
  };

  const calculateCrafting = () => {
    const qty = parseInt(packages) || 0;
    const bratwurstNeeded = qty * 50;
    const dosenwurstNeeded = qty * 50;
    
    // Bratwurst: 1 Tierdarm + 1 Schweinefleisch = 15 Bratwurst
    const bratwurstCrafts = Math.ceil(bratwurstNeeded / 15);
    const tierdarm = bratwurstCrafts;
    const schweinefleisch = bratwurstCrafts;
    
    // Dosenwurst: 1 Dose + 2 Fett + 5 Wildfleisch = 10 Dosenwurst
    const dosenwurstCrafts = Math.ceil(dosenwurstNeeded / 10);
    const dose = dosenwurstCrafts;
    const fett = dosenwurstCrafts * 2;
    const wildfleisch = dosenwurstCrafts * 5;
    
    return {
      bratwurst: bratwurstNeeded,
      dosenwurst: dosenwurstNeeded,
      materials: {
        tierdarm,
        schweinefleisch,
        dose,
        fett,
        wildfleisch
      }
    };
  };

  const handleAddItem = async () => {
    try {
      await axios.post(`${API}/inventory`, newItem);
      toast.success("Item hinzugefügt");
      setNewItem({ name: "", price: 0, stock: 0 });
      setShowAddForm(false);
      loadInventory();
    } catch (err) {
      toast.error("Fehler beim Hinzufügen");
    }
  };

  const handleUpdateItem = async () => {
    try {
      await axios.put(`${API}/inventory/${editingItem.id}`, editingItem);
      toast.success("Item aktualisiert");
      setEditingItem(null);
      loadInventory();
    } catch (err) {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Item wirklich löschen?")) return;
    try {
      await axios.delete(`${API}/inventory/${id}`);
      toast.success("Item gelöscht");
      loadInventory();
    } catch (err) {
      toast.error("Fehler beim Löschen");
    }
  };

  const handleStockChange = async (itemId, quantity) => {
    try {
      await axios.post(`${API}/inventory/stock`, { item_id: itemId, quantity });
      toast.success("Bestand aktualisiert");
      loadInventory();
      loadProtocol();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Fehler beim Aktualisieren");
    }
  };

  const crafting = calculateCrafting();

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-8" style={{ color: '#f4e8d0' }}>Hunter Bereich</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Calculators */}
        <div className="lg:col-span-4 space-y-6">
          {/* Package Calculator */}
          <div className="rdr-card" data-testid="package-calculator">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#3d2f1f' }}>
              <Package className="inline mr-2" size={20} />
              Paket Kalkulator
            </h3>
            <div className="space-y-4">
              <div>
                <Label style={{ color: '#3d2f1f' }}>Anzahl Pakete</Label>
                <Input
                  data-testid="package-quantity-input"
                  type="number"
                  min="1"
                  value={packages}
                  onChange={(e) => setPackages(e.target.value)}
                  className="rdr-input w-full"
                />
              </div>
              <div className="p-3 rounded" style={{ background: 'rgba(139, 115, 85, 0.2)' }}>
                <p className="text-sm" style={{ color: '#3d2f1f' }}>Preis pro Paket:</p>
                <p className="text-2xl font-bold" style={{ color: '#6d5838' }}>
                  ${parseInt(packages) >= 10 ? '35' : parseInt(packages) >= 5 ? '37' : '40'}
                </p>
              </div>
              <div className="p-4 rounded" style={{ background: 'rgba(139, 115, 85, 0.3)' }}>
                <p className="text-sm" style={{ color: '#3d2f1f' }}>Gesamtpreis:</p>
                <p className="text-3xl font-bold" data-testid="total-price" style={{ color: '#3d2f1f' }}>
                  ${calculatePackagePrice()}
                </p>
              </div>
            </div>
          </div>

          {/* Crafting Calculator */}
          <div className="rdr-card" data-testid="crafting-calculator">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#3d2f1f' }}>Crafting Rechner</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded" style={{ background: 'rgba(139, 115, 85, 0.15)' }}>
                <p style={{ color: '#3d2f1f', fontWeight: 600 }}>Benötigt:</p>
                <p style={{ color: '#6d5838' }}>• {crafting.bratwurst}x Bratwurst</p>
                <p style={{ color: '#6d5838' }}>• {crafting.dosenwurst}x Dosenwurst</p>
              </div>
              <div className="p-3 rounded" style={{ background: 'rgba(139, 115, 85, 0.15)' }}>
                <p style={{ color: '#3d2f1f', fontWeight: 600 }}>Materialien:</p>
                <p style={{ color: '#6d5838' }}>• {crafting.materials.tierdarm}x Tierdarm</p>
                <p style={{ color: '#6d5838' }}>• {crafting.materials.schweinefleisch}x Schweinefleisch</p>
                <p style={{ color: '#6d5838' }}>• {crafting.materials.dose}x Dose</p>
                <p style={{ color: '#6d5838' }}>• {crafting.materials.fett}x Fett</p>
                <p style={{ color: '#6d5838' }}>• {crafting.materials.wildfleisch}x Wildfleisch</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Inventory */}
        <div className="lg:col-span-5">
          <div className="rdr-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#3d2f1f' }}>Bestandsliste</h3>
              <Button
                data-testid="add-item-button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="rdr-button"
              >
                <Plus size={16} className="mr-1" />
                Hinzufügen
              </Button>
            </div>

            {showAddForm && (
              <div className="mb-4 p-4 rounded" style={{ background: 'rgba(139, 115, 85, 0.15)' }}>
                <h4 className="font-bold mb-3" style={{ color: '#3d2f1f' }}>Neues Item hinzufügen</h4>
                <div className="space-y-3">
                  <div>
                    <Label style={{ color: '#3d2f1f', fontWeight: 600 }}>Name</Label>
                    <Input
                      data-testid="new-item-name"
                      placeholder="z.B. Wildfleisch"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      className="rdr-input"
                    />
                  </div>
                  <div>
                    <Label style={{ color: '#3d2f1f', fontWeight: 600 }}>Preis ($)</Label>
                    <Input
                      data-testid="new-item-price"
                      type="number"
                      step="0.01"
                      placeholder="z.B. 15.50"
                      value={newItem.price}
                      onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}
                      className="rdr-input"
                    />
                  </div>
                  <div>
                    <Label style={{ color: '#3d2f1f', fontWeight: 600 }}>Anfangsbestand (Menge)</Label>
                    <Input
                      data-testid="new-item-stock"
                      type="number"
                      placeholder="z.B. 100"
                      value={newItem.stock}
                      onChange={(e) => setNewItem({...newItem, stock: parseInt(e.target.value)})}
                      className="rdr-input"
                    />
                  </div>
                  <Button data-testid="save-new-item" onClick={handleAddItem} className="rdr-button w-full">Speichern</Button>
                </div>
              </div>
            )}

            <div className="space-y-3 scroll-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {inventory.map((item) => (
                <div key={item.id} className="p-4 rounded" style={{ background: 'rgba(244, 232, 208, 0.5)' }}>
                  {editingItem?.id === item.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                        className="rdr-input"
                      />
                      <Input
                        type="number"
                        value={editingItem.price}
                        onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                        className="rdr-input"
                      />
                      <Input
                        type="number"
                        value={editingItem.stock}
                        onChange={(e) => setEditingItem({...editingItem, stock: parseInt(e.target.value)})}
                        className="rdr-input"
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateItem} className="rdr-button flex-1">Speichern</Button>
                        <Button onClick={() => setEditingItem(null)} className="rdr-button flex-1">Abbrechen</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold" style={{ color: '#3d2f1f' }}>{item.name}</h4>
                          <p className="text-sm" style={{ color: '#6d5838' }}>${item.price}</p>
                          <p className="text-sm" style={{ color: '#6d5838' }}>Bestand: {item.stock}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            data-testid={`edit-item-${item.id}`}
                            onClick={() => setEditingItem(item)}
                            className="p-2 rounded hover:bg-[#8b7355] hover:bg-opacity-30"
                          >
                            <Edit2 size={16} style={{ color: '#3d2f1f' }} />
                          </button>
                          <button
                            data-testid={`delete-item-${item.id}`}
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 rounded hover:bg-[#8b7355] hover:bg-opacity-30"
                          >
                            <Trash2 size={16} style={{ color: '#8b4513' }} />
                          </button>
                        </div>
                      </div>
                      <InventoryItemControls item={item} onStockChange={handleStockChange} />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Protocol */}
        <div className="lg:col-span-3">
          <div className="rdr-card">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#3d2f1f' }}>Protokoll</h3>
            <div className="space-y-2 scroll-container" style={{ maxHeight: '700px', overflowY: 'auto' }}>
              {protocol.map((log) => (
                <div key={log.id} className="p-3 rounded text-sm" style={{ background: 'rgba(244, 232, 208, 0.5)' }}>
                  <p className="font-bold" style={{ color: '#3d2f1f' }}>{log.username}</p>
                  <p style={{ color: '#6d5838' }}>
                    {log.action === 'added' ? '✓' : '✗'} {log.quantity}x {log.item_name}
                  </p>
                  <p className="text-xs" style={{ color: '#8b7355' }}>
                    {new Date(log.timestamp).toLocaleString('de-DE')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}