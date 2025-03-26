"use client";

import { withAuth } from "@/app/hooks/withAuth";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "@/app/components/header";
import { Button } from "@/app/components/ui/button";
import { CandidatosService, ApiUtils } from '@/app/api/apiService';
import { API_CONFIG } from '@/app/config';

// Interfaces
interface Diagnostico {
  _id: string;
  cod_diag: number;
  PIE: boolean;
  Contrato: boolean;
  "Nível a obter": string;
  Modalidade: string;
  sigo: number;
}

interface Inscricao {
  _id: string;
  cod_inscricao: number;
  Nome: string;
  Telefone: string;
  Email: string;
  NIF: string;
  Habilitações: string;
  "Nº DOC ID": string;
  NISS: string;
  "Data nascimento": string;
  "Situação face ao emprego": string;
  "Data desemprego": string;
  Qualificações: string;
  "Data Inscrição": string;
  "Cod postal": string;
  Genero: string;
  Localidade: string;
  Morada: string;
  "Tipo DOC ID": string;
  sigo: number;
}

interface Candidato {
  _id: string;
  sigo: number;
  Portfolio: boolean;
  Grelhas_Professores: boolean;
  CC: boolean;
  CH: boolean;
  OBS: string;
}

// Form interfaces
interface FormInscricao {
  sigo: number;
  cod_inscricao: number;
  Nome: string;
  Telefone: string;
  Email: string;
  NIF: string;
  Habilitações: string;
  "Nº DOC ID": string;
  NISS: string;
  "Data nascimento": string;
  "Situação face ao emprego": string;
  "Data desemprego": string;
  Qualificações: string;
  "Data Inscrição": string;
  "Cod postal": string;
  Genero: string;
  Localidade: string;
  Morada: string;
  "Tipo DOC ID": string;
}

interface FormDiagnostico {
  sigo: number;
  cod_diag: number;
  PIE: boolean;
  Contrato: boolean;
  "Nível a obter": string;
  Modalidade: string;
}

interface FormCandidato {
  sigo: number;
  Portfolio: boolean;
  Grelhas_Professores: boolean;
  CC: boolean;
  CH: boolean;
  OBS: string;
}

type FormValues = FormInscricao | FormDiagnostico | FormCandidato;

const CandidatosPage: React.FC = () => {
  // Data states
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    type: string;
    id: string;
    data: any;
  } | null>(null);
  const [modalType, setModalType] = useState<"inscricao" | "candidato" | "diagnostico">("inscricao");

  // Sequence numbers
  const [nextCodInscricao, setNextCodInscricao] = useState(0);
  const [nextCodDiag, setNextCodDiag] = useState(0);

  // Form state
  const [formValues, setFormValues] = useState<FormValues>({
    sigo: 0,
    cod_inscricao: 0,
    Nome: "",
    Telefone: "",
    Email: "",
    NIF: ""
  } as FormValues);

  // Initial form values
  const getInitialInscricaoValues = (sigo?: number): FormInscricao => ({
    sigo: sigo || 0,
    cod_inscricao: nextCodInscricao,
    Nome: "",
    Telefone: "",
    Email: "",
    NIF: "",
    Habilitações: "",
    "Nº DOC ID": "",
    NISS: "",
    "Data nascimento": "",
    "Situação face ao emprego": "",
    "Data desemprego": "",
    Qualificações: "",
    "Data Inscrição": "",
    "Cod postal": "",
    Genero: "",
    Localidade: "",
    Morada: "",
    "Tipo DOC ID": ""
  });

  const getInitialDiagnosticoValues = (sigo?: number): FormDiagnostico => ({
    sigo: sigo || 0,
    cod_diag: nextCodDiag,
    PIE: false,
    Contrato: false,
    "Nível a obter": "",
    Modalidade: ""
  });

  const getInitialCandidatoValues = (sigo?: number): FormCandidato => ({
    sigo: sigo || 0,
    Portfolio: false,
    Grelhas_Professores: false,
    CC: false,
    CH: false,
    OBS: ""
  });

  // Fetch all data
  
