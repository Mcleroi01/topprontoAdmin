import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Filter,
  Download,
  Phone,
  Mail,
  Loader2,
  ChevronDown,
  X,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";

// Animation variants for Framer Motion
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../components/ui/Table";
import { enterprisesApi } from "../services/api";
import { format } from "date-fns";
import { motion } from "framer-motion";

export function Enterprises() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEnterprise, setSelectedEnterprise] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!selectedEnterprise) {
      setIsDrawerOpen(false);
    } else {
      setIsDrawerOpen(true);
    }
  }, [selectedEnterprise]);

  // Fermer le drawer en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isDrawerOpen &&
        !target.closest("#contact-drawer") &&
        !target.closest(`[data-contact-id]`)
      ) {
        setSelectedEnterprise(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDrawerOpen]);

  const { data: enterprises, isLoading } = useQuery({
    queryKey: ["enterprises", { status: statusFilter, search: searchQuery }],
    queryFn: () =>
      enterprisesApi.getAll({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchQuery || undefined,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "new" | "contacted" | "converted" | "rejected";
    }) => enterprisesApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprises"] });
      queryClient.invalidateQueries({ queryKey: ["enterprises-stats"] });
    },
  });

  const statusOptions = [
    { value: "all", label: t("drivers.all") },
    { value: "new", label: t("enterprises.new") },
    { value: "contacted", label: t("enterprises.contacted") },
    { value: "converted", label: t("enterprises.converted") },
    { value: "rejected", label: t("enterprises.rejected") },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="info">{t("enterprises.new")}</Badge>;
      case "contacted":
        return <Badge variant="warning">{t("enterprises.contacted")}</Badge>;
      case "converted":
        return <Badge variant="success">{t("enterprises.converted")}</Badge>;
      case "rejected":
        return <Badge variant="danger">{t("enterprises.rejected")}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleStatusUpdate = (
    id: string,
    status: "new" | "contacted" | "converted" | "rejected"
  ) => {
    updateStatusMutation.mutate({ id, status });
  };

  const exportToCSV = () => {
    if (!enterprises) return;

    const headers = [
      "Empresa",
      "Email",
      "Telefone",
      "Pessoa de Contato",
      "Cargo",
      "Cidade",
      "Setor",
      "Tipo de Veículo",
      "Entregas Mensais",
      "Status",
      "Data de Criação",
    ];

    const csvContent = [
      headers.join(","),
      ...enterprises.map((enterprise) =>
        [
          `"${enterprise.name}"`,
          enterprise.email,
          enterprise.phone,
          `"${enterprise.contact_person}"`,
          enterprise.position,
          enterprise.city,
          enterprise.industry,
          enterprise.vehicle_type,
          enterprise.monthly_deliveries,
          enterprise.status,
          format(new Date(enterprise.created_at), "dd/MM/yyyy"),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "empresas.csv";
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
        <p className="text-lg font-medium text-gray-600">
          Carregando motoristas...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`space-y-8 p-4 md:p-6 ${isDrawerOpen ? "pr-[30%]" : ""}`}
      >
        {/* En-tête avec titre et boutons d'action */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-green-800 to-green-700 rounded-2xl p-6 text-white shadow-lg"
        >
          <motion.div variants={item} className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-100 ">
              {t("enterprises.title")}
            </h1>
            <p className="text-gray-200">
              Gerencie e visualize todas as empresas cadastradas na plataforma.
            </p>
          </motion.div>

          <motion.div variants={item} className="flex items-center gap-3">
            <Button
              onClick={exportToCSV}
              variant="ghost"
              className="flex items-center gap-2 border border-gray-200 text-gray-100 hover:bg-gray-400"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("enterprises.export")}
              </span>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t("common.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>

            {searchQuery || statusFilter !== "all" ? (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="text-gray-500 hover:bg-gray-100"
              >
                Limpar filtros
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Enterprises Table */}
      <motion.div variants={item} className="overflow-hidden">
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="bg-gray-50">
                <TableRow className="hover:bg-gray-50">
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("enterprises.name")}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    {t("enterprises.contact")}
                  </TableHead>
                  <TableHead>{t("enterprises.contact")}</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Contato
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    {t("enterprises.industry")}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    {t("enterprises.deliveries")}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    {t("common.createdAt")}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enterprises?.map((enterprise) => (
                  <TableRow
                    key={enterprise.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedEnterprise(enterprise)}
                  >
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {enterprise.name}
                      <div className="text-sm text-gray-500">
                        {enterprise.city}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {enterprise.contact_person}
                      <div className="text-sm text-gray-500">
                        {enterprise.position}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="space-y-1">
                        <a
                          href={`mailto:${enterprise.email}`}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          {enterprise.email}
                        </a>
                        <a
                          href={`tel:${enterprise.phone}`}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          {enterprise.phone}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {enterprise.industry}
                      <div className="text-sm text-gray-500">
                        {enterprise.vehicle_type}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {enterprise.monthly_deliveries}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {getStatusBadge(enterprise.status)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {format(new Date(enterprise.created_at), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <select
                        value={enterprise.status}
                        onChange={(e) =>
                          handleStatusUpdate(
                            enterprise.id,
                            e.target.value as any
                          )
                        }
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={updateStatusMutation.isPending}
                      >
                        <option value="new">Novo</option>
                        <option value="contacted">Contatado</option>
                        <option value="converted">Convertido</option>
                        <option value="rejected">Rejeitado</option>
                      </select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {enterprises?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t("common.noData")}
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Enterprise Details Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isDrawerOpen}
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedEnterprise(null)}
        />

        {/* Drawer */}
        <motion.div
          id="enterprise-drawer"
          className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
          initial={{ x: "100%" }}
          animate={{ x: isDrawerOpen ? 0 : "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedEnterprise && (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedEnterprise.name}
                </h2>
                <button
                  onClick={() => setSelectedEnterprise(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Enterprise Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <a
                    href={`mailto:${selectedEnterprise.email}`}
                    className="text-blue-600 hover:text-blue-800 break-all"
                  >
                    {selectedEnterprise.email}
                  </a>
                </div>

                {selectedEnterprise.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Téléphone
                    </h3>
                    <a
                      href={`tel:${selectedEnterprise.phone}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {selectedEnterprise.phone}
                    </a>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Ville</h3>
                  <p className="text-gray-900">{selectedEnterprise.city}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Secteur d'activité
                  </h3>
                  <p className="text-gray-900">{selectedEnterprise.industry}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Type de véhicule
                  </h3>
                  <p className="text-gray-900">
                    {selectedEnterprise.vehicle_type}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Livraisons mensuelles
                  </h3>
                  <p className="text-gray-900">
                    {selectedEnterprise.monthly_deliveries}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Date d'inscription
                  </h3>
                  <p className="text-gray-900">
                    {format(
                      new Date(selectedEnterprise.created_at),
                      "dd/MM/yyyy HH:mm"
                    )}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex space-x-3">
                <Button
                  variant="primary"
                  onClick={() => {
                    // Logique pour contacter l'entreprise
                  }}
                  className="flex-1"
                >
                  Contacter
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
