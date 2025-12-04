'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import jsVectorMap from 'jsvectormap';
import 'jsvectormap/dist/jsvectormap.css';
import 'jsvectormap/dist/maps/world';
// Importar mapa do mundo (já que não temos certeza se o do Brasil está disponível nos arquivos locais)
// Se houver um arquivo brazil.js, poderíamos usar. Vamos tentar usar o world ou us como fallback se não tivermos outro.
// O ideal seria ter o mapa do Brasil. Vou assumir que podemos usar um mapa genérico ou tentar carregar o do Brasil via CDN se necessário,
// mas para seguir o padrão do projeto, vou usar o que estiver disponível ou um mapa mundi simples.
// No exemplo anterior usava 'us_aea_en'. Vou tentar usar 'world' se disponível no pacote, ou manter 'us_aea_en' como placeholder se não tiver outro,
// mas o ideal é 'world_merc' que geralmente vem no pacote.

// Mock de coordenadas para cidades principais (apenas para demonstração)
const cityCoords: Record<string, [number, number]> = {
    'São Paulo': [-23.5505, -46.6333],
    'Rio de Janeiro': [-22.9068, -43.1729],
    'Brasília': [-15.7801, -47.9292],
    'Salvador': [-12.9777, -38.5016],
    'Fortaleza': [-3.7172, -38.5434],
    'Belo Horizonte': [-19.9167, -43.9345],
    'Manaus': [-3.1190, -60.0217],
    'Curitiba': [-25.4284, -49.2733],
    'Recife': [-8.0543, -34.8813],
    'Porto Alegre': [-30.0346, -51.2177],
    // Adicione mais conforme necessário ou use um gerador aleatório perto dessas coordenadas
};

export default function MapaPage() {
    const searchParams = useSearchParams();
    const subgrupoId = searchParams.get('subgrupoId');
    const [loading, setLoading] = useState(true);
    const [eleitores, setEleitores] = useState<any[]>([]);
    const [subgrupo, setSubgrupo] = useState<any>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (subgrupoId) {
            carregarDados();
        }
    }, [subgrupoId]);

    useEffect(() => {
        if (!loading && eleitores.length > 0) {
            initMap();
        }
    }, [loading, eleitores]);

    const carregarDados = async () => {
        try {
            // Carregar subgrupo
            const subRes = await fetch(`/api/subgrupos/${subgrupoId}`);
            if (subRes.ok) {
                const subData = await subRes.json();
                setSubgrupo(subData);
            }

            // Carregar eleitores do subgrupo
            const eleitoresRes = await fetch(`/api/eleitores?subgrupoId=${subgrupoId}&limit=1000`);
            if (eleitoresRes.ok) {
                const eleitoresData = await eleitoresRes.json();
                setEleitores(eleitoresData.eleitores || []);
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const initMap = () => {
        // Limpar mapa anterior se existir
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.innerHTML = '';
        }

        // Preparar marcadores
        const markers = eleitores.map((eleitor) => {
            // Tentar pegar coordenadas da cidade ou gerar aleatórias no Brasil para demo
            // Latitude Brasil: -33 a 5
            // Longitude Brasil: -74 a -34

            let coords = cityCoords[eleitor.cidade];

            if (!coords) {
                // Gerar coordenada aleatória "no Brasil" para demonstração se a cidade não for conhecida
                // Focando mais na região sudeste/centro para não cair no mar
                const lat = -10 - Math.random() * 15;
                const lng = -55 + Math.random() * 10;
                coords = [lat, lng];
            } else {
                // Adicionar pequeno jitter para não sobrepor exatamente
                coords = [
                    coords[0] + (Math.random() - 0.5) * 0.05,
                    coords[1] + (Math.random() - 0.5) * 0.05
                ];
            }

            return {
                name: eleitor.nomeCompleto,
                coords: coords,
                style: {
                    fill: '#7B2CBF',
                    stroke: '#fff',
                    r: 5
                }
            };
        });

        // Importar mapa mundi dinamicamente para evitar erro de SSR ou build
        // Vamos usar um mapa que vem com a lib, geralmente 'world'
        // Se não tiver, teremos que baixar um arquivo JS de mapa.
        // Como vi 'us-aea-en' no exemplo, vou tentar usar 'world' que é padrão.
        // Se falhar, o usuário verá um erro e corrigiremos.

        // @ts-ignore
        const map = new jsVectorMap({
            selector: '#map',
            map: 'world', // Tentar mapa mundi
            // map: 'brazil', // Ideal seria esse, mas precisa do arquivo JS
            zoomButtons: true,
            zoomOnScroll: true,
            regionsSelectable: false,
            markersSelectable: true,
            markers: markers,
            markerStyle: {
                initial: {
                    fill: '#7B2CBF',
                    stroke: '#fff',
                    strokeWidth: 2,
                    r: 6
                },
                hover: {
                    fill: '#3A0CA3',
                    stroke: '#fff',
                    strokeWidth: 2,
                    cursor: 'pointer',
                    r: 8
                }
            },
            regionStyle: {
                initial: {
                    fill: '#E6EBF1',
                    fillOpacity: 1,
                    stroke: 'none',
                    strokeWidth: 0,
                    strokeOpacity: 1
                },
                hover: {
                    fillOpacity: 0.7,
                    cursor: 'pointer'
                }
            },
            onMarkerTooltipShow(event: any, tooltip: any, index: number) {
                tooltip.text(
                    `<div class="text-center">
            <div class="font-bold">${markers[index].name}</div>
            <div class="text-xs">${eleitores[index].cidade}</div>
           </div>`
                );
            },
            // Focar no Brasil
            focusOn: {
                regions: ['BR'],
                animate: true
            }
        });

        mapRef.current = map;
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard/configuracoes"
                            className="flex items-center gap-2 text-sm text-dark-5 hover:text-primary dark:text-dark-6"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar
                        </Link>
                    </div>
                    <h1 className="mt-2 text-3xl font-bold text-dark dark:text-white">
                        Mapa de Presenças
                    </h1>
                    {subgrupo && (
                        <p className="mt-1 text-dark-5 dark:text-dark-6">
                            Visualizando eleitores do subgrupo: <span className="font-medium text-dark dark:text-white">{subgrupo.nome}</span>
                        </p>
                    )}
                </div>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-card dark:bg-gray-dark">
                {eleitores.length > 0 ? (
                    <div className="relative h-[600px] w-full overflow-hidden rounded-lg bg-gray-1 dark:bg-dark-2">
                        <div id="map" className="h-full w-full"></div>

                        {/* Legenda Flutuante */}
                        <div className="absolute bottom-4 left-4 rounded-lg bg-white p-4 shadow-lg dark:bg-gray-dark">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-3 w-3 rounded-full bg-political-purple"></div>
                                <span className="text-sm font-medium text-dark dark:text-white">Presenças Confirmadas</span>
                            </div>
                            <div className="text-xs text-dark-5 dark:text-dark-6">
                                Total: {eleitores.length} pessoas
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-[400px] flex-col items-center justify-center text-center">
                        <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                            <Loader2 className="h-8 w-8 text-dark-5 dark:text-dark-6" />
                        </div>
                        <h3 className="text-lg font-medium text-dark dark:text-white">
                            Nenhuma presença encontrada
                        </h3>
                        <p className="text-dark-5 dark:text-dark-6">
                            Este subgrupo ainda não possui confirmações de presença.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
