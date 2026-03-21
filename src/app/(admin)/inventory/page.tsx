"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    purchasePrice: 0,
    status: "Available",
    registrationNumber: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasedFrom: ""
  });

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [expenseData, setExpenseData] = useState({
    description: "",
    amount: 0,
    category: "Parts",
    notes: ""
  });
  const [saleData, setSaleData] = useState({
    salePrice: 0,
    soldTo: "",
    saleDate: new Date().toISOString().split('T')[0]
  });

  const fetchItems = () => {
    setLoading(true);
    api.get("/garage-inventory")
      .then(data => {
        setItems(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch inventory:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ 
      make: "", 
      model: "", 
      year: new Date().getFullYear(), 
      purchasePrice: 0, 
      status: "Available", 
      registrationNumber: "",
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasedFrom: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item._id);
    setFormData({
      make: item.make,
      model: item.model,
      year: item.year,
      purchasePrice: item.purchasePrice || 0,
      status: item.status,
      registrationNumber: item.registrationNumber || "",
      purchaseDate: item.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      purchasedFrom: item.purchasedFrom || ""
    });
    setIsModalOpen(true);
  };

  const openExpenseModal = (item: any) => {
    setSelectedItem(item);
    setExpenseData({ description: "", amount: 0, category: "Parts", notes: "" });
    setIsExpenseModalOpen(true);
  };

  const openSaleModal = (item: any) => {
    setSelectedItem(item);
    setSaleData({ 
      salePrice: item.salePrice || 0, 
      soldTo: item.soldTo || "", 
      saleDate: item.saleDate ? new Date(item.saleDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0] 
    });
    setIsSaleModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading(editingId ? "Updating car record..." : "Adding car to inventory...");
    try {
      if (editingId) {
        await api.put(`/garage-inventory/${editingId}`, formData);
        toast.success("Inventory updated!", { id: loadingToast });
      } else {
        await api.post("/garage-inventory", formData);
        toast.success("Car added to inventory!", { id: loadingToast });
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || "Operation failed", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem?._id) return;
    setIsSubmitting(true);
    const loadingToast = toast.loading("Recording expense...");
    try {
      await api.post(`/garage-inventory/${selectedItem._id}/expense`, expenseData);
      toast.success("Expense recorded!", { id: loadingToast });
      setIsExpenseModalOpen(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to add expense", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem?._id) return;
    setIsSubmitting(true);
    const loadingToast = toast.loading("Recording sale and profit...");
    try {
      await api.post(`/garage-inventory/${selectedItem._id}/sale`, saleData);
      toast.success("Sale recorded Successfully!", { id: loadingToast });
      setIsSaleModalOpen(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to record sale", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Remove from Inventory?",
      text: "This car will be deleted from your garage stock!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#D33",
      background: document.documentElement.classList.contains("dark") ? "#1a222c" : "#fff",
      color: document.documentElement.classList.contains("dark") ? "#fff" : "#000"
    });

    if (result.isConfirmed) {
      const loadingToast = toast.loading("Removing car...");
      try {
        await api.delete(`/garage-inventory/${id}`);
        toast.success("Car removed!", { id: loadingToast });
        fetchItems();
      } catch (err: any) {
        toast.error(err.message || "Failed to remove", { id: loadingToast });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">Garage Inventory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage cars owned by the garage for resale or restoration.</p>
        </div>
        <Button onClick={openAddModal} startIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}>
          Add Car
        </Button>
      </div>

      <ComponentCard title="Inventory Board">
        <div className="overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-400 text-start text-theme-xs uppercase">Vehicle</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-400 text-start text-theme-xs uppercase">Reg No</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-400 text-start text-theme-xs uppercase">Buy Price</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-400 text-start text-theme-xs uppercase">Investment</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-400 text-start text-theme-xs uppercase">Profit/Loss</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-400 text-start text-theme-xs uppercase">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-400 text-start text-theme-xs uppercase">Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="px-5 py-8 text-center text-gray-400">Loading...</TableCell></TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">{item.make} {item.model}</TableCell>
                      <TableCell className="px-5 py-4 text-start font-bold uppercase">{item.registrationNumber || "N/A"}</TableCell>
                      <TableCell className="px-5 py-4 text-start">₹{item.purchasePrice?.toLocaleString()}</TableCell>
                      <TableCell className="px-5 py-4 text-start text-brand-500 font-bold">₹{(item.totalInvestment || item.purchasePrice)?.toLocaleString()}</TableCell>
                      <TableCell className={`px-5 py-4 text-start font-bold ${item.profit > 0 ? "text-success-500" : item.profit < 0 ? "text-error-500" : "text-gray-400"}`}>
                        {item.status === 'Sold' ? (item.profit !== null && item.profit !== undefined ? `₹${item.profit.toLocaleString()}` : '₹0 (Set Price)') : '—'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge size="sm" color={item.status === "Sold" ? "success" : item.status === "Available" ? "primary" : "warning"}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                           <button onClick={() => openExpenseModal(item)} title="Add Expense" className="p-2 text-gray-500 hover:text-orange-500">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           </button>
                           {(item.status === 'Sold' || item.status === 'Ready for Sale' || item.status === 'Available') && (
                             <button onClick={() => openSaleModal(item)} title={item.status === 'Sold' ? "Update Sale Info" : "Record Sale"} className="p-2 text-gray-500 hover:text-success-500">
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                             </button>
                           )}
                           <button onClick={() => openEditModal(item)} className="p-2 text-gray-500 hover:text-brand-500">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                           </button>
                           <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-500 hover:text-red-500">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </ComponentCard>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[500px] p-6">
        <div className="space-y-6">
          <h3 className="text-xl font-bold">{editingId ? "Edit Inventory" : "Add New Inventory"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="MAKE" value={formData.make} onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))} placeholder="Toyota" required />
              <Input label="MODEL" value={formData.model} onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))} placeholder="Corolla" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="YEAR" type="number" value={formData.year} onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))} required />
              <Input label="REG NUMBER" value={formData.registrationNumber} onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value.toUpperCase() }))} placeholder="MH04..." />
            </div>
            <div className="relative">
               <Label>PURCHASE PRICE</Label>
               <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                 <input type="number" className="w-full h-11 pl-8 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm" value={formData.purchasePrice} onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))} required />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Input label="DATE" type="date" value={formData.purchaseDate} onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))} required />
               <Input label="SELLER NAME" value={formData.purchasedFrom} onChange={(e) => setFormData(prev => ({ ...prev, purchasedFrom: e.target.value }))} placeholder="Bought from..." />
            </div>
            <Select label="Status" value={formData.status} onChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
              options={[{ label: "Available", value: "Available" }, { label: "In Restoration", value: "In Restoration" }, { label: "Ready for Sale", value: "Ready for Sale" }, { label: "Sold", value: "Sold" }, { label: "Scrapped", value: "Scrapped" }]} />
            <div className="flex items-center justify-end gap-3 pt-4">
              <button className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-lg" onClick={() => setIsModalOpen(false)} type="button">Cancel</button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Processing..." : editingId ? "Update Inventory" : "Add to Garage"}</Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} className="max-w-[450px] p-6">
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Add Expense: {selectedItem?.make} {selectedItem?.model}</h3>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <Input label="Description" placeholder="e.g. New Tires" value={expenseData.description} onChange={(e) => setExpenseData(prev => ({ ...prev, description: e.target.value }))} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Amount" type="number" value={expenseData.amount} onChange={(e) => setExpenseData(prev => ({ ...prev, amount: Number(e.target.value) }))} required />
              <Select label="Category" value={expenseData.category} onChange={(val) => setExpenseData(prev => ({ ...prev, category: val }))}
                 options={[{ label: "Parts", value: "Parts" }, { label: "Labor", value: "Labor" }, { label: "Fuel", value: "Fuel" }, { label: "Insurance", value: "Insurance" }, { label: "Other", value: "Other" }]} />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <button className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-lg" onClick={() => setIsExpenseModalOpen(false)} type="button">Cancel</button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Recording..." : "Record Expense"}</Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Sale Modal */}
      <Modal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} className="max-w-[450px] p-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-1">
             <h3 className="text-xl font-bold">Sold Car Record: {selectedItem?.make} {selectedItem?.model}</h3>
             <p className="text-sm text-gray-500">Enter final sale price to calculate profit/loss.</p>
          </div>
          <form onSubmit={handleRecordSale} className="space-y-4">
            <Input label="Final Sale Price" type="number" value={saleData.salePrice} onChange={(e) => setSaleData(prev => ({ ...prev, salePrice: Number(e.target.value) }))} required />
            <Input label="Sold To (Customer Name)" value={saleData.soldTo} onChange={(e) => setSaleData(prev => ({ ...prev, soldTo: e.target.value }))} />
            <Input label="Sale Date" type="date" value={saleData.saleDate} onChange={(e) => setSaleData(prev => ({ ...prev, saleDate: e.target.value }))} required />
            
            <div className="p-4 bg-brand-50 rounded-xl border border-brand-100">
               <div className="flex justify-between text-sm">
                  <span className="text-brand-600">Cost so far:</span>
                  <span className="font-bold text-brand-700">₹{(selectedItem?.totalInvestment || selectedItem?.purchasePrice)?.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-sm mt-1">
                  <span className="text-brand-600">Current Profit Estimate:</span>
                  <span className={`font-bold ${saleData.salePrice - (selectedItem?.totalInvestment || selectedItem?.purchasePrice) >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                    ₹{(saleData.salePrice - (selectedItem?.totalInvestment || selectedItem?.purchasePrice))?.toLocaleString()}
                  </span>
               </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-lg" onClick={() => setIsSaleModalOpen(false)} type="button">Cancel</button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Recording..." : "Confirm & Save Profit"}</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
