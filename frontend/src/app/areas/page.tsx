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

const AreasPage: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [nucleos, setNucleos] = useState<Nucleo[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData("areas", setAreas);
    fetchData("nucleos", setNucleos);
    fetchData("unidades", setUnidades);
  }, []);

  const fetchData = async (endpoint: string, setData: Function) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/${endpoint}`);
      setData(response.data);
    } catch (error) {
      console.error(`Erro ao buscar ${endpoint}:`, error);
    }
  };

  // Filtra áreas com base no texto da pesquisa
  const filteredAreas = areas.filter(
    (area) =>
      area.Nome.toLowerCase().includes(search.toLowerCase()) ||
      nucleos.some(
        (nucleo) =>
          nucleo.cod_area === area.cod_area &&
          nucleo.Nome.toLowerCase().includes(search.toLowerCase())
      ) ||
      unidades.some(
        (unidade) =>
          (nucleos.some(
            (nucleo) =>
              nucleo.cod_area === area.cod_area &&
              nucleo.cod_nucleo === unidade.cod_nucleo
          ) ||
            (unidade.cod_nucleo === null &&
              unidade.cod_area === area.cod_area)) &&
          unidade.Nome.toLowerCase().includes(search.toLowerCase())
      )
  );

  const handleEdit = (type: string, id: string) => {
    console.log(`Editar ${type} com ID: ${id}`);
    // Aqui você pode abrir um modal para edição ou redirecionar para uma página de edição
  };

  const handleDelete = async (type: string, id: string) => {
    const confirmDelete = window.confirm("Tem certeza que deseja remover?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/${type}/${id}`); // Usar DELETE

      // Atualiza os dados no estado corretamente
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
      }
    } catch (error) {
      console.error(`Erro ao remover ${type}:`, error);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-orange-500">
          Gerir Áreas, Núcleos e Unidades
        </h1>
        <input
          type="text"
          className="border p-2 mb-4 rounded-lg w-full"
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
              // Filtra núcleos que pertencem à área
              const areaNucleos = nucleos.filter(
                (n) => n.cod_area === area.cod_area
              );
              if (areaNucleos.length > 0) {
                // Se a área tem núcleos, trata cada núcleo e suas unidades
                return (
                  <React.Fragment key={area._id}>
                    {areaNucleos.map((nucleo, nucleoIndex) => {
                      // Filtra unidades que pertencem ao núcleo
                      const nucleoUnidades = unidades.filter(
                        (u) => u.cod_nucleo === nucleo.cod_nucleo
                      );
                      if (nucleoUnidades.length > 0) {
                        return nucleoUnidades.map((unidade, unidadeIndex) => (
                          <tr key={unidade._id}>
                            {/* Exibe a célula da área apenas na primeira linha do primeiro núcleo */}
                            {nucleoIndex === 0 && unidadeIndex === 0 && (
                              <td
                                rowSpan={areaNucleos.reduce(
                                  (acc, n) =>
                                    acc +
                                    unidades.filter(
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
                                  <Button
                                    onClick={() =>
                                      handleDelete("areas", area.cod_area)
                                    }
                                    className="bg-red-500"
                                  >
                                    Remover
                                  </Button>
                                </div>
                              </td>
                            )}
                            {/* Exibe a célula do núcleo apenas na primeira linha do seu grupo */}
                            {unidadeIndex === 0 && (
                              <td
                                rowSpan={nucleoUnidades.length}
                                className="border p-2"
                              >
                                <div className="flex justify-between items-center">
                                  <span>
                                    {nucleo.Nome} ({nucleo.cod_nucleo})
                                  </span>
                                  <Button
                                    onClick={() =>
                                      handleDelete("nucleos", nucleo.cod_nucleo)
                                    }
                                    className="bg-red-500"
                                  >
                                    Remover
                                  </Button>
                                </div>
                              </td>
                            )}
                            <td className="border p-2">
                              <div className="flex justify-between items-center">
                                <span>
                                  {unidade.Nome} ({unidade.cod_unidade})
                                </span>
                                <Button
                                  onClick={() =>
                                    handleDelete("unidades", unidade.cod_unidade)
                                  }
                                  className="bg-red-500"
                                >
                                  Remover
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ));
                      } else {
                        // Núcleo sem unidades
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
                                  <Button
                                    onClick={() =>
                                      handleDelete("areas", area.cod_area)
                                    }
                                    className="bg-red-500"
                                  >
                                    Remover
                                  </Button>
                                </div>
                              </td>
                            )}
                            <td className="border p-2">
                              <div className="flex justify-between items-center">
                                <span>
                                  {nucleo.Nome} ({nucleo.cod_nucleo})
                                </span>
                                <Button
                                  onClick={() =>
                                    handleDelete("nucleos", nucleo.cod_nucleo)
                                  }
                                  className="bg-red-500"
                                >
                                  Remover
                                </Button>
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
                // Área sem núcleos
                // Filtra unidades que têm cod_nucleo null e cod_area igual ao da área
                const areaUnidades = unidades.filter(
                  (u) => u.cod_nucleo === null && u.cod_area === area.cod_area
                );
                if (areaUnidades.length > 0) {
                  return areaUnidades.map((unidade, index) => (
                    <tr key={unidade._id}>
                      {index === 0 && (
                        <td rowSpan={areaUnidades.length} className="border p-2">
                          <div className="flex justify-between items-center">
                            <span>
                              {area.Nome} ({area.cod_area})
                            </span>
                            <Button
                              onClick={() =>
                                handleDelete("areas", area.cod_area)
                              }
                              className="bg-red-500"
                            >
                              Remover
                            </Button>
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
                          </span>
                          <Button
                            onClick={() =>
                              handleDelete("unidades", unidade.cod_unidade)
                            }
                            className="bg-red-500"
                          >
                            Remover
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ));
                } else {
                  // Área sem núcleos nem unidades
                  return (
                    <tr key={area._id}>
                      <td className="border p-2">
                        <div className="flex justify-between items-center">
                          <span>
                            {area.Nome} ({area.cod_area})
                          </span>
                          <Button
                            onClick={() => handleDelete("areas", area.cod_area)}
                            className="bg-red-500"
                          >
                            Remover
                          </Button>
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
    </>
  );
};

export default AreasPage;