// Exemplo de uso:
const fetchAllData = async () => {
    try {
      setLoading(true);
      const [diagnosticos, inscricoes, candidatos] = await Promise.all([
        CandidatosService.getDiagnosticos(),
        CandidatosService.getInscricoes(),
        CandidatosService.getCandidatos()
      ]);
      
      setDiagnosticos(diagnosticos);
      setInscricoes(inscricoes);
      setCandidatos(candidatos);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Open add modal
  const openAddModal = (type: "inscricao" | "candidato" | "diagnostico", sigo?: number) => {
    setModalType(type);
    setEditingItem(null);

    switch (type) {
      case "inscricao":
        setFormValues(getInitialInscricaoValues(sigo));
        break;
      case "candidato":
        setFormValues(getInitialCandidatoValues(sigo));
        break;
      case "diagnostico":
        setFormValues(getInitialDiagnosticoValues(sigo));
        break;
    }

    setIsAddModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (type: string, id: string, data: any) => {
    setEditingItem({ type, id, data });
    setModalType(
      type === "inscricoes" ? "inscricao" :
      type === "candidatos" ? "candidato" : "diagnostico"
    );

    // Create a clean form values object with only the relevant fields
    const relevantFields: any = { sigo: data.sigo || 0 };
    
    if (type === "inscricoes") {
      const inscricaoFields: FormInscricao = {
        sigo: data.sigo,
        cod_inscricao: data.cod_inscricao,
        Nome: data.Nome,
        Telefone: data.Telefone,
        Email: data.Email,
        NIF: data.NIF,
        Habilitações: data.Habilitações,
        "Nº DOC ID": data["Nº DOC ID"],
        NISS: data.NISS,
        "Data nascimento": data["Data nascimento"],
        "Situação face ao emprego": data["Situação face ao emprego"],
        "Data desemprego": data["Data desemprego"],
        Qualificações: data.Qualificações,
        "Data Inscrição": data["Data Inscrição"],
        "Cod postal": data["Cod postal"],
        Genero: data.Genero,
        Localidade: data.Localidade,
        Morada: data.Morada,
        "Tipo DOC ID": data["Tipo DOC ID"]
      };
      setFormValues(inscricaoFields);
    } 
    else if (type === "diagnosticos") {
      const diagnosticoFields: FormDiagnostico = {
        sigo: data.sigo,
        cod_diag: data.cod_diag,
        PIE: data.PIE,
        Contrato: data.Contrato,
        "Nível a obter": data["Nível a obter"],
        Modalidade: data.Modalidade
      };
      setFormValues(diagnosticoFields);
    }
    else if (type === "candidatos") {
      const candidatoFields: FormCandidato = {
        sigo: data.sigo,
        Portfolio: data.Portfolio,
        Grelhas_Professores: data.Grelhas_Professores,
        CC: data.CC,
        CH: data.CH,
        OBS: data.OBS
      };
      setFormValues(candidatoFields);
    }

    setIsEditModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const type = editingItem?.type || 
      (modalType === "inscricao" ? "inscricoes" : 
       modalType === "candidato" ? "candidatos" : "diagnosticos");
    
    try {
      if (editingItem) {
        await axios.put(`${API_CONFIG.baseURL}/api/${type}/${editingItem.id}`, formValues);
      } else {
        await axios.post(`${API_CONFIG.baseURL}/api/${type}`, formValues);
      }
      fetchAllData();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(`Error ${editingItem ? 'updating' : 'adding'} ${type}:`, error);
    }
  };

  // Handle delete modificado
  const handleDelete = async (type: string, id: string) => {
    if (!window.confirm("Tem certeza que deseja remover?")) return;
    try {
      await axios.delete(`${API_CONFIG.baseURL}/api/${type}/${id}`);
      fetchAllData();
    } catch (error) {
      console.error(`Error removing ${type}:`, error);
    }
  };

  // Filter data for search
  const filteredData = () => {
    const lowerSearch = search.toLowerCase();
    return inscricoes.filter(inscricao => 
      Object.values(inscricao).some(
        value => value && value.toString().toLowerCase().includes(lowerSearch)
      ));
  };

  // Get candidates without registration
  const allCandidatos = [...candidatos.filter(c => !inscricoes.some(i => i.sigo === c.sigo))];

  // Get diagnostics by SIGO
  const getDiagnosticosBySigo = (sigo: number) => {
    return diagnosticos.filter(d => d.sigo === sigo);
  };

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-lg font-semibold text-gray-700">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-orange-500">Gestão PsiPorto</h1>
        
        {/* Search and buttons */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <input
            type="text"
            className="border p-2 rounded-lg w-full md:w-1/2"
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="bg-grey-300 border-orange-300 text-orange-300 hover:bg-yellow-200 px-5 py-2 h-auto"
              onClick={() => openAddModal("inscricao")}
            >
              Adicionar Inscrição
            </Button>
            <Button
              variant="outline"
              className="bg-grey-300 border-green-500 text-green-500 hover:bg-green-100 px-5 py-2 h-auto"
              onClick={() => openAddModal("candidato")}
            >
              Adicionar Candidato
            </Button>
          </div>
        </div>

        {/* Registrations table */}
        <div className="overflow-x-auto mb-8">
          <h2 className="text-xl font-semibold mb-2">Inscrições</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Nome</th>
                <th className="border border-gray-300 p-2">Contacto</th>
                <th className="border border-gray-300 p-2">Situação</th>
                <th className="border border-gray-300 p-2">Diagnósticos</th>
                <th className="border border-gray-300 p-2">Candidato</th>
                <th className="border border-gray-300 p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredData().map((inscricao) => {
                const diagnosticosInscricao = getDiagnosticosBySigo(inscricao.sigo);
                const candidato = candidatos.find(c => c.sigo === inscricao.sigo);
                
                return (
                  <tr key={inscricao._id}>
                    <td className="border p-2">
                      <div className="font-medium">{inscricao.Nome}</div>
                      <div className="text-sm text-gray-500">NIF: {inscricao.NIF}</div>
                    </td>
                    <td className="border p-2">
                      <div>{inscricao.Telefone}</div>
                      <div className="text-sm text-gray-500">{inscricao.Email}</div>
                    </td>
                    <td className="border p-2">
                      <div>{inscricao["Situação face ao emprego"]}</div>
                      {inscricao["Data desemprego"] && (
                        <div className="text-sm text-gray-500">Desde: {inscricao["Data desemprego"]}</div>
                      )}
                    </td>
                    <td className="border p-2">
                      <div className="space-y-2">
                        {diagnosticosInscricao.map(diagnostico => (
                          <div key={diagnostico._id} className="p-2 border rounded">
                            <div className="font-medium">{diagnostico.Modalidade}</div>
                            <div className="text-sm text-gray-500">Nível: {diagnostico["Nível a obter"]}</div>
                            <div className="flex gap-1 mt-1">
                              <Button
                                onClick={() => openEditModal("diagnosticos", diagnostico._id, diagnostico)}
                                className="bg-orange-300 hover:bg-orange-500 text-white px-2 py-1 text-xs"
                              >
                                Editar
                              </Button>
                              <Button
                                onClick={() => handleDelete("diagnosticos", diagnostico._id)}
                                className="bg-red-300 hover:bg-red-500 text-white px-2 py-1 text-xs"
                              >
                                Remover
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          onClick={() => openAddModal("diagnostico", inscricao.sigo)}
                          className="bg-green-300 hover:bg-green-500 text-white px-2 py-1 text-xs mt-2"
                        >
                          Adicionar Diagnóstico
                        </Button>
                      </div>
                    </td>
                    <td className="border p-2">
                      {candidato ? (
                        <>
                          <div className="flex gap-2">
                            <span className={`inline-block w-3 h-3 rounded-full ${candidato.Portfolio ? 'bg-green-500' : 'bg-red-500'}`} title="Portfolio"></span>
                            <span className={`inline-block w-3 h-3 rounded-full ${candidato.CC ? 'bg-green-500' : 'bg-red-500'}`} title="CC"></span>
                            <span className={`inline-block w-3 h-3 rounded-full ${candidato.CH ? 'bg-green-500' : 'bg-red-500'}`} title="CH"></span>
                          </div>
                          {candidato.OBS && (
                            <div className="text-sm text-gray-500 mt-1">{candidato.OBS}</div>
                          )}
                          <div className="flex gap-1 mt-1">
                            <Button
                              onClick={() => openEditModal("candidatos", candidato._id, candidato)}
                              className="bg-orange-300 hover:bg-orange-500 text-white px-2 py-1 text-xs"
                            >
                              Editar
                            </Button>
                            <Button
                              onClick={() => handleDelete("candidatos", candidato._id)}
                              className="bg-red-300 hover:bg-red-500 text-white px-2 py-1 text-xs"
                            >
                              Remover
                            </Button>
                          </div>
                        </>
                      ) : (
                        <Button
                          onClick={() => openAddModal("candidato", inscricao.sigo)}
                          className="bg-green-300 hover:bg-green-500 text-white px-2 py-1 text-xs"
                        >
                          Criar Candidato
                        </Button>
                      )}
                    </td>
                    <td className="border p-2">
                      <div className="flex gap-2 justify-center">
                        <Button
                          onClick={() => openEditModal("inscricoes", inscricao._id, inscricao)}
                          className="bg-orange-300 hover:bg-orange-500 text-white px-3 py-1"
                        >
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDelete("inscricoes", inscricao._id)}
                          className="bg-red-300 hover:bg-red-500 text-white px-3 py-1"
                        >
                          Remover
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Candidates without registration table */}
        {allCandidatos.length > 0 && (
          <div className="overflow-x-auto">
            <h2 className="text-xl font-semibold mb-2">Candidatos Sem Inscrição</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-2">SIGO</th>
                  <th className="border border-gray-300 p-2">Diagnósticos</th>
                  <th className="border border-gray-300 p-2">Status</th>
                  <th className="border border-gray-300 p-2">Observações</th>
                  <th className="border border-gray-300 p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {allCandidatos.map((candidato) => {
                  const diagnosticosCandidato = getDiagnosticosBySigo(candidato.sigo);
                  
                  return (
                    <tr key={candidato._id}>
                      <td className="border p-2 text-center">{candidato.sigo}</td>
                      <td className="border p-2">
                        <div className="space-y-2">
                          {diagnosticosCandidato.map(diagnostico => (
                            <div key={diagnostico._id} className="p-2 border rounded">
                              <div className="font-medium">{diagnostico.Modalidade}</div>
                              <div className="text-sm text-gray-500">Nível: {diagnostico["Nível a obter"]}</div>
                              <div className="flex gap-1 mt-1">
                                <Button
                                  onClick={() => openEditModal("diagnosticos", diagnostico._id, diagnostico)}
                                  className="bg-orange-300 hover:bg-orange-500 text-white px-2 py-1 text-xs"
                                >
                                  Editar
                                </Button>
                                <Button
                                  onClick={() => handleDelete("diagnosticos", diagnostico._id)}
                                  className="bg-red-300 hover:bg-red-500 text-white px-2 py-1 text-xs"
                                >
                                  Remover
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            onClick={() => openAddModal("diagnostico", candidato.sigo)}
                            className="bg-green-300 hover:bg-green-500 text-white px-2 py-1 text-xs mt-2"
                          >
                            Adicionar Diagnóstico
                          </Button>
                        </div>
                      </td>
                      <td className="border p-2">
                        <div className="flex gap-2 justify-center">
                          <span className={`inline-block w-3 h-3 rounded-full ${candidato.Portfolio ? 'bg-green-500' : 'bg-red-500'}`} title="Portfolio"></span>
                          <span className={`inline-block w-3 h-3 rounded-full ${candidato.CC ? 'bg-green-500' : 'bg-red-500'}`} title="CC"></span>
                          <span className={`inline-block w-3 h-3 rounded-full ${candidato.CH ? 'bg-green-500' : 'bg-red-500'}`} title="CH"></span>
                        </div>
                      </td>
                      <td className="border p-2">
                        {candidato.OBS || "-"}
                      </td>
                      <td className="border p-2">
                        <div className="flex gap-2 justify-center">
                          <Button
                            onClick={() => openEditModal("candidatos", candidato._id, candidato)}
                            className="bg-orange-300 hover:bg-orange-500 text-white px-3 py-1"
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDelete("candidatos", candidato._id)}
                            className="bg-red-300 hover:bg-red-500 text-white px-3 py-1"
                          >
                            Remover
                          </Button>
                          <Button
                            onClick={() => openAddModal("inscricao", candidato.sigo)}
                            className="bg-blue-300 hover:bg-blue-500 text-white px-3 py-1"
                          >
                            Criar Inscrição
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 flex justify-center items-center p-4 bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-orange-500">
              {editingItem 
                ? `Editar ${editingItem.type}` 
                : modalType === "inscricao" 
                  ? "Adicionar Nova Inscrição" 
                  : modalType === "candidato" 
                    ? "Adicionar Novo Candidato" 
                    : "Adicionar Novo Diagnóstico"}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Common fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SIGO</label>
                  <input
                    type="number"
                    name="sigo"
                    value={formValues.sigo}
                    onChange={handleInputChange}
                    className="border border-orange-300 p-2 w-full rounded-lg"
                    required
                    readOnly={!!editingItem || modalType === "diagnostico"}
                  />
                </div>

                {/* Fields for inscricao */}
                {(modalType === "inscricao" || (editingItem && editingItem.type === "inscricoes")) && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código Inscrição</label>
                      <input
                        type="number"
                        name="cod_inscricao"
                        value={(formValues as FormInscricao).cod_inscricao}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg bg-gray-100"
                        required
                        readOnly={isAddModalOpen}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input
                        type="text"
                        name="Nome"
                        value={(formValues as FormInscricao).Nome}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <input
                        type="text"
                        name="Telefone"
                        value={(formValues as FormInscricao).Telefone}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="Email"
                        value={(formValues as FormInscricao).Email}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
                      <input
                        type="text"
                        name="NIF"
                        value={(formValues as FormInscricao).NIF}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NISS</label>
                      <input
                        type="text"
                        name="NISS"
                        value={(formValues as FormInscricao).NISS}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data Nascimento</label>
                      <input
                        type="date"
                        name="Data nascimento"
                        value={(formValues as FormInscricao)["Data nascimento"]}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Situação Emprego</label>
                      <select
                        name="Situação face ao emprego"
                        value={(formValues as FormInscricao)["Situação face ao emprego"]}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      >
                        <option value="">Selecione</option>
                        <option value="Empregado">Empregado</option>
                        <option value="Desempregado">Desempregado</option>
                        <option value="Estudante">Estudante</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    {(formValues as FormInscricao)["Situação face ao emprego"] === "Desempregado" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Desemprego</label>
                        <input
                          type="date"
                          name="Data desemprego"
                          value={(formValues as FormInscricao)["Data desemprego"]}
                          onChange={handleInputChange}
                          className="border border-orange-300 p-2 w-full rounded-lg"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Habilitações</label>
                      <input
                        type="text"
                        name="Habilitações"
                        value={(formValues as FormInscricao).Habilitações}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qualificações</label>
                      <input
                        type="text"
                        name="Qualificações"
                        value={(formValues as FormInscricao).Qualificações}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data Inscrição</label>
                      <input
                        type="date"
                        name="Data Inscrição"
                        value={(formValues as FormInscricao)["Data Inscrição"]}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                      <select
                        name="Genero"
                        value={(formValues as FormInscricao).Genero}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      >
                        <option value="">Selecione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                        <option value="O">Outro</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Morada</label>
                      <input
                        type="text"
                        name="Morada"
                        value={(formValues as FormInscricao).Morada}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                      <input
                        type="text"
                        name="Cod postal"
                        value={(formValues as FormInscricao)["Cod postal"]}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Localidade</label>
                      <input
                        type="text"
                        name="Localidade"
                        value={(formValues as FormInscricao).Localidade}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Documento ID</label>
                      <input
                        type="text"
                        name="Tipo DOC ID"
                        value={(formValues as FormInscricao)["Tipo DOC ID"]}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nº Documento ID</label>
                      <input
                        type="text"
                        name="Nº DOC ID"
                        value={(formValues as FormInscricao)["Nº DOC ID"]}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                  </>
                )}

                {/* Fields for diagnostico */}
                {(modalType === "diagnostico" || (editingItem && editingItem.type === "diagnosticos")) && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código Diagnóstico</label>
                      <input
                        type="number"
                        name="cod_diag"
                        value={(formValues as FormDiagnostico).cod_diag}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg bg-gray-100"
                        required
                        readOnly={isAddModalOpen}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade</label>
                      <select
                        name="Modalidade"
                        value={(formValues as FormDiagnostico).Modalidade}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="Processo RVCC">Processo RVCC</option>
                        <option value="Outra Modalidade">Outra Modalidade</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nível a Obter</label>
                      <select
                        name="Nível a obter"
                        value={(formValues as FormDiagnostico)["Nível a obter"]}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="Nível 1">Nível 1</option>
                        <option value="Nível 2">Nível 2</option>
                        <option value="Nível 3">Nível 3</option>
                        <option value="Nível 4">Nível 4</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="PIE"
                        checked={(formValues as FormDiagnostico).PIE}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">PIE</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="Contrato"
                        checked={(formValues as FormDiagnostico).Contrato}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">Contrato</label>
                    </div>
                  </>
                )}

                {/* Fields for candidato */}
                {(modalType === "candidato" || (editingItem && editingItem.type === "candidatos")) && (
                  <>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="Portfolio"
                        checked={(formValues as FormCandidato).Portfolio}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">Portfolio</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="Grelhas_Professores"
                        checked={(formValues as FormCandidato).Grelhas_Professores}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">Grelhas Professores</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="CC"
                        checked={(formValues as FormCandidato).CC}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">CC</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="CH"
                        checked={(formValues as FormCandidato).CH}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">CH</label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                      <textarea
                        name="OBS"
                        value={(formValues as FormCandidato).OBS}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  variant="outline"
                  className="bg-grey-300 border-orange-300 text-orange-300 hover:bg-yellow-200 px-5 py-2 h-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-300 hover:bg-orange-500 text-white px-5 py-2 h-auto"
                >
                  {editingItem ? 'Salvar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default withAuth(CandidatosPage, ["TORVC"]);