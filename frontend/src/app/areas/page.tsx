"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "@/app/components/header";
import { Button } from "@/app/components/ui/button";

interface Area {
  _id: string;
  cod_area: string;
  Nome: string;
}

interface Nucleo {
  _id: string;
  cod_nucleo: string;
  Nome: string;
  cod_area: string;
}

interface Unidade {
  _id: string;
  cod_unidade: string;
  Nome: string;
  cod_nucleo: string | null;
  cod_area: string;
}

interface Nivel {
  _id: string;
  cod_nivel: string;
  cod_unidade: string;
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
  const [editingItem, setEditingItem] = useState<{
    type: string;
    id: string;
    data: any;
  } | null>(null);

  useEffect(() => {
    fetchData("areas", setAreas);
    fetchData("nucleos", setNucleos);
    fetchData("unidades", setUnidades);
    fetchData("niveis", setNiveis);
  }, []);

  const fetchData = async (endpoint: string, setData: Function) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/${endpoint}`);
      setData(response.data);
    } catch (error) {
      console.error(`Erro ao buscar ${endpoint}:`, error);
    }
  };

  const unidadesComNiveis = unidades
    .map((unidade) => ({
      ...unidade,
      niveis: niveis.filter((nivel) => nivel.cod_unidade === unidade.cod_unidade),
    }))
    .sort((a, b) => a.cod_unidade.localeCompare(b.cod_unidade));

  const filteredAreas = areas.filter(
    (area) =>
      area.Nome.toLowerCase().includes(search.toLowerCase()) ||
      area.cod_area.toLowerCase().includes(search.toLowerCase()) ||
      nucleos.some(
        (nucleo) =>
          nucleo.cod_area === area.cod_area &&
          (nucleo.Nome.toLowerCase().includes(search.toLowerCase()) ||
            nucleo.cod_nucleo.toLowerCase().includes(search.toLowerCase()))
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
          (unidade.Nome.toLowerCase().includes(search.toLowerCase()) ||
            unidade.cod_unidade.toLowerCase().includes(search.toLowerCase()))
      )
  );

  const handleAdd = async (type: string, data: any) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/${type}`, data);
      if (type === "areas") {
        setAreas((prev) => [...prev, response.data]);
      } else if (type === "nucleos") {
        setNucleos((prev) => [...prev, response.data]);
      } else if (type === "unidades") {
        setUnidades((prev) => [...prev, response.data]);
      } else if (type === "niveis") {
        setNiveis((prev) => [...prev, response.data]);
      }
      setIsAddModalOpen(false);
      setIsAddNivelModalOpen(false);
    } catch (error) {
      console.error(`Erro ao adicionar ${type}:`, error);
    }
  };

  const handleEdit = async (type: string, id: string, updatedData: any) => {
    try {
      await axios.put(`http://localhost:5000/api/${type}/${id}`, updatedData);
      if (type === "areas") {
        setAreas((prev) =>
          prev.map((area) =>
            area.cod_area === id ? { ...area, ...updatedData } : area
          )
        );
      } else if (type === "nucleos") {
        setNucleos((prev) =>
          prev.map((nucleo) =>
            nucleo.cod_nucleo === id ? { ...nucleo, ...updatedData } : nucleo
          )
        );
      } else if (type === "unidades") {
        setUnidades((prev) =>
          prev.map((unidade) =>
            unidade.cod_unidade === id ? { ...unidade, ...updatedData } : unidade
          )
        );
      }
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(`Erro ao editar ${type}:`, error);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    const confirmDelete = window.confirm("Tem certeza que deseja remover?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/${type}/${id}`);
      if (type === "areas") {
        setAreas((prevAreas) =>
          prevAreas.filter((area) => area.cod_area !== id)
        );
      } else if (type === "nucleos") {
        setNucleos((prevNucleos) =>
          prevNucleos.filter((nucleo) => nucleo.cod_nucleo !== id)
        );
      } else if (type === "unidades") {
        setUnidades((prevUnidades) =>
          prevUnidades.filter((unidade) => unidade.cod_unidade !== id)
        );
      } else if (type === "niveis") {
        setNiveis((prevNiveis) =>
          prevNiveis.filter((nivel) => nivel.cod_nivel !== id)
        );
      }
    } catch (error) {
      console.error(`Erro ao remover ${type}:`, error);
    }
  };

  const handleEditClick = (type: string, id: string, data: any) => {
    setEditingItem({ type, id, data });
    setIsEditModalOpen(true); // Abre o modal de edição
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-orange-500">
          Gerir Áreas, Núcleos e Unidades
        </h1>
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            className="border p-2 rounded-lg w-1/2"
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant="outline"
            className="bg-grey-300 border-orange-300 text-orange-300 hover:bg-yellow-200 px-5 py-2 h-auto"
            onClick={() => setIsAddModalOpen(true)}
          >
            Adicionar Área
          </Button>
        </div>
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

      {/* Modal de Adição */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-1/3 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-orange-500">Adicionar Área</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const data = {
                  cod_area: formData.get("cod_area"),
                  Nome: formData.get("Nome"),
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
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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

      {/* Modal de Edição */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-1/3 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-orange-500">Editar {editingItem.type}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const updatedData = {
                  Nome: formData.get("Nome"),
                };
                handleEdit(editingItem.type, editingItem.id, updatedData);
              }}
            >
              <input
                type="text"
                name="Nome"
                defaultValue={editingItem.data.Nome}
                className="border p-2 mb-2 w-full"
                required
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  variant="outline" 
                  className="bg-grey-300 border-orange-300 text-orange-300 hover:bg-yellow-200 px-5 py-2 h-auto mr-2"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-orange-300 hover:bg-orange-500 text-white px-5 py-2 h-auto">
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Adição de Nível */}
      {isAddNivelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Adicionar Nível</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const data = {
                  cod_unidade: editingItem?.id,
                  descricao: formData.get("descricao"),
                };
                handleAdd("niveis", data);
              }}
            >
              <input
                type="text"
                name="descricao"
                placeholder="Descrição do Nível"
                className="border p-2 mb-2 w-full"
                required
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setIsAddNivelModalOpen(false)}
                  className="bg-gray-500 mr-2"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-500">
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

export default AreasPage;