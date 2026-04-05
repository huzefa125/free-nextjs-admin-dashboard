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
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
  });

  // Queries
  const { data: qData, isLoading: loading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get("/customers"),
  });
  const customers = qData?.data || [];

  // Mutations
  const customerMutation = useMutation({
    mutationFn: (data: any) => editingId ? api.put(`/customers/${editingId}`, data) : api.post("/customers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsModalOpen(false);
      toast.success(editingId ? "Customer updated!" : "Customer added!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Operation failed");
    },
    onSettled: () => setIsSubmitting(false)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted!");
    },
    onError: () => toast.error("Deletion failed")
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "", mobile: "", email: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (customer: any) => {
    setEditingId(customer._id);
    setFormData({
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    customerMutation.mutate(formData);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      background: document.documentElement.classList.contains("dark") ? "#1a222c" : "#fff",
      color: document.documentElement.classList.contains("dark") ? "#fff" : "#000"
    });

    if (result.isConfirmed) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">Customer Directory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and view all your garage customers.</p>
        </div>
        <Button onClick={openAddModal} startIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}>
          Add Customer
        </Button>
      </div>

      <ComponentCard title="Active Customers">
        <div className="overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-400 text-start text-theme-xs uppercase">Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-400 text-start text-theme-xs uppercase">Contact</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-400 text-start text-theme-xs uppercase">Email</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-400 text-start text-theme-xs uppercase">Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="px-5 py-8 text-center text-gray-400">Loading customers...</TableCell></TableRow>
                ) : (
                  customers.map((customer: any) => (
                    <TableRow key={customer._id}>
                      <TableCell 
                      className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90 cursor-pointer hover:text-brand-500 hover:underline transition-all"
                      onClick={() => openEditModal(customer)}
                    >
                      {customer.name}
                    </TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-500 font-bold">{customer.mobile}</TableCell>
                      <TableCell className="px-5 py-4 text-start text-gray-500">{customer.email || "N/A"}</TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                           <button onClick={() => openEditModal(customer)} className="p-2 text-gray-500 hover:text-brand-500">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDelete(customer._id)} className="p-2 text-gray-500 hover:text-red-500">
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
          <h3 className="text-lg font-bold">{editingId ? "Edit Customer" : "Add New Customer"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required />
            <Input label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleInputChange} required />
            <Input label="Email Address (Optional)" name="email" type="email" value={formData.email} onChange={handleInputChange} />
            <div className="flex items-center justify-end gap-3 pt-4">
              <button className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-lg" onClick={() => setIsModalOpen(false)} type="button">Cancel</button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Processing..." : editingId ? "Save Changes" : "Add Customer"}</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
