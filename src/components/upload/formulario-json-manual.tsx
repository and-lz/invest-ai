"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Send,
} from "lucide-react";
import { useImportacaoManual } from "@/hooks/use-importacao-manual";

interface FormularioJsonManualProps {
  onImportacaoSucesso?: (identificador: string) => void;
  onVoltar: () => void;
}

export function FormularioJsonManual({
  onImportacaoSucesso,
  onVoltar,
}: FormularioJsonManualProps) {
  const [conteudoJson, setConteudoJson] = useState("");
  const {
    submeterJson,
    resetar,
    statusImportacao,
    erroImportacao,
    estaValidando,
  } = useImportacaoManual();

  const handleSubmeter = useCallback(async () => {
    const resultado = await submeterJson(conteudoJson);
    if (resultado.sucesso && resultado.metadados) {
      onImportacaoSucesso?.(resultado.metadados.identificador);
    }
  }, [conteudoJson, submeterJson, onImportacaoSucesso]);

  const handleNovaImportacao = useCallback(() => {
    resetar();
    setConteudoJson("");
  }, [resetar]);

  if (statusImportacao === "sucesso") {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">
                Importacao concluida!
              </h3>
              <p className="text-sm text-muted-foreground">
                Dados do relatorio validados e salvos com sucesso.
              </p>
            </div>
            <Button variant="outline" onClick={handleNovaImportacao}>
              Importar outro relatorio
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div>
          <h3 className="text-lg font-semibold">
            Passo 2: Colar a resposta do Claude
          </h3>
          <p className="text-sm text-muted-foreground">
            Cole abaixo o JSON que o Claude Chat retornou apos processar seu
            relatorio.
          </p>
        </div>

        <Textarea
          placeholder='Cole o JSON aqui... (deve comecar com { "metadados": ...)'
          value={conteudoJson}
          onChange={(evento) => setConteudoJson(evento.target.value)}
          className="min-h-64 font-mono text-xs"
          disabled={estaValidando}
        />

        {statusImportacao === "erro" && erroImportacao && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <pre className="whitespace-pre-wrap text-xs text-red-700">
              {erroImportacao}
            </pre>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onVoltar} disabled={estaValidando}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao prompt
          </Button>

          <Button
            onClick={handleSubmeter}
            disabled={!conteudoJson.trim() || estaValidando}
          >
            {estaValidando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Validar e salvar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
