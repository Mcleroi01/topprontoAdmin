import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { jobApplicationsApi } from "../../services/api";
import { storage } from "../../lib/supabase";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Card, CardContent } from "../ui/Card";
import { Dialog } from "../ui/Dialog";
import { Input } from "../ui/Input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../ui/Table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";

interface Application {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  experience_years?: number;
  status: "accepted" | "rejected" | "reviewed" | string;
  created_at: string;
  experience?: string;
}

interface ApplicationsPanelProps {
  offerId: string;
  onBack: () => void;
}

export const ApplicationsPanel: React.FC<ApplicationsPanelProps> = ({ offerId, onBack }) => {
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [cvUrl, setCvUrl] = useState<string>("");
  const [idCardUrl, setIdCardUrl] = useState<string>("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: applications } = useQuery<Application[]>({
    queryKey: ["job-applications", offerId],
    queryFn: () => jobApplicationsApi.getByJobOffer(offerId),
    enabled: !!offerId,
  });

  const filteredApplications = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (applications || []).filter((a) => {
      const matchesText = !term
        || a.first_name.toLowerCase().includes(term)
        || a.last_name.toLowerCase().includes(term)
        || a.email.toLowerCase().includes(term)
        || (a.phone || "").toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const contact = useMemo(() => {
    if (!selectedApplication) return { emailSubject: "", emailBody: "", waPhone: "", waText: "" };
    const firstName = selectedApplication.first_name;
    const emailSubject = `Candidatura`;
    const emailBody = `Olá ${firstName},\n\nObrigado pela sua candidatura. Entraremos em contacto em breve.\n\nCumprimentos,\nEquipe Topronto`;
    const waPhone = (selectedApplication.phone || "").replace(/\D/g, "");
    const waText = `Olá ${firstName}, obrigado pela sua candidatura. Entraremos em contacto em breve.`;
    return {
      emailSubject: encodeURIComponent(emailSubject),
      emailBody: encodeURIComponent(emailBody),
      waPhone,
      waText: encodeURIComponent(waText),
    };
  }, [selectedApplication]);

  const updateStatusMutation = useMutation({
    mutationFn: (status: "pending" | "reviewed" | "accepted" | "rejected") => {
      if (!selectedApplication) return Promise.resolve(null);
      return jobApplicationsApi.updateStatus(selectedApplication.id, status);
    },
    onSuccess: (updated) => {
      if (updated) {
        setSelectedApplication((prev) => (prev ? { ...prev, status: updated.status } : prev));
      }
      queryClient.invalidateQueries({ queryKey: ["job-applications", offerId] });
    },
  });

  const handleUpdateStatus = (status: "pending" | "reviewed" | "accepted" | "rejected") => {
    if (!selectedApplication) return;
    updateStatusMutation.mutate(status);
  };

  const fetchApplicationFiles = async (application: Application) => {
    try {
      setCvUrl("");
      setIdCardUrl("");
      const cvPath = `applications/${application.id}/cv.pdf`;
      const idCardPath = `applications/${application.id}/id_card.pdf`;
      const { data: cvData } = storage.from("jobs-application").getPublicUrl(cvPath);
      const { data: idCardData } = storage.from("jobs-application").getPublicUrl(idCardPath);
      setCvUrl(cvData.publicUrl);
      setIdCardUrl(idCardData.publicUrl);
    } catch (error) {
      console.error("Error fetching application files:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-4">
            ← Voltar às ofertas
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Candidaturas</h1>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Toolbar */}
          <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par nom, email ou téléphone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tous</option>
                <option value="accepted">Accepté</option>
                <option value="reviewed">En revue</option>
                <option value="rejected">Rejeté</option>
              </select>
              {(search || statusFilter !== "all") && (
                <Button variant="ghost" onClick={() => { setSearch(""); setStatusFilter("all"); }} className="text-gray-600">
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="sticky top-0 bg-gray-50 z-10">
                <TableRow>
                  <TableHead className="px-4 py-3">Nome</TableHead>
                  <TableHead className="px-4 py-3">Email</TableHead>
                  <TableHead className="px-4 py-3">Telefone</TableHead>
                  <TableHead className="px-4 py-3">Experiência</TableHead>
                  <TableHead className="px-4 py-3">Status</TableHead>
                  <TableHead className="px-4 py-3">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application: Application) => (
                  <TableRow
                    key={application.id}
                    className="cursor-pointer hover:bg-green-50/60 odd:bg-white even:bg-gray-50"
                    onClick={() => {
                      setSelectedApplication(application);
                      fetchApplicationFiles(application);
                      setIsViewDrawerOpen(true);
                    }}
                  >
                    <TableCell className="px-4 py-3 font-medium whitespace-nowrap">
                      {application.first_name} {application.last_name}
                    </TableCell>
                    <TableCell className="px-4 py-3">{application.email}</TableCell>
                    <TableCell className="px-4 py-3">{application.phone}</TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      {application.experience_years ?? 0} anos
                    </TableCell>
                    <TableCell className="px-4 py-3">
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
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      {format(new Date(application.created_at), "dd/MM/yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredApplications.length === 0 && (
            <div className="text-center py-8 text-gray-500">Nenhuma candidatura ainda</div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Drawer */}
      {isViewDrawerOpen && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${isViewDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          aria-hidden={!isViewDrawerOpen}
        >
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsViewDrawerOpen(false)}
          />
          <Dialog open={isViewDrawerOpen} onOpenChange={setIsViewDrawerOpen}>
            <div className="fixed right-0 top-0 h-full w-full max-w-md overflow-auto bg-white shadow-lg z-50">
              {selectedApplication && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedApplication.first_name} {selectedApplication.last_name}
                      </h2>
                      <p className="text-gray-600">{selectedApplication.email}</p>
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

                  {/* Actions */}
                  <div className="flex flex-col gap-3 mb-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-gray-600">Alterar status:</span>
                      <Button size="sm" onClick={() => handleUpdateStatus("reviewed")} loading={updateStatusMutation.isPending}>Revisado</Button>
                      <Button size="sm" variant="success" onClick={() => handleUpdateStatus("accepted")} loading={updateStatusMutation.isPending}>Aceitar</Button>
                      <Button size="sm" variant="danger" onClick={() => handleUpdateStatus("rejected")} loading={updateStatusMutation.isPending}>Rejeitar</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus("pending")} loading={updateStatusMutation.isPending}>Pendente</Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-gray-600">Contactar:</span>
                      <a
                        className="px-3 py-1.5 rounded-md text-sm bg-gray-100 hover:bg-gray-200 text-gray-800"
                        href={`mailto:${selectedApplication.email}?subject=${contact.emailSubject}&body=${contact.emailBody}`}
                      >
                        Email
                      </a>
                      <a
                        className={`px-3 py-1.5 rounded-md text-sm ${contact.waPhone ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                        href={contact.waPhone ? `https://wa.me/${contact.waPhone}?text=${contact.waText}` : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-disabled={!contact.waPhone}
                      >
                        WhatsApp
                      </a>
                    </div>
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
                          <h3 className="font-medium text-gray-500">Telefone</h3>
                          <p>{selectedApplication.phone || "Não informado"}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-500">Anos de Experiência</h3>
                          <p>{selectedApplication.experience_years || "0"} anos</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-500">Data de Candidatura</h3>
                          <p>{format(new Date(selectedApplication.created_at), "dd/MM/yyyy")}</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="documents" className="mt-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2">Currículo (CV)</h3>
                          {cvUrl ? (
                            <iframe src={cvUrl} className="w-full h-[500px] border rounded" title="Currículo" />
                          ) : (
                            <div className="text-center text-gray-500 py-8">Currículo não encontrado</div>
                          )}
                        </div>
                        <div className="mt-6">
                          <h3 className="font-medium mb-2">Documento de Identificação</h3>
                          {idCardUrl ? (
                            <iframe src={idCardUrl} className="w-full h-[500px] border rounded" title="Documento de Identificação" />
                          ) : (
                            <div className="text-center text-gray-500 py-8">Documento não encontrado</div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="experience" className="mt-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">Experiência Profissional</h3>
                        {selectedApplication.experience ? (
                          <div className="whitespace-pre-line bg-gray-50 p-4 rounded">
                            {selectedApplication.experience}
                          </div>
                        ) : (
                          <p className="text-gray-500">Nenhuma experiência fornecida.</p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </Dialog>
        </div>

      )}
    </div>
  );
};

export default ApplicationsPanel;
