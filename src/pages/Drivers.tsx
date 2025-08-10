import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  Eye,
  Check,
  X,
  Loader2,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Building,
  User,
  X as XIcon,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
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
import { driversApi } from "../services/api";
import { format } from "date-fns";

// Configuration des animations
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

const statusBadgeVariants = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export function Drivers() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!selectedDriver) {
      setIsDrawerOpen(false);
    } else {
      setIsDrawerOpen(true);
    }
  }, [selectedDriver]);

  // Fermer le drawer en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isDrawerOpen &&
        !target.closest("#contact-drawer") &&
        !target.closest(`[data-contact-id]`)
      ) {
        setSelectedDriver(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDrawerOpen]);

  const { data: drivers, isLoading } = useQuery({
    queryKey: ["drivers", { status: statusFilter, search: searchQuery }],
    queryFn: () =>
      driversApi.getAll({
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
      status: "pending" | "approved" | "rejected";
    }) => driversApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["drivers-stats"] });
    },
  });

  const statusOptions = [
    { value: "all", label: t("drivers.all") },
    { value: "pending", label: t("drivers.pending") },
    { value: "approved", label: t("drivers.approved") },
    { value: "rejected", label: t("drivers.rejected") },
  ];

  // Suppression de la fonction getStatusBadge car remplacée par un système plus simple avec des classes

  const handleStatusUpdate = (
    id: string,
    status: "pending" | "approved" | "rejected"
  ) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleViewDriver = (driver: any) => {
    setSelectedDriver(driver);
    setIsDrawerOpen(true);
  };

  const exportToCSV = () => {
    if (!drivers) return;

    const headers = [
      "Nome",
      "Email",
      "Telefone",
      "Cidade",
      "Tem Veículo",
      "Tipo de Veículo",
      "Anos de Experiência",
      "Status",
      "Data de Criação",
    ];

    const csvContent = [
      headers.join(","),
      ...drivers.map((driver) =>
        [
          `"${driver.first_name} ${driver.last_name}"`,
          driver.email,
          driver.phone,
          driver.city,
          driver.has_vehicle ? "Sim" : "Não",
          driver.vehicle_type || "",
          driver.experience_years,
          driver.status,
          format(new Date(driver.created_at), "dd/MM/yyyy"),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "chauffeurs.csv";
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

  // Composant Drawer pour les détails du conducteur
  const DriverDetailDrawer = () => (
    <div
      className={`fixed inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-xl transform ${
        isDrawerOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out z-50`}
    >
      <div className="h-full flex flex-col">
        {/* En-tête du Drawer */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Détails du conducteur
          </h2>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Contenu du Drawer */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedDriver && (
            <>
              {/* Section Profil */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl font-bold">
                  {selectedDriver.first_name.charAt(0)}
                  {selectedDriver.last_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedDriver.first_name} {selectedDriver.last_name}
                  </h3>
                  <Badge
                    className={`mt-1 ${
                      selectedDriver.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : selectedDriver.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {t(`drivers.${selectedDriver.status}`)}
                  </Badge>
                </div>
              </div>

              {/* Section Détails */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">
                    INFORMATIONS PERSONNELLES
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedDriver.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedDriver.phone || "Non renseigné"}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedDriver.city || "Non renseignée"}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedDriver.experience_years || 0}{" "}
                      {selectedDriver.experience_years === 1 ? "an" : "ans"}{" "}
                      d'expérience
                    </div>
                  </div>
                </div>

                {/* Section Véhicule */}
                {selectedDriver.has_vehicle && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-500">
                      VÉHICULE
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-700">
                        {selectedDriver.vehicle_type ||
                          "Type de véhicule non spécifié"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Section Entreprises */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">
                    ENTREPRISES
                  </h4>
                  <div className="space-y-2">
                    {selectedDriver.enterprises?.length > 0 ? (
                      selectedDriver.enterprises.map((enterprise: any) => (
                        <div
                          key={enterprise.id}
                          className="flex items-center p-3 bg-gray-50 rounded-md"
                        >
                          <Building className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {enterprise.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {enterprise.role || "Rôle non spécifié"}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        Aucune entreprise associée
                      </p>
                    )}
                  </div>
                </div>

                {/* Section Offres d'emploi */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">
                    OFFRES D'EMPLOI
                  </h4>
                  <div className="space-y-2">
                    {selectedDriver.jobOffers?.length > 0 ? (
                      selectedDriver.jobOffers.map((offer: any) => (
                        <div
                          key={offer.id}
                          className="p-3 bg-gray-50 rounded-md"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {offer.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {offer.enterprise?.name}
                              </p>
                            </div>
                            <Badge
                              variant={
                                offer.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {offer.status === "active"
                                ? "Active"
                                : "Terminée"}
                            </Badge>
                          </div>
                          <div className="mt-2 flex items-center text-xs text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {offer.location || "Lieu non spécifié"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        Aucune offre d'emploi
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pied de page du Drawer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                // Logique pour contacter le conducteur
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contacter
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              onClick={() => {
                // Logique pour modifier le conducteur
              }}
            >
              <User className="h-4 w-4 mr-2" />
              Modifier le profil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Overlay lorsque le drawer est ouvert */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

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
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <motion.div variants={item} className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 bg-gradient-to-r from-green-800 to-green-700 bg-clip-text text-transparent">
              {t("drivers.title")}
            </h1>
            <p className="text-gray-600">
              Gerencie e acompanhe os motoristas cadastrados
            </p>
          </motion.div>

          <motion.div variants={item} className="flex items-center gap-3">
            <Button
              onClick={exportToCSV}
              variant="ghost"
              className="flex items-center gap-2 border border-green-600 text-green-600 hover:bg-green-50"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t("drivers.export")}</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Filtres améliorés */}
        <motion.div variants={item}>
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    placeholder="Pesquisar motoristas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10"
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
        </motion.div>

        {/* Tableau des conducteurs avec animations */}
        <motion.div variants={item} className="overflow-hidden">
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader className="bg-gray-50">
                  <TableRow className="hover:bg-gray-50">
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("drivers.name")}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      {t("drivers.email")}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      {t("drivers.phone")}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                      {t("drivers.city")}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      {t("drivers.vehicle")}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                      {t("drivers.experience")}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("drivers.status")}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("drivers.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {drivers?.map((driver, index) => (
                      <motion.tr
                        key={driver.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                              {driver.first_name.charAt(0)}
                              {driver.last_name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {driver.first_name} {driver.last_name}
                              </div>
                              <div className="text-sm text-gray-500 md:hidden">
                                {driver.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-900">
                            {driver.email}
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-sm text-gray-900">
                            {driver.phone}
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                          <div className="text-sm text-gray-900">
                            {driver.city}
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          {driver.has_vehicle ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {driver.vehicle_type || "Sim"}
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Não
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                          <div className="text-sm text-gray-900">
                            {driver.experience_years || 0}{" "}
                            {driver.experience_years === 1 ? "ano" : "anos"}
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              statusBadgeVariants[
                                driver.status as keyof typeof statusBadgeVariants
                              ] || "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {t(`drivers.${driver.status}`)}
                          </span>
                        </TableCell>

                        <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2"
                              title="Voir les détails"
                              onClick={() => handleViewDriver(driver)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {driver.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:bg-green-50 p-2"
                                  onClick={() =>
                                    handleStatusUpdate(driver.id, "approved")
                                  }
                                  disabled={updateStatusMutation.isPending}
                                  title="Aprovar"
                                >
                                  {updateStatusMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50 p-2"
                                  onClick={() =>
                                    handleStatusUpdate(driver.id, "rejected")
                                  }
                                  disabled={updateStatusMutation.isPending}
                                  title="Rejeitar"
                                >
                                  {updateStatusMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <X className="h-4 w-4" />
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}

                    {drivers?.length === 0 && (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white"
                      >
                        <TableCell
                          colSpan={9}
                          className="px-6 py-12 text-center"
                        >
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Search className="h-12 w-12 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900">
                              Nenhum motorista encontrado
                            </h3>
                            <p className="text-gray-500">
                              {searchQuery || statusFilter !== "all"
                                ? "Tente ajustar sua pesquisa ou filtros."
                                : "Parece que ainda não há motoristas cadastrados."}
                            </p>
                            {(searchQuery || statusFilter !== "all") && (
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setSearchQuery("");
                                  setStatusFilter("all");
                                }}
                                className="mt-2 border border-gray-300"
                              >
                                Limpar filtros
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {drivers && drivers.length > 0 && (
              <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Anterior
                  </button>
                  <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Próximo
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">1</span> a{" "}
                      <span className="font-medium">{drivers.length}</span> de{" "}
                      <span className="font-medium">{drivers.length}</span>{" "}
                      resultados
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Anterior</span>
                        <ChevronDown
                          className="h-5 w-5 transform rotate-90"
                          aria-hidden="true"
                        />
                      </button>
                      <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Próximo</span>
                        <ChevronDown
                          className="h-5 w-5 transform -rotate-90"
                          aria-hidden="true"
                        />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

      
      </motion.div>

      {/* Drivers Details Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isDrawerOpen}
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedDriver(null)}
        />

        {/* Drawer */}
        <motion.div
          id="driver-drawer"
          className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
          initial={{ x: "100%" }}
          animate={{ x: isDrawerOpen ? 0 : "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedDriver && (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-lg font-bold">
                    {selectedDriver.first_name?.charAt(0)}{selectedDriver.last_name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedDriver.first_name} {selectedDriver.last_name}
                    </h2>
                    <Badge 
                      className={`mt-1 ${
                        selectedDriver.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : selectedDriver.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {t(`drivers.${selectedDriver.status}`)}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Driver Info */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">INFORMATIONS DE CONTACT</h3>
                  <div className="space-y-2 pl-1">
                    <div className="flex items-center text-sm text-gray-700">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={`mailto:${selectedDriver.email}`} className="text-blue-600 hover:underline">
                        {selectedDriver.email}
                      </a>
                    </div>
                    {selectedDriver.phone && (
                      <div className="flex items-center text-sm text-gray-700">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <a href={`tel:${selectedDriver.phone}`} className="text-blue-600 hover:underline">
                          {selectedDriver.phone}
                        </a>
                      </div>
                    )}
                    {selectedDriver.city && (
                      <div className="flex items-center text-sm text-gray-700">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedDriver.city}
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">INFORMATIONS PROFESSIONNELLES</h3>
                  <div className="space-y-2 pl-1">
                    <div className="flex items-center text-sm text-gray-700">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedDriver.experience_years || 0} {selectedDriver.experience_years === 1 ? 'an' : 'ans'} d'expérience
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedDriver.has_vehicle ? 'Avec véhicule' : 'Sans véhicule'}
                      {selectedDriver.vehicle_type && ` (${selectedDriver.vehicle_type})`}
                    </div>
                  </div>
                </div>

                {/* Registration Date */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">DATE D'INSCRIPTION</h3>
                  <div className="text-sm text-gray-700 pl-1">
                    {format(new Date(selectedDriver.created_at), "dd/MM/yyyy HH:mm")}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex space-x-3">
                {selectedDriver.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleStatusUpdate(selectedDriver.id, 'approved')}
                      className="flex-1 bg-green-50 text-green-700 hover:bg-green-100"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleStatusUpdate(selectedDriver.id, 'rejected')}
                      className="flex-1 bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                  </>
                )}
                {selectedDriver.status !== 'pending' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Add logic to contact the driver
                    }}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contacter
                  </Button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
