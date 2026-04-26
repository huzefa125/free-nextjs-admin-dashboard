"use client";

import React, { useEffect, useState } from "react";
import { api, API_BASE_URL } from "@/lib/api";
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
import SearchableSelect from "@/components/form/SearchableSelect";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selection states
  const [selectedCustId, setSelectedCustId] = useState("");
  const [selectedVehId, setSelectedVehId] = useState("");
  const [serviceItems, setServiceItems] = useState([{ description: "", price: 0 }]);

  // Quick Create Modal States
  const [isQuickCustOpen, setIsQuickCustOpen] = useState(false);
  const [isQuickVehOpen, setIsQuickVehOpen] = useState(false);
  const [quickCustFormData, setQuickCustFormData] = useState({ name: "", mobile: "" });
  const [quickVehFormData, setQuickVehFormData] = useState({ model: "", registrationNumber: "" });

  // Queries
  const servicesQuery = useQuery({ queryKey: ["services"], queryFn: () => api.get("/service-jobs") });
  const customersQuery = useQuery({ queryKey: ["customers"], queryFn: () => api.get("/customers") });
  const vehiclesQuery = useQuery({ queryKey: ["vehicles"], queryFn: () => api.get("/vehicles") });

  const services = servicesQuery.data?.data || [];
  const customers = customersQuery.data?.data || [];
  const vehicles = vehiclesQuery.data?.data || [];
  const loading = servicesQuery.isLoading || customersQuery.isLoading || vehiclesQuery.isLoading;

  // Mutations
  const createJobMutation = useMutation({
    mutationFn: (data: any) => api.post("/service-jobs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setIsModalOpen(false);
      resetMainForm();
      toast.success("Service job created!");
    },
    onError: (err: any) => toast.error(err.message || "Failed to create job"),
    onSettled: () => setIsSubmitting(false)
  });

  const quickCustomerMutation = useMutation({
    mutationFn: (data: any) => api.post("/customers", data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setSelectedCustId(res.data._id);
      setIsQuickCustOpen(false);
      setQuickCustFormData({ name: "", mobile: "" });
      toast.success("Customer added!");
    },
    onError: (err: any) => toast.error(err.message || "Failed")
  });

  const quickVehicleMutation = useMutation({
    mutationFn: (data: any) => api.post("/vehicles", data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setSelectedVehId(res.data._id);
      setIsQuickVehOpen(false);
      setQuickVehFormData({ model: "", registrationNumber: "" });
      toast.success("Vehicle added!");
    },
    onError: (err: any) => toast.error(err.message || "Failed")
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/service-jobs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Record deleted");
    },
    onError: () => toast.error("Deletion failed")
  });

  const addServiceItem = () => {
    setServiceItems([...serviceItems, { description: "", price: 0 }]);
  };

  const removeServiceItem = (index: number) => {
    setServiceItems(serviceItems.filter((_, i) => i !== index));
  };

  const updateServiceItem = (index: number, field: string, value: any) => {
    const newItems = [...serviceItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setServiceItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    createJobMutation.mutate({
      customer: selectedCustId,
      vehicle: selectedVehId,
      services: serviceItems
    });
  };

  const resetMainForm = () => {
    setSelectedCustId("");
    setSelectedVehId("");
    setServiceItems([{ description: "", price: 0 }]);
  };

  const handleQuickCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    quickCustomerMutation.mutate(quickCustFormData);
  };

  const handleQuickVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustId) return toast.error("Select customer first!");
    quickVehicleMutation.mutate({ ...quickVehFormData, customerId: selectedCustId });
  };

  const handleDownloadPdf = async (jobId: string) => {
    const loadingToast = toast.loading("Loading Invoice PDF...");
    try {
      await api.post(`/service-jobs/${jobId}/invoice`, {});
      const url = `${API_BASE_URL.replace("/api", "")}/api/service-jobs/${jobId}/download-invoice`;
      window.open(url, '_blank');
      toast.success("PDF ready!", { id: loadingToast });
    } catch (err: any) {
      toast.error("Error creating PDF", { id: loadingToast });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Service Report?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      background: document.documentElement.classList.contains("dark") ? "#1a222c" : "#fff",
      color: document.documentElement.classList.contains("dark") ? "#fff" : "#000"
    });

    if (result.isConfirmed) {
      deleteJobMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">Work Orders & Invoices</h1>
          <p className="text-sm text-gray-500 font-medium">Create and manage repair reports for your customers.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Create New Job</Button>
      </div>

      <ComponentCard title="Service History">
        <div className="overflow-x-auto overflow-y-visible">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-tight text-xs">Job ID</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-tight text-xs">Customer/Owner</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-tight text-xs">Vehicle Info</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-tight text-xs">Total Bill</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-tight text-xs">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 text-end font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-tight text-xs">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-gray-400">Fetching records...</TableCell></TableRow>
              ) : services.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-gray-400">No service jobs found.</TableCell></TableRow>
              ) : (
                services.map((job: any) => (
                  <TableRow key={job._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell 
                      className="px-5 py-4 font-bold text-gray-900 dark:text-white/90 cursor-pointer hover:text-brand-500 hover:underline transition-all"
                      onClick={() => handleDownloadPdf(job._id)}
                    >
                      #{job.invoiceNumber || job._id.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-700 dark:text-gray-300">
                      {job.customer?.name}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className="block font-bold text-gray-800 dark:text-white/90 uppercase">{job.vehicle?.registrationNumber}</span>
                      <span className="block text-xs text-brand-500 font-medium">{job.vehicle?.model}</span>
                    </TableCell>
                    <TableCell className="px-5 py-4 font-extrabold text-gray-900 dark:text-white/90">
                      ₹{job.totalAmount?.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge color={job.status === "Pending" ? "warning" : "success"}>{job.status}</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-end">
                      <div className="flex justify-end gap-1.5 h-full">
                        <button onClick={() => handleDownloadPdf(job._id)} className="p-2 text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 rounded-lg hover:bg-brand-50/50 dark:hover:bg-brand-500/10 transition-all" title="View PDF">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                        <button onClick={() => handleDelete(job._id)} className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-500/10 transition-all" title="Delete Job">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </ComponentCard>

      {/* Main Create Job Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[700px] p-6">
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Service Job</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="flex gap-2 items-end">
                <SearchableSelect label="Select Customer" options={customers.map((c: any) => ({ label: `${c.name} (${c.mobile})`, value: c._id }))} 
                  value={selectedCustId} onChange={setSelectedCustId} className="flex-1" />
                <button type="button" onClick={() => setIsQuickCustOpen(true)} className="h-11 px-3 mb-0.5 border rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-brand-600 font-bold text-xl" title="Quick Add Customer">+</button>
              </div>

              <div className="flex gap-2 items-end">
                <SearchableSelect label="Select Vehicle" options={vehicles.filter((v: any) => v.customerId?._id === selectedCustId || v.customerId === selectedCustId || !selectedCustId).map((v: any) => ({ label: `${v.registrationNumber} - ${v.model}`, value: v._id }))} 
                  value={selectedVehId} onChange={setSelectedVehId} className="flex-1" />
                <button type="button" onClick={() => setIsQuickVehOpen(true)} className="h-11 px-3 mb-0.5 border rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-brand-600 font-bold text-xl disabled:opacity-30 disabled:cursor-not-allowed" title="Quick Add Vehicle" disabled={!selectedCustId}>+</button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center"><Label>Repair Services & Parts</Label><button type="button" onClick={addServiceItem} className="text-brand-600 font-extrabold text-sm hover:underline">+ ADD NEW ROW</button></div>
              <div className="space-y-2">
                {serviceItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start group">
                    <Input placeholder="Description (e.g. Engine Oil Change)" value={item.description} onChange={(e) => updateServiceItem(idx, "description", e.target.value)} required />
                    <Input type="number" placeholder="Price" className="w-[140px]" value={item.price} onChange={(e) => updateServiceItem(idx, "price", Number(e.target.value))} required />
                    {serviceItems.length > 1 && (
                      <button type="button" onClick={() => removeServiceItem(idx)} className="mt-2 text-red-500 hover:text-red-700 opacity-70 hover:opacity-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/[0.05]">
              <button onClick={() => setIsModalOpen(false)} type="button" className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700">Cancel</button>
              <Button type="submit" disabled={isSubmitting || !selectedCustId || !selectedVehId}>{isSubmitting ? "Generating..." : "Generate Pro-Invoice"}</Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Quick Add Modals stay simple but clean */}
      <Modal isOpen={isQuickCustOpen} onClose={() => setIsQuickCustOpen(false)} className="max-w-[400px] p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Quick Add Customer</h3>
        <form onSubmit={handleQuickCustomer} className="space-y-4">
          <Input label="Full Name" value={quickCustFormData.name} onChange={(e) => setQuickCustFormData({...quickCustFormData, name: e.target.value})} required />
          <Input label="Mobile / Contact" value={quickCustFormData.mobile} onChange={(e) => setQuickCustFormData({...quickCustFormData, mobile: e.target.value})} required />
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsQuickCustOpen(false)} type="button" className="px-4 py-2 text-sm text-gray-500">Cancel</button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isQuickVehOpen} onClose={() => setIsQuickVehOpen(false)} className="max-w-[400px] p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Quick Add Vehicle</h3>
        <form onSubmit={handleQuickVehicle} className="space-y-4">
          <Input label="Vehicle Model" value={quickVehFormData.model} onChange={(e) => setQuickVehFormData({...quickVehFormData, model: e.target.value})} required />
          <Input label="Registration Number" value={quickVehFormData.registrationNumber} onChange={(e) => setQuickVehFormData({...quickVehFormData, registrationNumber: e.target.value.toUpperCase()})} required />
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsQuickVehOpen(false)} type="button" className="px-4 py-2 text-sm text-gray-500">Cancel</button>
            <Button type="submit">Add Vehicle</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
