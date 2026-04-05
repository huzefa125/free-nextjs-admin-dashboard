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
import SearchableSelect from "@/components/form/SearchableSelect";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function VehiclesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerId: "",
    model: "",
    registrationNumber: "",
    status: "Active",
    purchaseAmount: 0,
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  // Queries
  const vehQuery = useQuery({ queryKey: ["vehicles"], queryFn: () => api.get("/vehicles") });
  const custQuery = useQuery({ queryKey: ["customers"], queryFn: () => api.get("/customers") });

  const vehicles = vehQuery.data?.data || [];
  const customers = custQuery.data?.data || [];
  const loading = vehQuery.isLoading || custQuery.isLoading;

  // Mutations
  const vehicleMutation = useMutation({
    mutationFn: (data: any) => editingId ? api.put(`/vehicles/${editingId}`, data) : api.post("/vehicles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setIsModalOpen(false);
      toast.success(editingId ? "Details updated!" : "New vehicle added!");
    },
    onError: (err: any) => toast.error(err.message || "Failed"),
    onSettled: () => setIsSubmitting(false)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle removed");
    },
    onError: () => toast.error("Deletion failed")
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    vehicleMutation.mutate(formData);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Remove Vehicle?",
      text: "This record will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      background: document.documentElement.classList.contains("dark") ? "#1a222c" : "#fff",
      color: document.documentElement.classList.contains("dark") ? "#fff" : "#000"
    });

    if (result.isConfirmed) {
      deleteMutation.mutate(id);
    }
  };

  const openEditModal = (vh: any) => {
    setEditingId(vh._id);
    setFormData({
      customerId: vh.customerId?._id || vh.customerId || "",
      model: vh.model,
      registrationNumber: vh.registrationNumber,
      status: vh.status,
      purchaseAmount: vh.purchaseAmount || 0,
      purchaseDate: vh.purchaseDate ? new Date(vh.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">Garage Inventory</h1>
          <p className="text-sm text-gray-500 font-medium">Manage all vehicles and their ownership details.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ customerId: "", model: "", registrationNumber: "", status: "Active", purchaseAmount: 0, purchaseDate: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); }}>Add Vehicle</Button>
      </div>

      <ComponentCard title="Vehicle Directory">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-tight text-xs">Reg No</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-tight text-xs">Model</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-tight text-xs">Current Owner</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-tight text-xs">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 text-end font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-tight text-xs">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={5} className="py-12 text-center text-gray-400">Loading vehicles...</TableCell></TableRow> : 
                vehicles.map((vh: any) => (
                  <TableRow key={vh._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <TableCell 
                      className="px-5 py-4 font-bold text-gray-900 dark:text-white/90 uppercase tracking-wider cursor-pointer hover:text-brand-500 hover:underline transition-all"
                      onClick={() => openEditModal(vh)}
                    >
                      {vh.registrationNumber}
                    </TableCell>
                    <TableCell className="px-5 py-4 font-extrabold uppercase text-gray-700 dark:text-gray-400">{vh.model}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-600 dark:text-gray-400">{vh.customerId?.name || "No Owner"}</TableCell>
                    <TableCell className="px-5 py-4"><Badge color={vh.status === "Sold" ? "error" : "success"}>{vh.status}</Badge></TableCell>
                    <TableCell className="px-5 py-4 text-end">
                      <div className="flex justify-end gap-1.5 h-full">
                        <button onClick={() => openEditModal(vh)} className="p-2 text-gray-400 hover:text-brand-500 rounded-lg transition-all" title="Edit Vehicle">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(vh._id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-all" title="Delete Vehicle">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </div>
      </ComponentCard>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[600px] p-8">
        <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">New Vehicle Entry</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <SearchableSelect label="Select Owner" options={customers.map((c: any) => ({ label: c.name, value: c._id }))} 
            value={formData.customerId} onChange={(val) => setFormData({...formData, customerId: val})} placeholder="Choose a customer..." />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Vehicle Model" placeholder="e.g. BMW M4" name="model" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} required />
            <Input label="Registration Number" placeholder="GJ-01-XX-0000" name="registrationNumber" value={formData.registrationNumber} onChange={(e) => setFormData({...formData, registrationNumber: e.target.value.toUpperCase()})} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <Input label="Purchase Date" type="date" value={formData.purchaseDate} onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})} required />
          </div>

          <div className="flex justify-center gap-4 pt-8">
            <button onClick={() => setIsModalOpen(false)} type="button" className="px-8 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
            <Button type="submit" startIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
                Register Vehicle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
