import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  Filter,
  Loader2,
  Plus,
  Trash2,
  Users,
  X,
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
import { jobOffersApi, jobApplicationsApi } from "../services/api";
import { format } from "date-fns";
import { motion } from "framer-motion";
import "./JobOffers.css";
import { storage } from "../lib/supabase";
import { Dialog } from "../components/ui/Dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/Tabs";

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function JobOffers() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [cvUrl, setCvUrl] = useState<string>("");
  const [idCardUrl, setIdCardUrl] = useState<string>("");

  const fetchApplicationFiles = async (application: any) => {
    try {
      // Reset URLs
      setCvUrl("");
      setIdCardUrl("");

      // Generate file paths based on application ID
      const cvPath = `applications/${application.id}/cv.pdf`;
      const idCardPath = `applications/${application.id}/id_card.pdf`;

      // Get public URLs for the files
      const { data: cvData } = storage
        .from("jobs-application")
        .getPublicUrl(cvPath);
      const { data: idCardData } = storage
        .from("jobs-application")
        .getPublicUrl(idCardPath);

      // Set the URLs in state
      setCvUrl(cvData.publicUrl);
      setIdCardUrl(idCardData.publicUrl);
    } catch (error) {
      console.error("Error fetching application files:", error);
      // You might want to show a toast notification here
    }
  };
  const [newOffer, setNewOffer] = useState({
    title: "",
    description: "",
    location: "",
    salary_range: "",
    employment_type: "Temps plein",
    requirements: [] as string[],
    benefits: [] as string[],
    is_active: true,
  });
  const [tempRequirement, setTempRequirement] = useState("");
  const [tempBenefit, setTempBenefit] = useState("");

  const { data: jobOffers, isLoading } = useQuery({
    queryKey: ["job-offers", { isActive: activeFilter, search: searchQuery }],
    queryFn: () =>
      jobOffersApi.getAll({
        isActive:
          activeFilter === "all" ? undefined : activeFilter === "active",
        search: searchQuery || undefined,
      }),
  });

  // Close drawer when selectedOffer changes to null
  useEffect(() => {
    if (!selectedOffer) {
      setIsCreateDrawerOpen(false);
    }
  }, [selectedOffer]);

  const { data: applications } = useQuery({
    queryKey: ["job-applications", selectedOffer],
    queryFn: () =>
      selectedOffer
        ? jobApplicationsApi.getByJobOffer(selectedOffer)
        : Promise.resolve([]),
    enabled: !!selectedOffer,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      jobOffersApi.update(id, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-offers"] });
      queryClient.invalidateQueries({ queryKey: ["job-offers-active"] });
    },
  });

  const deleteOfferMutation = useMutation({
    mutationFn: (id: string) => jobOffersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-offers"] });
      setSelectedOffer(null);
      queryClient.invalidateQueries({ queryKey: ["job-offers-active"] });
    },
  });

  const activeOptions = [
    { value: "all", label: "Todas" },
    { value: "active", label: t("jobOffers.active") },
    { value: "inactive", label: t("jobOffers.inactive") },
  ];

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar esta oferta?")) {
      deleteOfferMutation.mutate(id);
    }
  };

  const viewApplications = (offerId: string) => {
    setSelectedOffer(offerId);
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

  if (selectedOffer) {
    const offer = jobOffers?.find((o) => o.id === selectedOffer);
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Button
              variant="ghost"
              onClick={() => setSelectedOffer(null)}
              className="mb-4"
            >
              ← Voltar às ofertas
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Candidaturas para: {offer?.title}
            </h1>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Experiência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications?.map((application) => (
                  <TableRow
                    key={application.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setSelectedApplication(application);
                      fetchApplicationFiles(application);
                      setIsViewDrawerOpen(true);
                    }}
                  >
                    <TableCell className="font-medium">
                      {application.first_name} {application.last_name}
                    </TableCell>
                    <TableCell>{application.email}</TableCell>
                    <TableCell>{application.phone}</TableCell>
                    <TableCell>{application.experience_years} anos</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          application.status === "accepted"
                            ? "success"
                            : application.status === "rejected"
                            ? "danger"
                            : application.status === "reviewed"
                            ? "warning"
                            : "default"
                        }
                      >
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(application.created_at), "dd/MM/yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {applications?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma candidatura ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Applications Section */}
      {selectedOffer && (
        <motion.div variants={item} className="space-y-4">
          {/* Application Details Drawer */}
          <Dialog open={isViewDrawerOpen} onOpenChange={setIsViewDrawerOpen}>
            <div className="fixed right-0 top-0 h-full w-full max-w-md overflow-auto bg-white shadow-lg z-50">
              {selectedApplication && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedApplication.first_name}{" "}
                        {selectedApplication.last_name}
                      </h2>
                      <p className="text-gray-600">
                        {selectedApplication.email}
                      </p>
                    </div>
                    <Badge
                      variant={
                        selectedApplication.status === "accepted"
                          ? "success"
                          : selectedApplication.status === "rejected"
                          ? "danger"
                          : selectedApplication.status === "reviewed"
                          ? "warning"
                          : "default"
                      }
                    >
                      {selectedApplication.status}
                    </Badge>
                  </div>

                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">Dados</TabsTrigger>
                      <TabsTrigger value="documents">Documentos</TabsTrigger>
                      <TabsTrigger value="experience">Experiência</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="mt-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-gray-500">
                            Telefone
                          </h3>
                          <p>{selectedApplication.phone || "Não informado"}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-500">
                            Anos de Experiência
                          </h3>
                          <p>
                            {selectedApplication.experience_years || "0"} anos
                          </p>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-500">
                            Data de Candidatura
                          </h3>
                          <p>
                            {format(
                              new Date(selectedApplication.created_at),
                              "dd/MM/yyyy"
                            )}
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="documents" className="mt-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2">Currículo (CV)</h3>
                          {cvUrl ? (
                            <iframe
                              src={cvUrl}
                              className="w-full h-[500px] border rounded"
                              title="Currículo"
                            />
                          ) : (
                            <div className="text-center text-gray-500 py-8">
                              Currículo não encontrado
                            </div>
                          )}
                        </div>
                        <div className="mt-6">
                          <h3 className="font-medium mb-2">
                            Documento de Identificação
                          </h3>
                          {idCardUrl ? (
                            <iframe
                              src={idCardUrl}
                              className="w-full h-[500px] border rounded"
                              title="Documento de Identificação"
                            />
                          ) : (
                            <div className="text-center text-gray-500 py-8">
                              Documento não encontrado
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="experience" className="mt-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">
                          Experiência Profissional
                        </h3>
                        {selectedApplication.experience ? (
                          <div className="whitespace-pre-line bg-gray-50 p-4 rounded">
                            {selectedApplication.experience}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            Nenhuma experiência fornecida.
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </Dialog>

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Candidaturas para:{" "}
              {jobOffers?.find((offer) => offer.id === selectedOffer)?.title}
            </h2>
            <Button variant="ghost" onClick={() => setSelectedOffer(null)}>
              <X className="h-4 w-4 mr-2" />
              Voltar para a lista
            </Button>
          </div>
        </motion.div>
      )}

      {/* Job Offers Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-green-800 to-green-700 rounded-2xl p-6 text-white shadow-lg">
        <motion.div variants={item} className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-bold">
            {t("jobOffers.title")}
          </h1>
          <p className="text-gray-200">
            Gerencie e publique vagas de emprego na plataforma.
          </p>
        </motion.div>

        <motion.div variants={item} className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="flex items-center gap-2 border border-gray-200 text-gray-200 hover:bg-gray-400"
            onClick={() => setIsCreateDrawerOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("jobOffers.addNew")}
          </Button>
        </motion.div>
      </div>

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
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
              >
                {activeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            {searchQuery || activeFilter !== "all" ? (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="text-gray-500 hover:bg-gray-100"
              >
                Limpar filtros
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Job Offers Table */}
      <motion.div variants={item} className="overflow-hidden">
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="bg-gray-50">
                <TableRow className="hover:bg-gray-50">
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Localização
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Tipo
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Salário
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Candidaturas
                  </TableHead>
                  <TableHead>{t("common.createdAt")}</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobOffers?.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {offer.title}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {offer.location}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {offer.employment_type}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {offer.salary_range || "A combinar"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={offer.is_active ? "success" : "default"}>
                        {offer.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => viewApplications(offer.id)}
                        className="flex items-center"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        {offer.applications_count}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {format(new Date(offer.created_at), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleToggleActive(offer.id, offer.is_active)
                          }
                          loading={toggleActiveMutation.isPending}
                        >
                          {offer.is_active ? "Desativar" : "Ativar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(offer.id)}
                          loading={deleteOfferMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {jobOffers?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t("common.noData")}
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Job Offer Details Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isCreateDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isCreateDrawerOpen}
      >
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
        <motion.div
          id="job-offer-drawer"
          className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
          initial={{ x: "100%" }}
          animate={{ x: selectedOffer ? 0 : "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
        >
          {selectedOffer &&
            jobOffers?.find((offer) => offer.id === selectedOffer) && (
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {
                      jobOffers.find((offer) => offer.id === selectedOffer)
                        ?.title
                    }
                  </h2>
                  <button
                    onClick={() => setSelectedOffer(null)}
                    className="text-gray-400 hover:text-gray-500"
                    aria-label="Fechar"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Job Offer Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Localização
                    </h3>
                    <p className="text-gray-900">
                      {
                        jobOffers.find((offer) => offer.id === selectedOffer)
                          ?.location
                      }
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Tipo de Emprego
                    </h3>
                    <p className="text-gray-900">
                      {
                        jobOffers.find((offer) => offer.id === selectedOffer)
                          ?.employment_type
                      }
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Salário
                    </h3>
                    <p className="text-gray-900">
                      {jobOffers.find((offer) => offer.id === selectedOffer)
                        ?.salary_range || "A combinar"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Status
                    </h3>
                    <Badge
                      variant={
                        jobOffers.find((offer) => offer.id === selectedOffer)
                          ?.is_active
                          ? "success"
                          : "default"
                      }
                    >
                      {jobOffers.find((offer) => offer.id === selectedOffer)
                        ?.is_active
                        ? "Ativa"
                        : "Inativa"}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Data de Criação
                    </h3>
                    <p className="text-gray-900">
                      {format(
                        new Date(
                          jobOffers.find((offer) => offer.id === selectedOffer)
                            ?.created_at || new Date()
                        ),
                        "dd/MM/yyyy HH:mm"
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Requisitos
                    </h3>
                    <div className="mt-2 space-y-2">
                      {jobOffers
                        .find((offer) => offer.id === selectedOffer)
                        ?.requirements?.map((req, index) => (
                          <div key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span className="text-gray-700">{req}</span>
                          </div>
                        )) || (
                        <p className="text-gray-500 italic">
                          Nenhum requisito específico
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Benefícios
                    </h3>
                    <div className="mt-2 space-y-2">
                      {jobOffers
                        .find((offer) => offer.id === selectedOffer)
                        ?.benefits?.map((benefit, index) => (
                          <div key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        )) || (
                        <p className="text-gray-500 italic">
                          Nenhum benefício informado
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Descrição
                    </h3>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <p className="text-gray-700 whitespace-pre-line">
                        {jobOffers.find((offer) => offer.id === selectedOffer)
                          ?.description || "Nenhuma descrição fornecida"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex space-x-3">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const offer = jobOffers.find(
                        (offer) => offer.id === selectedOffer
                      );
                      if (offer) {
                        handleToggleActive(offer.id, !offer.is_active);
                      }
                    }}
                    className="flex-1"
                    loading={toggleActiveMutation.isPending}
                  >
                    {jobOffers.find((offer) => offer.id === selectedOffer)
                      ?.is_active
                      ? "Desativar"
                      : "Ativar"}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (
                        confirm("Tem certeza que deseja excluir esta vaga?")
                      ) {
                        handleDelete(selectedOffer);
                      }
                    }}
                    className="flex-1"
                    loading={deleteOfferMutation.isPending}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            )}
        </motion.div>
      </div>

      {/* Create Job Offer Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isCreateDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isCreateDrawerOpen}
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsCreateDrawerOpen(false)}
        />
        <motion.div
          id="job-offer-create-drawer"
          className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
          initial={{ x: "100%" }}
          animate={{ x: isCreateDrawerOpen ? 0 : "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Créer une nouvelle offre
                </h2>
                <button
                  onClick={() => setIsCreateDrawerOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                  aria-label="Fermer"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  value={newOffer.title}
                  onChange={(e) =>
                    setNewOffer({ ...newOffer, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={newOffer.description}
                  onChange={(e) =>
                    setNewOffer({ ...newOffer, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localisation *
                  </label>
                  <input
                    type="text"
                    value={newOffer.location}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'emploi *
                  </label>
                  <select
                    value={newOffer.employment_type}
                    onChange={(e) =>
                      setNewOffer({
                        ...newOffer,
                        employment_type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Temps plein">Temps plein</option>
                    <option value="Temps partiel">Temps partiel</option>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salaire
                </label>
                <input
                  type="text"
                  value={newOffer.salary_range}
                  onChange={(e) =>
                    setNewOffer({ ...newOffer, salary_range: e.target.value })
                  }
                  placeholder="Ex: 30 000€ - 40 000€ / an"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exigences
                  {newOffer.requirements.length > 0 && (
                    <span className="ml-1 text-xs text-gray-500">
                      ({newOffer.requirements.length} ajoutées)
                    </span>
                  )}
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tempRequirement}
                    onChange={(e) => setTempRequirement(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (tempRequirement.trim()) {
                          setNewOffer({
                            ...newOffer,
                            requirements: [
                              ...newOffer.requirements,
                              tempRequirement.trim(),
                            ],
                          });
                          setTempRequirement("");
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ajouter une exigence"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tempRequirement.trim()) {
                        setNewOffer({
                          ...newOffer,
                          requirements: [
                            ...newOffer.requirements,
                            tempRequirement.trim(),
                          ],
                        });
                        setTempRequirement("");
                      }
                    }}
                    className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {newOffer.requirements.map((req, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span>{req}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newReqs = [...newOffer.requirements];
                          newReqs.splice(index, 1);
                          setNewOffer({ ...newOffer, requirements: newReqs });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avantages
                  {newOffer.benefits.length > 0 && (
                    <span className="ml-1 text-xs text-gray-500">
                      ({newOffer.benefits.length} ajoutés)
                    </span>
                  )}
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tempBenefit}
                    onChange={(e) => setTempBenefit(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (tempBenefit.trim()) {
                          setNewOffer({
                            ...newOffer,
                            benefits: [
                              ...newOffer.benefits,
                              tempBenefit.trim(),
                            ],
                          });
                          setTempBenefit("");
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ajouter un avantage"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tempBenefit.trim()) {
                        setNewOffer({
                          ...newOffer,
                          benefits: [...newOffer.benefits, tempBenefit.trim()],
                        });
                        setTempBenefit("");
                      }
                    }}
                    className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {newOffer.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span>{benefit}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newBenefits = [...newOffer.benefits];
                          newBenefits.splice(index, 1);
                          setNewOffer({ ...newOffer, benefits: newBenefits });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={newOffer.is_active}
                  onChange={(e) =>
                    setNewOffer({ ...newOffer, is_active: e.target.checked })
                  }
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_active"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Offre active
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateDrawerOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      // Valider les champs requis
                      if (!newOffer.title) {
                        alert("Veuillez saisir un titre pour l'offre");
                        return;
                      }
                      if (!newOffer.description) {
                        alert("Veuillez saisir une description pour l'offre");
                        return;
                      }
                      if (!newOffer.location) {
                        alert("Veuillez préciser la localisation du poste");
                        return;
                      }

                      // Afficher un indicateur de chargement
                      const submitButton = document.querySelector(
                        "#submit-offer-button"
                      );
                      if (submitButton) {
                        submitButton.innerHTML =
                          '<div class="spinner-border spinner-border-sm mr-2" role="status"></div> Création en cours...';
                        submitButton.setAttribute("disabled", "disabled");
                      }

                      // Appeler l'API pour créer l'offer
                      await jobOffersApi.create(newOffer);

                      // Rafraîchir la liste des offres
                      await queryClient.invalidateQueries({
                        queryKey: ["job-offers"],
                      });

                      // Afficher un message de succès
                      const successMessage = document.createElement("div");
                      successMessage.className =
                        "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50";
                      successMessage.textContent = "Offre créée avec succès";
                      document.body.appendChild(successMessage);

                      // Fermer le drawer et réinitialiser le formulaire
                      setIsCreateDrawerOpen(false);
                      setNewOffer({
                        title: "",
                        description: "",
                        location: "",
                        salary_range: "",
                        employment_type: "Temps plein",
                        requirements: [],
                        benefits: [],
                        is_active: true,
                      });

                      // Supprimer le message de succès après 3 secondes
                      setTimeout(() => {
                        successMessage.remove();
                      }, 3000);
                    } catch (error) {
                      console.error(
                        "Erreur lors de la création de l'offre:",
                        error
                      );

                      // Afficher un message d'erreur détaillé
                      const errorMessage = document.createElement("div");
                      errorMessage.className =
                        "fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50";
                      errorMessage.textContent =
                        "Erreur lors de la création de l'offre";
                      document.body.appendChild(errorMessage);

                      // Supprimer le message d'erreur après 5 secondes
                      setTimeout(() => {
                        errorMessage.remove();
                      }, 5000);
                    } finally {
                      // Réactiver le bouton de soumission
                      const submitButton = document.querySelector(
                        "#submit-offer-button"
                      );
                      if (submitButton) {
                        submitButton.textContent = "Créer l'offre";
                        submitButton.setAttribute("disabled", "false");
                      }
                    }
                  }}
                  id="submit-offer-button"
                  className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={
                    !newOffer.title ||
                    !newOffer.description ||
                    !newOffer.location
                  }
                >
                  Créer l'offre
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
