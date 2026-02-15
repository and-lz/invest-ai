"use client";

import { useState, useMemo } from "react";
import { BookMarked, Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TODOS_TERMOS,
  buscarTermos,
  agruparPorCategoria,
  ESTATISTICAS_GLOSSARIO,
  NOMES_CATEGORIAS,
} from "@/lib/glossario-navegavel";

export default function GlossarioPage() {
  const [query, setQuery] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);

  const termosFiltrados = useMemo(() => buscarTermos(query), [query]);

  const termosPorCategoria = useMemo(() => agruparPorCategoria(), []);

  const termosMostrados = useMemo(() => {
    if (categoriaAtiva) {
      const termosCategoria = termosPorCategoria.get(categoriaAtiva) ?? [];
      return query ? termosCategoria.filter((t) => termosFiltrados.includes(t)) : termosCategoria;
    }
    return termosFiltrados;
  }, [categoriaAtiva, termosFiltrados, termosPorCategoria, query]);

  const categorias = Array.from(termosPorCategoria.keys());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookMarked className="text-muted-foreground h-6 w-6" aria-hidden="true" />
        <Header titulo="Glossário Financeiro" descricao="Todos os termos explicados de forma simples" />
      </div>

      {/* Estatísticas */}
      <div className="bg-muted/50 flex items-center gap-2 rounded-lg px-6 py-3">
        <span className="text-sm">
          <strong className="font-semibold">{ESTATISTICAS_GLOSSARIO.totalTermos}</strong> termos disponíveis
        </span>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por termo ou explicação..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros por Categoria */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={categoriaAtiva === null ? "default" : "outline"}
          size="sm"
          onClick={() => setCategoriaAtiva(null)}
        >
          Todas
        </Button>

        {categorias.map((categoria) => (
          <Button
            key={categoria}
            variant={categoriaAtiva === categoria ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoriaAtiva(categoria)}
          >
            {NOMES_CATEGORIAS[categoria] ?? categoria}
          </Button>
        ))}
      </div>

      {/* Contagem de Resultados */}
      <p className="text-muted-foreground text-sm">
        {termosMostrados.length === TODOS_TERMOS.length
          ? "Mostrando todos os termos"
          : `${termosMostrados.length} ${termosMostrados.length === 1 ? "termo encontrado" : "termos encontrados"}`}
      </p>

      {/* Grid de Termos */}
      {termosMostrados.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookMarked className="text-muted-foreground mb-4 h-12 w-12" aria-hidden="true" />
            <p className="text-muted-foreground text-center">
              Nenhum termo encontrado para &quot;{query}&quot;
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {termosMostrados.map((termo) => (
            <Card key={termo.slug} id={termo.slug} className="scroll-mt-20">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{termo.termo}</CardTitle>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {NOMES_CATEGORIAS[termo.categoria]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">{termo.explicacao}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
