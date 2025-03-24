"use client";

import { withAuth } from "@/app/hooks/withAuth";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "@/app/components/header";
import { Button } from "@/app/components/ui/button";

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

const PsiPortoPage: React.FC = () => {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    type: string;
    id: string;
    data: any;
  } | null>(null);

  const [formValues, setFormValues] = useState({
    // Common fields
    sigo: 0,
    // Diagnostico fields
    cod_diag: 0,
    PIE: false,
    Contrato: false,
    "Nível a obter": "",
    Modalidade: "",
    // Inscricao fields
    cod_inscricao: 0,
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
    "Tipo DOC ID": "",
    // Candidato fields
    Portfolio: false,
    Grelhas_Professores: false,
    CC: false,
    CH: false,
    OBS: ""
  });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [diagRes, inscRes, candRes] = await Promise.all([
        axios.get("http://localhost:5000/api/diagnosticos"),
        axios.get("http://localhost:5000/api/inscricoes"),
        axios.get("http://localhost:5000/api/candidatos")
      ]);
      setDiagnosticos(diagRes.data);
      setInscricoes(inscRes.data);
      setCandidatos(candRes.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAdd = async (type: string, data: any) => {
    try {
      await axios.post(`http://localhost:5000/api/${type}`, data);
      fetchAllData();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error(`Erro ao adicionar ${type}:`, error);
    }
  };

  const handleEdit = async (type: string, id: string, data: any) => {
    try {
      await axios.put(`http://localhost:5000/api/${type}/${id}`, data);
      fetchAllData();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(`Erro ao editar ${type}:`, error);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!window.confirm("Tem certeza que deseja remover?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/${type}/${id}`);
      fetchAllData();
    } catch (error) {
      console.error(`Erro ao remover ${type}:`, error);
    }
  };

  const handleEditClick = (type: string, id: string, data: any) => {
    setEditingItem({ type, id, data });
    setFormValues({
      ...formValues,
      ...data
    });
    setIsEditModalOpen(true);
  };

  const filteredData = () => {
    const lowerSearch = search.toLowerCase();
    return inscricoes.filter(inscricao => 
      Object.values(inscricao).some(
        value => value && value.toString().toLowerCase().includes(lowerSearch)
    ));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto">
          <p className="text-lg font-semibold text-gray-700">Carregando...</p>
        </div>
      </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-orange-500">
          Candidatos Gestão PsiPorto
        </h1>
        
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
              onClick={() => {
                setEditingItem(null);
                setIsAddModalOpen(true);
              }}
            >
              Adicionar Inscrição
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Nome</th>
                <th className="border border-gray-300 p-2">Contacto</th>
                <th className="border border-gray-300 p-2">Situação</th>
                <th className="border border-gray-300 p-2">Diagnóstico</th>
                <th className="border border-gray-300 p-2">Candidato</th>
                <th className="border border-gray-300 p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredData().map((inscricao) => {
                const diagnostico = diagnosticos.find(d => d.sigo === inscricao.sigo);
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
                      {diagnostico ? (
                        <>
                          <div>{diagnostico.Modalidade}</div>
                          <div className="text-sm text-gray-500">Nível: {diagnostico["Nível a obter"]}</div>
                          <div className="flex gap-1 mt-1">
                            <Button
                              onClick={() => handleEditClick("diagnosticos", diagnostico._id, diagnostico)}
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
                        </>
                      ) : (
                        <Button
                          onClick={() => {
                            setFormValues({
                              ...formValues,
                              sigo: inscricao.sigo
                            });
                            setIsAddModalOpen(true);
                          }}
                          className="bg-green-300 hover:bg-green-500 text-white px-2 py-1 text-xs"
                        >
                          Criar Diagnóstico
                        </Button>
                      )}
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
                              onClick={() => handleEditClick("candidatos", candidato._id, candidato)}
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
                          onClick={() => {
                            setFormValues({
                              ...formValues,
                              sigo: inscricao.sigo
                            });
                            setIsAddModalOpen(true);
                          }}
                          className="bg-green-300 hover:bg-green-500 text-white px-2 py-1 text-xs"
                        >
                          Criar Candidato
                        </Button>
                      )}
                    </td>
                    <td className="border p-2">
                      <div className="flex gap-2 justify-center">
                        <Button
                          onClick={() => handleEditClick("inscricoes", inscricao._id, inscricao)}
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
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 flex justify-center items-center p-4 bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-orange-500">
              {editingItem ? `Editar ${editingItem.type}` : 'Adicionar Novo Registro'}
            </h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const type = editingItem?.type || 'inscricoes';
              const data = { ...formValues };
              
              if (editingItem) {
                handleEdit(type, editingItem.id, data);
              } else {
                handleAdd(type, data);
              }
            }}>
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
                  />
                </div>

                {/* Fields based on type */}
                {(!editingItem || editingItem.type === 'inscricoes') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código Inscrição</label>
                      <input
                        type="number"
                        name="cod_inscricao"
                        value={formValues.cod_inscricao}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input
                        type="text"
                        name="Nome"
                        value={formValues.Nome}
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
                        value={formValues.Telefone}
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
                        value={formValues.Email}
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
                        value={formValues.NIF}
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
                        value={formValues.NISS}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data Nascimento</label>
                      <input
                        type="date"
                        name="Data nascimento"
                        value={formValues["Data nascimento"]}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Situação Emprego</label>
                      <select
                        name="Situação face ao emprego"
                        value={formValues["Situação face ao emprego"]}
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
                    {formValues["Situação face ao emprego"] === "Desempregado" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Desemprego</label>
                        <input
                          type="date"
                          name="Data desemprego"
                          value={formValues["Data desemprego"]}
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
                        value={formValues.Habilitações}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qualificações</label>
                      <input
                        type="text"
                        name="Qualificações"
                        value={formValues.Qualificações}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data Inscrição</label>
                      <input
                        type="date"
                        name="Data Inscrição"
                        value={formValues["Data Inscrição"]}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                      <select
                        name="Genero"
                        value={formValues.Genero}
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
                        value={formValues.Morada}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                      <input
                        type="text"
                        name="Cod postal"
                        value={formValues["Cod postal"]}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Localidade</label>
                      <input
                        type="text"
                        name="Localidade"
                        value={formValues.Localidade}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Documento ID</label>
                      <input
                        type="text"
                        name="Tipo DOC ID"
                        value={formValues["Tipo DOC ID"]}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nº Documento ID</label>
                      <input
                        type="text"
                        name="Nº DOC ID"
                        value={formValues["Nº DOC ID"]}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                      />
                    </div>
                  </>
                )}

                {editingItem?.type === 'diagnosticos' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código Diagnóstico</label>
                      <input
                        type="number"
                        name="cod_diag"
                        value={formValues.cod_diag}
                        onChange={handleInputChange}
                        className="border border-orange-300 p-2 w-full rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade</label>
                      <select
                        name="Modalidade"
                        value={formValues.Modalidade}
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
                        value={formValues["Nível a obter"]}
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
                        checked={formValues.PIE}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">PIE</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="Contrato"
                        checked={formValues.Contrato}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">Contrato</label>
                    </div>
                  </>
                )}

                {editingItem?.type === 'candidatos' && (
                  <>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="Portfolio"
                        checked={formValues.Portfolio}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">Portfolio</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="Grelhas_Professores"
                        checked={formValues.Grelhas_Professores}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">Grelhas Professores</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="CC"
                        checked={formValues.CC}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">CC</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="CH"
                        checked={formValues.CH}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">CH</label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                      <textarea
                        name="OBS"
                        value={formValues.OBS}
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

export default withAuth(PsiPortoPage, ["TORVC"]);