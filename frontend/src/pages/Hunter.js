import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Package } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

// Component for inventory item controls
function InventoryItemControls({ item, onStockChange, isAdmin }) {
  const [quantity, setQuantity] = useState("");
  const [isPersonalUse, setIsPersonalUse] = useState(false);

  const handleAdd = () => {
    if (!isAdmin) {
      toast.error("Nur Admins können Bestand hinzufügen");
      return;
    }
    const qty = parseInt(quantity);
    if (qty && qty > 0) {
      onStockChange(item.id, qty, false);
      setQuantity("");
      setIsPersonalUse(false);
    }
  };

  const handleRemove = () => {
    const qty = parseInt(quantity);
    if (qty && qty > 0) {
      onStockChange(item.id, -qty, isPersonalUse);
      setQuantity("");
      setIsPersonalUse(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isAdmin) {
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
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
        {isAdmin && (
          <Button
            data-testid={`add-stock-${item.id}`}
            onClick={handleAdd}
            className="rdr-button"
          >
            +
          </Button>
        )}
        <Button
          data-testid={`remove-stock-${item.id}`}
          onClick={handleRemove}
          className="rdr-button"
        >
          -
        </Button>
      </div>
      <div className="flex items-center gap-2 pl-2">
        <input
          type="checkbox"
          id={`eigenbedarf-${item.id}`}
          data-testid={`eigenbedarf-${item.id}`}
          checked={isPersonalUse}
          onChange={(e) => setIsPersonalUse(e.target.checked)}
          className="w-4 h-4 rounded border-2 border-[#8b7355] cursor-pointer"
          style={{ accentColor: '#8b7355' }}
        />
        <label 
          htmlFor={`eigenbedarf-${item.id}`} 
          className="text-xs cursor-pointer select-none"
          style={{ color: '#6d5838' }}
        >
          Als Eigenbedarf markieren
        </label>
      </div>
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
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, id: null, name: "" });

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
        bratwurstCrafts,
        dosenwurstCrafts,
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
    if (!user.is_admin) {
      toast.error("Nur Admins können Items löschen");
      return;
    }
    try {
      await axios.delete(`${API}/inventory/${id}`);
      toast.success("Item gelöscht");
      setDeleteDialog({ open: false, type: null, id: null, name: "" });
      loadInventory();
    } catch (err) {
      toast.error("Fehler beim Löschen");
    }
  };

  const handleStockChange = async (itemId, quantity, isPersonalUse = false) => {
    if (!user.is_admin && quantity > 0) {
      toast.error("Nur Admins können Bestand hinzufügen");
      return;
    }
    try {
      await axios.post(`${API}/inventory/stock`, { 
        item_id: itemId, 
        quantity,
        is_personal_use: isPersonalUse
      });
      toast.success("Bestand aktualisiert");
      loadInventory();
      loadProtocol();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Fehler beim Aktualisieren");
    }
  };

  const addSaleItem = (item) => {
    const exists = saleItems.find(si => si.id === item.id);
    if (!exists) {
      setSaleItems([...saleItems, { ...item, saleQuantity: 1 }]);
    }
  };

  const updateSaleQuantity = (itemId, quantity) => {
    setSaleItems(saleItems.map(si => 
      si.id === itemId ? { ...si, saleQuantity: parseInt(quantity) || 0 } : si
    ));
  };

  const removeSaleItem = (itemId) => {
    setSaleItems(saleItems.filter(si => si.id !== itemId));
  };

  const calculateSaleTotal = () => {
    return saleItems.reduce((total, item) => total + (item.price * item.saleQuantity), 0).toFixed(2);
  };

  const handleSell = async () => {
    if (saleItems.length === 0) {
      toast.error("Keine Items zum Verkaufen");
      return;
    }

    // Check if we have enough stock
    for (const saleItem of saleItems) {
      const currentItem = inventory.find(i => i.id === saleItem.id);
      if (!currentItem || currentItem.stock < saleItem.saleQuantity) {
        toast.error(`Nicht genug Bestand für ${saleItem.name}`);
        return;
      }
    }

    try {
      // Remove stock for all items
      for (const saleItem of saleItems) {
        await axios.post(`${API}/inventory/stock`, { 
          item_id: saleItem.id, 
          quantity: -saleItem.saleQuantity 
        });
      }
      
      toast.success(`Verkauf abgeschlossen! Gesamt: $${calculateSaleTotal()}`);
      setSaleItems([]);
      loadInventory();
      loadProtocol();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Fehler beim Verkaufen");
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!user.is_admin) {
      toast.error("Nur Admins können Protokoll-Einträge löschen");
      return;
    }
    try {
      await axios.delete(`${API}/protocol/${logId}`);
      toast.success("Eintrag gelöscht");
      setDeleteDialog({ open: false, type: null, id: null, name: "" });
      loadProtocol();
    } catch (err) {
      toast.error("Fehler beim Löschen");
    }
  };

  const openDeleteDialog = (type, id, name) => {
    setDeleteDialog({ open: true, type, id, name });
  };

  const confirmDelete = () => {
    if (deleteDialog.type === 'item') {
      handleDeleteItem(deleteDialog.id);
    } else if (deleteDialog.type === 'log') {
      handleDeleteLog(deleteDialog.id);
    }
  };

  const crafting = calculateCrafting();

  return (
    <div className="max-w-screen-xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-8" style={{ color: '#f4e8d0' }}>Hunter Bereich</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_4fr_3fr_3fr] gap-6">
        {/* Left Column - Calculators */}
        <div className="space-y-6">
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
                <p style={{ color: '#3d2f1f', fontWeight: 600 }}>Crafting benötigt:</p>
                <p style={{ color: '#6d5838' }}>• {crafting.materials.bratwurstCrafts}x Bratwurst craften</p>
                <p style={{ color: '#6d5838' }}>• {crafting.materials.dosenwurstCrafts}x Dosenwurst craften</p>
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
        <div>
          <div className="rdr-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#3d2f1f' }}>Bestandsliste</h3>
              {user.is_admin && (
                <Button
                  data-testid="add-item-button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="rdr-button"
                >
                  <Plus size={16} className="mr-1" />
                  Hinzufügen
                </Button>
              )}
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
                        <div className="flex-1">
                          <h4 className="font-bold" style={{ color: '#3d2f1f' }}>{item.name}</h4>
                          <p className="text-sm" style={{ color: '#6d5838' }}>${item.price}</p>
                          <p className="text-sm" style={{ color: '#6d5838' }}>Bestand: {item.stock}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            data-testid={`add-to-sale-${item.id}`}
                            onClick={() => addSaleItem(item)}
                            className="px-3 py-1 rounded text-sm rdr-button"
                            title="Zum Verkauf hinzufügen"
                          >
                            Verkauf
                          </button>
                          {user.is_admin && (
                            <>
                              <button
                                data-testid={`edit-item-${item.id}`}
                                onClick={() => setEditingItem(item)}
                                className="p-2 rounded hover:bg-[#8b7355] hover:bg-opacity-30"
                                title="Item bearbeiten"
                              >
                                <Edit2 size={16} style={{ color: '#3d2f1f' }} />
                              </button>
                              <button
                                data-testid={`delete-item-${item.id}`}
                                onClick={() => openDeleteDialog('item', item.id, item.name)}
                                className="p-2 rounded hover:bg-[#8b7355] hover:bg-opacity-30"
                                title="Item löschen"
                              >
                                <Trash2 size={16} style={{ color: '#8b4513' }} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <InventoryItemControls item={item} onStockChange={handleStockChange} isAdmin={user.is_admin} />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sales Calculator */}
        <div>
          <div className="rdr-card">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#3d2f1f' }}>Verkaufsrechner</h3>
            
            {saleItems.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: '#6d5838' }}>
                Klicken Sie auf "Verkauf" bei einem Item, um es hinzuzufügen
              </p>
            ) : (
              <>
                <div className="space-y-3 mb-4 scroll-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {saleItems.map((item) => (
                    <div key={item.id} className="p-3 rounded" style={{ background: 'rgba(244, 232, 208, 0.5)' }}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm" style={{ color: '#3d2f1f' }}>{item.name}</h4>
                          <p className="text-xs" style={{ color: '#6d5838' }}>${item.price} / Stück</p>
                        </div>
                        <button
                          data-testid={`remove-sale-${item.id}`}
                          onClick={() => removeSaleItem(item.id)}
                          className="p-1 rounded hover:bg-[#8b7355] hover:bg-opacity-30"
                        >
                          <Trash2 size={14} style={{ color: '#8b4513' }} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs" style={{ color: '#3d2f1f' }}>Menge:</Label>
                        <Input
                          data-testid={`sale-quantity-${item.id}`}
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.saleQuantity}
                          onChange={(e) => updateSaleQuantity(item.id, e.target.value)}
                          className="rdr-input flex-1"
                        />
                      </div>
                      <p className="text-xs mt-2 text-right font-bold" style={{ color: '#3d2f1f' }}>
                        Summe: ${(item.price * item.saleQuantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 rounded mb-4" style={{ background: 'rgba(139, 115, 85, 0.3)' }}>
                  <p className="text-sm" style={{ color: '#3d2f1f' }}>Gesamtsumme:</p>
                  <p className="text-3xl font-bold" data-testid="sale-total" style={{ color: '#3d2f1f' }}>
                    ${calculateSaleTotal()}
                  </p>
                </div>
                
                <Button
                  data-testid="complete-sale-button"
                  onClick={handleSell}
                  className="rdr-button w-full"
                >
                  Verkaufen
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Protocol */}
        <div>
          <div className="rdr-card">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#3d2f1f' }}>Protokoll</h3>
            <div className="space-y-2 scroll-container" style={{ maxHeight: '700px', overflowY: 'auto' }}>
              {protocol.map((log) => (
                <div key={log.id} className="p-3 rounded text-sm flex justify-between items-start" style={{ background: 'rgba(244, 232, 208, 0.5)' }}>
                  <div className="flex-1">
                    <p className="font-bold" style={{ color: '#3d2f1f' }}>{log.username}</p>
                    <p style={{ color: '#6d5838' }}>
                      {log.action === 'added' ? '✓' : '✗'} {log.quantity}x {log.item_name}
                      {log.is_personal_use && <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ background: '#8b7355', color: '#f4e8d0' }}>Eigenbedarf</span>}
                    </p>
                    <p className="text-xs" style={{ color: '#8b7355' }}>
                      {new Date(log.timestamp).toLocaleString('de-DE')}
                    </p>
                  </div>
                  {user.is_admin && (
                    <button
                      data-testid={`delete-log-${log.id}`}
                      onClick={() => openDeleteDialog('log', log.id, log.item_name)}
                      className="p-1 rounded hover:bg-[#8b7355] hover:bg-opacity-30 ml-2"
                      title="Eintrag löschen"
                    >
                      <Trash2 size={14} style={{ color: '#8b4513' }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: null, id: null, name: "" })}>
        <AlertDialogContent className="rdr-card border-4 border-[#8b7355]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold" style={{ color: '#3d2f1f', fontFamily: 'Crimson Text, serif' }}>
              {deleteDialog.type === 'item' ? 'Item löschen?' : 'Protokoll-Eintrag löschen?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base" style={{ color: '#6d5838' }}>
              {deleteDialog.type === 'item' 
                ? `Möchten Sie "${deleteDialog.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
                : `Möchten Sie den Protokoll-Eintrag für "${deleteDialog.name}" wirklich löschen?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rdr-button" style={{ background: 'linear-gradient(to bottom, #6d5838 0%, #5a4a3a 100%)' }}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="rdr-button" 
              style={{ background: 'linear-gradient(to bottom, #8b4513 0%, #6b3410 100%)' }}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}