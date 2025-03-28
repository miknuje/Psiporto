"use client";

import { withAuth } from "@/app/hooks/withAuth";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "@/app/components/header";
import { Button } from "@/app/components/ui/button";
import { AreasService, ApiUtils } from '@/app/api/apiService';
import { API_CONFIG } from '@/app/config';

interface Area {
  _id: string;
  cod_area: string;
  Nome: string;
  isDeleted?: boolean;
}

interface Nucleo {
  _id: string;
  cod_nucleo: string;
  Nome: string;
  cod_area: string;
  isDeleted?: boolean;
}

interface Unidade {
  _id: string;
  cod_unidade: string;
  Nome: string;
  cod_nucleo: string | null;
  cod_area: string;
  isDeleted?: boolean;
}

interface Nivel {
  _id: string;
  cod_nivel: string;
  cod_unidade: string;
  isDeleted?: boolean;
}

const AreasPage: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [nucleos, setNucleos] = useState<Nucleo[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [niveis, setNiveis] = useState<Nivel[]>([]);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddNivelModalOpen, setIsAddNivelModalOpen] = useState(false);
  const [isAddNucleoModalOpen, setIsAddNucleoModalOpen] = useState(false);
  const [isAddUnidadeModalOpen, setIsAddUnidadeModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    type: string;
    id: string;
    data: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [formValues, setFormValues] = useState({
    cod: "",
    Nome: "",
    cod_area: "",
    cod_nucleo: "",
  });

  // Atualize o estado do formulário quando o editingItem mudar
  React.useEffect(() => {
    if (editingItem) {
      setFormValues({
        cod: editingItem.type === "areas" ? editingItem.data.cod_area :
             editingItem.type === "nucleos" ? editingItem.data.cod_nucleo :
             editingItem.type === "unidades" ? editingItem.data.cod_unidade : "",
        Nome: editingItem.data.Nome,
        cod_area: editingItem.data.cod_area || "",
        cod_nucleo: editingItem.data.cod_nucleo || "",
      });
    }
  }, [editingItem]);

  // Atualize o estado do formulário quando as inputs mudarem
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [areas, nucleos, unidades, niveis] = await Promise.all([
        AreasService.getAreas(),
        AreasService.getNucleos(),
        AreasService.getUnidades(),
        AreasService.getNiveis()
      ]);
      
      setAreas(areas);
      setNucleos(nucleos);
      setUnidades(unidades);
      setNiveis(niveis);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Renderização condicional com base no estado de carregamento
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

  const unidadesComNiveis = unidades
    .map((unidade) => ({
      ...unidade,
      niveis: niveis.filter((nivel) => nivel.cod_unidade === unidade.cod_unidade),
    }))
    .sort((a, b) => a.cod_unidade.localeCompare(b.cod_unidade));

  const filteredAreas = areas.filter(
    (area) =>
      (area.Nome && area.Nome.toLowerCase().includes(search.toLowerCase())) ||
      (area.cod_area && area.cod_area.toLowerCase().includes(search.toLowerCase())) ||
      nucleos.some(
        (nucleo) =>
          nucleo.cod_area === area.cod_area &&
          ((nucleo.Nome && nucleo.Nome.toLowerCase().includes(search.toLowerCase())) ||
          (nucleo.cod_nucleo && nucleo.cod_nucleo.toLowerCase().includes(search.toLowerCase())))
      ) ||
      unidadesComNiveis.some(
        (unidade) =>
          (nucleos.some(
            (nucleo) =>
              nucleo.cod_area === area.cod_area &&
              nucleo.cod_nucleo === unidade.cod_nucleo
          ) ||
            (unidade.cod_nucleo === null &&
              unidade.cod_area === area.cod_area)) &&
          ((unidade.Nome && unidade.Nome.toLowerCase().includes(search.toLowerCase())) ||
            (unidade.cod_unidade && unidade.cod_unidade.toLowerCase().includes(search.toLowerCase())) ||
            unidade.niveis.some(
              (nivel) =>
                nivel.cod_nivel && nivel.cod_nivel.toLowerCase().includes(search.toLowerCase())
            )
          )
      )
  );

  const handleAdd = async (type: string, data: any) => {
    try {
      const response = await axios.post(`${API_CONFIG.baseURL}/api/${type}`, data);
      
      // Atualiza o estado correspondente
      if (type === "areas") {
        setAreas((prev) => [...prev, response.data]);
      } else if (type === "nucleos") {
        setNucleos((prev) => [...prev, response.data]);
      } else if (type === "unidades") {
        setUnidades((prev) => [...prev, response.data]);
      } else if (type === "niveis") {
        setNiveis((prev) => [...prev, response.data]);
      }

      // Fecha todos os modais de adição
      setIsAddModalOpen(false);
      setIsAddNivelModalOpen(false);
      setIsAddNucleoModalOpen(false);
      setIsAddUnidadeModalOpen(false);

      // Recarrega os dados para garantir sincronização
      await fetchAllData();
      
    } catch (error) {
      console.error(`Erro ao adicionar ${type}:`, error);
      // Adicione aqui qualquer tratamento de erro adicional (ex: toast notification)
    }
  };

  const handleEdit = async (type: string, id: string, updatedData: any) => {
    try {
      // Prepara os dados formatados para a requisição
      const formattedData: any = {
        Nome: updatedData.Nome,
        isDeleted: false,
      };

      // Adiciona campos específicos para cada tipo
      if (type === "areas") {
        formattedData.cod_area = updatedData.cod;
      } else if (type === "nucleos") {
        formattedData.cod_nucleo = updatedData.cod;
        formattedData.cod_area = updatedData.cod_area;
      } else if (type === "unidades") {
        formattedData.cod_unidade = updatedData.cod;
        formattedData.cod_nucleo = updatedData.cod_nucleo === "null" ? null : updatedData.cod_nucleo;
        formattedData.cod_area = updatedData.cod_area;
      } else if (type === "niveis") {
        formattedData.cod_nivel = updatedData.cod;
      }

      // Faz a requisição PUT
      const endpoint = `${API_CONFIG.baseURL}/api/${type}/${id}`;
      const response = await axios.put(endpoint, formattedData);

      // Atualiza o estado local
      if (type === "areas") {
        setAreas((prev) =>
          prev.map((area) =>
            area.cod_area === id ? { ...area, ...formattedData } : area
          )
        );
      } else if (type === "nucleos") {
        setNucleos((prev) =>
          prev.map((nucleo) =>
            nucleo.cod_nucleo === id ? { ...nucleo, ...formattedData } : nucleo
          )
        );
      } else if (type === "unidades") {
        setUnidades((prev) =>
          prev.map((unidade) =>
            unidade.cod_unidade === id ? { ...unidade, ...formattedData } : unidade
          )
        );
      } else if (type === "niveis") {
        setNiveis((prev) =>
          prev.map((nivel) =>
            nivel.cod_nivel === id ? { ...nivel, ...formattedData } : nivel
          )
        );
      }

      // Fecha o modal de edição e recarrega os dados
      setIsEditModalOpen(false);
      await fetchAllData();

    } catch (error) {
      console.error(`Erro ao editar ${type}:`, error);
      // Adicione tratamento de erro adicional se necessário
    }
  };

  const handleDelete = async (type: string, id: string) => {
    // Confirmação antes de deletar
    const confirmDelete = window.confirm("Tem certeza que deseja remover?");
    if (!confirmDelete) return;

    try {
      // Requisição DELETE
      await axios.delete(`${API_CONFIG.baseURL}/api/${type}/${id}`);

      // Atualiza o estado removendo o item deletado
      if (type === "areas") {
        setAreas((prevAreas) => prevAreas.filter((area) => area.cod_area !== id));
        
        // Remove também os núcleos e unidades associadas
        setNucleos((prevNucleos) => prevNucleos.filter((nucleo) => nucleo.cod_area !== id));
        setUnidades((prevUnidades) => prevUnidades.filter((unidade) => unidade.cod_area !== id));
        
      } else if (type === "nucleos") {
        setNucleos((prevNucleos) => prevNucleos.filter((nucleo) => nucleo.cod_nucleo !== id));
        
        // Remove também as unidades associadas
        setUnidades((prevUnidades) => prevUnidades.filter((unidade) => unidade.cod_nucleo !== id));
        
      } else if (type === "unidades") {
        setUnidades((prevUnidades) => prevUnidades.filter((unidade) => unidade.cod_unidade !== id));
        
        // Remove também os níveis associados
        setNiveis((prevNiveis) => prevNiveis.filter((nivel) => nivel.cod_unidade !== id));
        
      } else if (type === "niveis") {
        setNiveis((prevNiveis) => prevNiveis.filter((nivel) => nivel.cod_nivel !== id));
      }

      // Recarrega os dados para garantir sincronização
      await fetchAllData();

    } catch (error) {
      console.error(`Erro ao remover ${type}:`, error);
      // Adicione tratamento de erro adicional se necessário
    }
  };

  const handleEditClick = (type: string, id: string, data: any) => {
    setEditingItem({ type, id, data });
    setIsEditModalOpen(true);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-orange-500">
          Gerir Áreas, Núcleos e Unidades
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
              onClick={() => setIsAddModalOpen(true)}
            >
              Adicionar Área
            </Button>
            <Button
              onClick={() => setIsAddNucleoModalOpen(true)}
              variant="outline"
              className="bg-grey-300 border-orange-300 text-orange-300 hover:bg-yellow-200 px-5 py-2 h-auto"
            >
              Adicionar Núcleo
            </Button>
            <Button
              onClick={() => setIsAddUnidadeModalOpen(true)}
              variant="outline"
              className="bg-grey-300 border-orange-300 text-orange-300 hover:bg-yellow-200 px-5 py-2 h-auto"
            >
              Adicionar Unidade
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Área</th>
                <th className="border border-gray-300 p-2">Núcleo</th>
                <th className="border border-gray-300 p-2">Unidade</th>
              </tr>
            </thead>
            <tbody>
              {filteredAreas.map((area) => {
                const areaNucleos = nucleos.filter(
                  (n) => n.cod_area === area.cod_area
                );
                if (areaNucleos.length > 0) {
                  return (
                    <React.Fragment key={area._id}>
                      {areaNucleos.map((nucleo, nucleoIndex) => {
                        const nucleoUnidades = unidadesComNiveis
                          .filter((u) => u.cod_nucleo === nucleo.cod_nucleo)
                          .sort((a, b) => a.cod_unidade.localeCompare(b.cod_unidade));
                        if (nucleoUnidades.length > 0) {
                          return nucleoUnidades.map((unidade, unidadeIndex) => (
                            <tr key={unidade._id}>
                              {nucleoIndex === 0 && unidadeIndex === 0 && (
                                <td
                                  rowSpan={areaNucleos.reduce(
                                    (acc, n) =>
                                      acc +
                                      unidadesComNiveis.filter(
                                        (u) => u.cod_nucleo === n.cod_nucleo
                                      ).length,
                                    0
                                  )}
                                  className="border p-2"
                                >
                                  <div className="flex justify-between items-center">
                                    <span>
                                      {area.Nome} ({area.cod_area})
                                    </span>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() =>
                                          handleEditClick("areas", area.cod_area, area)
                                        }
                                        className="bg-orange-300 hover:bg-orange-500 text-white px-5 py-2 h-auto"
                                      >
                                        Editar
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          handleDelete("areas", area.cod_area)
                                        }
                                        className="bg-red-300 hover:bg-red-500 text-white px-5 py-2 h-auto"
                                      >
                                        Remover
                                      </Button>
                                    </div>
                                  </div>
                                </td>
                              )}
                              {unidadeIndex === 0 && (
                                <td
                                  rowSpan={nucleoUnidades.length}
                                  className="border p-2"
                                >
                                  <div className="flex justify-between items-center">
                                    <span>
                                      {nucleo.Nome} ({nucleo.cod_nucleo})
                                    </span>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() =>
                                          handleEditClick("nucleos", nucleo.cod_nucleo, nucleo)
                                        }
                                        className="bg-orange-300 hover:bg-orange-500 text-white px-5 py-2 h-auto"
                                      >
                                        Editar
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          handleDelete("nucleos", nucleo.cod_nucleo)
                                        }
                                        className="bg-red-300 hover:bg-red-500 text-white px-5 py-2 h-auto"
                                      >
                                        Remover
                                      </Button>
                                    </div>
                                  </div>
                                </td>
                              )}
                              <td className="border p-2">
                                <div className="flex justify-between items-center">
                                  <span>
                                    {unidade.Nome} ({unidade.cod_unidade})
                                    {unidade.niveis && unidade.niveis.length > 0 && (
                                      <div className="text-sm text-gray-500">
                                        Níveis: {unidade.niveis.map((nivel) => nivel.cod_nivel).join(", ")}
                                      </div>
                                    )}
                                  </span>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() =>
                                        handleEditClick("unidades", unidade.cod_unidade, unidade)
                                      }
                                      className="bg-orange-300 hover:bg-orange-500 text-white px-5 py-2 h-auto"
                                    >
                                      Editar
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleDelete("unidades", unidade.cod_unidade)
                                      }
                                      className="bg-red-300 hover:bg-red-500 text-white px-5 py-2 h-auto"
                                    >
                                      Remover
                                    </Button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ));
                        } else {
                          return (
                            <tr key={nucleo._id}>
                              {nucleoIndex === 0 && (
                                <td
                                  rowSpan={areaNucleos.length}
                                  className="border p-2"
                                >
                                  <div className="flex justify-between items-center">
                                    <span>
                                      {area.Nome} ({area.cod_area})
                                    </span>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() =>
                                          handleEditClick("areas", area.cod_area, area)
                                        }
                                        className="bg-orange-300 hover:bg-orange-500 text-white px-5 py-2 h-auto"
                                      >
                                        Editar
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          handleDelete("areas", area.cod_area)
                                        }
                                        className="bg-red-300 hover:bg-red-500 text-white px-5 py-2 h-auto"
                                      >
                                        Remover
                                      </Button>
                                    </div>
                                  </div>
                                </td>
                              )}
                              <td className="border p-2">
                                <div className="flex justify-between items-center">
                                  <span>
                                    {nucleo.Nome} ({nucleo.cod_nucleo})
                                  </span>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() =>
                                        handleEditClick("nucleos", nucleo.cod_nucleo, nucleo)
                                      }
                                      className="bg-orange-300 hover:bg-orange-500 text-white px-5 py-2 h-auto"
                                    >
                                      Editar
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleDelete("nucleos", nucleo.cod_nucleo)
                                      }
                                      className="bg-red-300 hover:bg-red-500 text-white px-5 py-2 h-auto"
                                    >
                                      Remover
                                    </Button>
                                  </div>
                                </div>
                              </td>
                              <td className="border p-2 text-center text-gray-400">
                                (Sem unidades)
                              </td>
                            </tr>
                          );
                        }
                      })}
                    </React.Fragment>
                  );
                } else {
                  const areaUnidades = unidadesComNiveis
                    .filter((u) => u.cod_nucleo === null && u.cod_area === area.cod_area)
                    .sort((a, b) => a.cod_unidade.localeCompare(b.cod_unidade));
                  if (areaUnidades.length > 0) {
                    return areaUnidades.map((unidade, index) => (
                      <tr key={unidade._id}>
                        {index === 0 && (
                          <td rowSpan={areaUnidades.length} className="border p-2">
                            <div className="flex justify-between items-center">
                              <span>
                                {area.Nome} ({area.cod_area})
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    handleEditClick("areas", area.cod_area, area)
                                  }
                                  className="bg-orange-300 hover:bg-orange-500 text-white px-5 py-2 h-auto"
                                >
                                  Editar
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleDelete("areas", area.cod_area)
                                  }
                                  className="bg-red-300 hover:bg-red-500 text-white px-5 py-2 h-auto"
                                >
                                  Remover
                                </Button>
                              </div>
                            </div>
                          </td>
                        )}
                        {index === 0 && (
                          <td
                            rowSpan={areaUnidades.length}
                            className="border p-2 text-center text-gray-400"
                          >
                            (Sem núcleos)
                          </td>
                        )}
                        <td className="border p-2">
                          <div className="flex justify-between items-center">
                            <span>
                              {unidade.Nome} ({unidade.cod_unidade})
                              {unidade.niveis && unidade.niveis.length > 0 && (
                                <div className="text-sm text-gray-500">
                                  Níveis: {unidade.niveis.map((nivel) => nivel.cod_nivel).join(", ")}
                                </div>
                              )}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                onClick={() =>
                                  handleEditClick("unidades", unidade.cod_unidade, unidade)
                                }
                                className="bg-orange-300 hover:bg-orange-500 text-white px-5 py-2 h-auto"
                              >
                                Editar
                              </Button>
                              <Button
                                onClick={() =>
                                  handleDelete("unidades", unidade.cod_unidade)
                                }
                                className="bg-red-300 hover:bg-red-500 text-white px-5 py-2 h-auto"
                              >
                                Remover
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ));
                  } else {
                    return (
                      <tr key={area._id}>
                        <td className="border p-2">
                          <div className="flex justify-between items-center">
                            <span>
                              {area.Nome} ({area.cod_area})
                            </span>
                            <div className="flex gap-2">
                              <Button
                                onClick={() =>
                                  handleEditClick("areas", area.cod_area, area)
                                }
                                className="bg-orange-300 hover:bg-orange-500 text-white px-5 py-2 h-auto"
                              >
                                Editar
                              </Button>
                              <Button
                                onClick={() => handleDelete("areas", area.cod_area)}
                                className="bg-red-300 hover:bg-red-500 text-white px-5 py-2 h-auto"
                              >
                                Remover
                              </Button>
                            </div>
                          </div>
                        </td>
                        <td className="border p-2 text-center text-gray-400">
                          (Sem núcleos)
                        </td>
                        <td className="border p-2 text-center text-gray-400">
                          (Sem unidades)
                        </td>
                      </tr>
                    );
                  }
                }
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Adição */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg w-full md:w-1/2 lg:w-1/3 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-orange-500">Adicionar Área</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const data = {
                  cod_area: formData.get("cod_area"),
                  Nome: formData.get("Nome"),
                  isDeleted: false,
                };
                handleAdd("areas", data);
              }}
            >
              <input
                type="text"
                name="cod_area"
                placeholder="Código da Área"
                className="border border-orange-300 p-2 mb-4 w-full rounded-lg focus:outline-none focus:border-orange-500"
                required
              />
              <input
                type="text"
                name="Nome"
                placeholder="Nome da Área"
                className="border border-orange-300 p-2 mb-4 w-full rounded-lg focus:outline-none focus:border-orange-500"
                required
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  variant="outline"
                  className="bg-grey-300 border-orange-300 text-orange-300 hover:bg-yellow-200 px-5 py-2 h-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-300 hover:bg-orange-500 text-white px-5 py-2 h-auto"
                >
                  Adicionar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg w-full md:w-1/2 lg:w-1/3 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-orange-500">
              Editar {editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1, -1)}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updatedData: any = {
                  cod: formValues.cod,
                  Nome: formValues.Nome,
                };

                if (editingItem.type === "nucleos") {
                  updatedData.cod_area = formValues.cod_area;
                } else if (editingItem.type === "unidades") {
                  updatedData.cod_nucleo = formValues.cod_nucleo === "null" ? null : formValues.cod_nucleo;
                  updatedData.cod_area = formValues.cod_area;
                }

                handleEdit(editingItem.type, editingItem.id, updatedData);
              }}
            >
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingItem.type === "areas" ? "Código da Área" :
                     editingItem.type === "nucleos" ? "Código do Núcleo" :
                     editingItem.type === "unidades" ? "Código da Unidade" : "Código"}
                  </label>
                  <input
                    type="text"
                    name="cod"
                    value={formValues.cod}
                    onChange={handleInputChange}
                    className="border border-orange-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    name="Nome"
                    value={formValues.Nome}
                    onChange={handleInputChange}
                    className="border border-orange-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                {editingItem.type === "nucleos" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                    <select
                      name="cod_area"
                      value={formValues.cod_area}
                      onChange={handleInputChange}
                      className="border border-orange-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                      required
                    >
                      <option value="">Selecione uma área</option>
                      {areas.map((area) => (
                        <option key={area._id} value={area.cod_area}>
                          {area.Nome} ({area.cod_area})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {editingItem.type === "unidades" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Núcleo (opcional)</label>
                    <select
                      name="cod_nucleo"
                      value={formValues.cod_nucleo}
                      onChange={handleInputChange}
                      className="border border-orange-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                    >
                      <option value="null">Sem núcleo</option>
                      {nucleos.map((nucleo) => (
                        <option key={nucleo._id} value={nucleo.cod_nucleo}>
                          {nucleo.Nome} ({nucleo.cod_nucleo})
                        </option>
                      ))}
                    </select>

                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Área</label>
                    <select
                      name="cod_area"
                      value={formValues.cod_area}
                      onChange={handleInputChange}
                      className="border border-orange-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                      required
                    >
                      {areas.map((area) => (
                        <option key={area._id} value={area.cod_area}>
                          {area.Nome} ({area.cod_area})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {editingItem.type === "areas" && (
                <div className="mb-4">
                  <h3 className="font-bold mb-2 text-gray-700">Núcleos desta Área</h3>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 mb-2">
                    {nucleos
                      .filter((nucleo) => nucleo.cod_area === editingItem.id)
                      .map((nucleo) => (
                        <div key={nucleo._id} className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded">
                          <span>{nucleo.Nome} ({nucleo.cod_nucleo})</span>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setIsEditModalOpen(false);
                                handleEditClick("nucleos", nucleo.cod_nucleo, nucleo);
                              }}
                              className="bg-orange-300 hover:bg-orange-500 text-white px-3 py-1 h-auto"
                            >
                              Editar
                            </Button>
                            <Button
                              onClick={() => handleDelete("nucleos", nucleo.cod_nucleo)}
                              className="bg-red-300 hover:bg-red-500 text-white px-3 py-1 h-auto"
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      ))}
                    {nucleos.filter((nucleo) => nucleo.cod_area === editingItem.id).length === 0 && (
                      <p className="text-gray-500 text-center py-2">Nenhum núcleo encontrado</p>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setIsAddNucleoModalOpen(true);
                    }}
                    className="bg-green-300 hover:bg-green-500 text-white px-3 py-1 h-auto"
                  >
                    Adicionar Núcleo
                  </Button>

                  <h3 className="font-bold mb-2 mt-4 text-gray-700">Unidades desta Área sem Núcleo</h3>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 mb-2">
                    {unidades
                      .filter((unidade) => unidade.cod_area === editingItem.id && unidade.cod_nucleo === null)
                      .map((unidade) => (
                        <div key={unidade._id} className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded">
                          <span>{unidade.Nome} ({unidade.cod_unidade})</span>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setIsEditModalOpen(false);
                                handleEditClick("unidades", unidade.cod_unidade, unidade);
                              }}
                              className="bg-orange-300 hover:bg-orange-500 text-white px-3 py-1 h-auto"
                            >
                              Editar
                            </Button>
                            <Button
                              onClick={() => handleDelete("unidades", unidade.cod_unidade)}
                              className="bg-red-300 hover:bg-red-500 text-white px-3 py-1 h-auto"
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      ))}
                    {unidades.filter((unidade) => unidade.cod_area === editingItem.id && unidade.cod_nucleo === null).length === 0 && (
                      <p className="text-gray-500 text-center py-2">Nenhuma unidade encontrada</p>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setIsAddUnidadeModalOpen(true);
                    }}
                    className="bg-green-300 hover:bg-green-500 text-white px-3 py-1 h-auto"
                  >
                    Adicionar Unidade
                  </Button>
                </div>
              )}

              {editingItem.type === "nucleos" && (
                <div className="mb-4">
                  <h3 className="font-bold mb-2 text-gray-700">Unidades deste Núcleo</h3>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 mb-2">
                    {unidades
                      .filter((unidade) => unidade.cod_nucleo === editingItem.id)
                      .map((unidade) => (
                        <div key={unidade._id} className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded">
                          <span>{unidade.Nome} ({unidade.cod_unidade})</span>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setIsEditModalOpen(false);
                                handleEditClick("unidades", unidade.cod_unidade, unidade);
                              }}
                              className="bg-orange-300 hover:bg-orange-500 text-white px-3 py-1 h-auto"
                            >
                              Editar
                            </Button>
                            <Button
                              onClick={() => handleDelete("unidades", unidade.cod_unidade)}
                              className="bg-red-300 hover:bg-red-500 text-white px-3 py-1 h-auto"
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      ))}
                    {unidades.filter((unidade) => unidade.cod_nucleo === editingItem.id).length === 0 && (
                      <p className="text-gray-500 text-center py-2">Nenhuma unidade encontrada</p>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setIsAddUnidadeModalOpen(true);
                    }}
                    className="bg-green-300 hover:bg-green-500 text-white px-3 py-1 h-auto"
                  >
                    Adicionar Unidade
                  </Button>
                </div>
              )}

              {editingItem.type === "unidades" && (
                <div className="mb-4">
                  <h3 className="font-bold mb-2 text-gray-700">Níveis desta Unidade</h3>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 mb-2">
                    {unidadesComNiveis
                      .find((u) => u.cod_unidade === editingItem.id)
                      ?.niveis.map((nivel) => (
                        <div key={nivel._id} className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded">
                          <span>{nivel.cod_nivel}</span>
                          <Button
                            onClick={() => handleDelete("niveis", nivel.cod_nivel)}
                            className="bg-red-300 hover:bg-red-500 text-white px-3 py-1 h-auto"
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                    {!unidadesComNiveis.find((u) => u.cod_unidade === editingItem.id)?.niveis.length && (
                      <p className="text-gray-500 text-center py-2">Nenhum nível encontrado</p>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setIsAddNivelModalOpen(true);
                    }}
                    className="bg-green-300 hover:bg-green-500 text-white px-3 py-1 h-auto"
                  >
                    Adicionar Nível
                  </Button>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  variant="outline"
                  className="bg-grey-300 border-orange-300 text-orange-300 hover:bg-yellow-200 px-5 py-2 h-auto mr-2"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-300 hover:bg-orange-500 text-white px-5 py-2 h-auto"
                >
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Adição de Unidade */}
      {isAddUnidadeModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg w-full md:w-1/2 lg:w-1/3 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-orange-500">Adicionar Unidade</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const nucleoValue = formData.get("cod_nucleo");
                const data = {
                  cod_unidade: formData.get("cod_unidade"),
                  Nome: formData.get("Nome"),
                  cod_nucleo: nucleoValue === "null" ? null : nucleoValue,
                  cod_area: editingItem?.type === "areas" ? editingItem?.id : formData.get("cod_area"),
                  isDeleted: false,
                };
                handleAdd("unidades", data);
                setIsAddUnidadeModalOpen(false);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Código da Unidade</label>
                <input
                  type="text"
                  name="cod_unidade"
                  placeholder="Código da Unidade"
                  className="border border-orange-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Unidade</label>
                <input
                  type="text"
                  name="Nome"
                  placeholder="Nome da Unidade"
                  className="border border-orange-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Núcleo (opcional)</label>
                <select
                  name="cod_nucleo"
                  className="border border-orange-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                >
                  <option value="null">Sem núcleo</option>
                  {nucleos.map((nucleo) => (
                    <option key={nucleo._id} value={nucleo.cod_nucleo}>
                      {nucleo.Nome} ({nucleo.cod_nucleo})
                    </option>
                  ))}
                </select>
              </div>
              {editingItem?.type !== "areas" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                  <select
                    name="cod_area"
                    className="border border-orange-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                    required
                  >
                    {areas.map((area) => (
                      <option key={area._id} value={area.cod_area}>
                        {area.Nome} ({area.cod_area})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setIsAddUnidadeModalOpen(false)}
                  variant="outline"
                  className="bg-grey-300 border-orange-300 text-orange-300 hover:bg-yellow-200 px-5 py-2 h-auto mr-2"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-300 hover:bg-orange-500 text-white px-5 py-2 h-auto"
                >
                  Adicionar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Adição de Núcleo */}
      {isAddNucleoModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg w-full md:w-1/2 lg:w-1/3 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-orange-500">Adicionar Núcleo</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const data = {
                  cod_nucleo: formData.get("cod_nucleo"),
                  Nome: formData.get("Nome"),
                  cod_area: formData.get("cod_area"),
                  isDeleted: false,
                };
                handleAdd("nucleos", data);
                setIsAddNucleoModalOpen(false);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Código do Núcleo</label>
                <input
                  type="text"
                  name="cod_nucleo"
                  placeholder="Código do Núcleo"
                  className="border border-orange-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Núcleo</label>
                <input
                  type="text"
                  name="Nome"
                  placeholder="Nome do Núcleo"
                  className="border border-orange-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                <select
                  name="cod_area"
                  className="border border-orange-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
                  required
                >
                  <option value="">Selecione uma área</option>
                  {areas.map((area) => (
                    <option key={area._id} value={area.cod_area}>
                      {area.Nome} ({area.cod_area})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setIsAddNucleoModalOpen(false)}
                  variant="outline"
                  className="bg-grey-300 border-orange-300 text-orange-300 hover:bg-yellow-200 px-5 py-2 h-auto mr-2"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-300 hover:bg-orange-500 text-white px-5 py-2 h-auto"
                >
                  Adicionar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Adição de Nível */}
      {isAddNivelModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg w-full md:w-1/2 lg:w-1/3 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-orange-500">Adicionar Nível</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const data = {
                  cod_unidade: editingItem?.id,
                  cod_nivel: formData.get("cod_nivel"),
                  isDeleted: false,
                };
                handleAdd("niveis", data);
              }}
            >
              <input
                type="text"
                name="cod_nivel"
                placeholder="Código do Nível"
                className="border p-2 mb-2 w-full"
                required
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setIsAddNivelModalOpen(false)}
                  variant="outline"
                  className="bg-grey-300 border-orange-300 text-orange-300 hover:bg-yellow-200 px-5 py-2 h-auto mr-2"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-orange-300 hover:bg-orange-500 text-white px-5 py-2 h-auto">
                  Adicionar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default withAuth(AreasPage, ["TORVC"]);