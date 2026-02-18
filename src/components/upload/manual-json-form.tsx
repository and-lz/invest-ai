"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { XCircle, Loader2, ArrowLeft, Send, Circle } from "lucide-react";
import { useManualImport } from "@/hooks/use-manual-import";
import { ResultadoUpload } from "./upload-result";
import { tipografia } from "@/lib/design-system";

interface FormularioJsonManualProps {
  onImportacaoSucesso?: (identificador: string) => void;
  onVoltar: () => void;
}

export function FormularioJsonManual({ onImportacaoSucesso, onVoltar }: FormularioJsonManualProps) {
  const [conteudoJson, setConteudoJson] = useState("");
  const {
    submeterJson,
    resetar,
    statusImportacao,
    erroImportacao,
    estaValidando,
    segundosDecorridos,
  } = useManualImport();

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
          <ResultadoUpload
            tipo="sucesso"
            titulo="Importacao concluida!"
            mensagem="Dados do relatorio validados e salvos com sucesso."
            rotuloAcao="Importar outro relatorio"
            onAcao={handleNovaImportacao}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div>
          <h3 className={tipografia.h3}>Colar a resposta da IA</h3>
          <p className="text-muted-foreground text-sm">
            Cole abaixo o JSON que o chat de IA retornou apos processar seu relatorio.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="json-resposta">Resposta JSON</Label>
          <Textarea
            id="json-resposta"
            placeholder='Cole o JSON aqui... (deve comecar com { "metadados": ...)'
            value={conteudoJson}
            onChange={(evento) => setConteudoJson(evento.target.value)}
            className="min-h-64 font-mono text-sm"
            disabled={estaValidando}
          />
        </div>

        {estaValidando && (
          <div className="space-y-2 rounded-md border p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="text-primary h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Verificando formato JSON</span>
            </div>
            <div className="flex items-center gap-3">
              <Circle className="text-muted-foreground/40 h-4 w-4" />
              <span className="text-muted-foreground/60 text-sm">Validando estrutura de dados</span>
            </div>
            <div className="flex items-center gap-3">
              <Circle className="text-muted-foreground/40 h-4 w-4" />
              <span className="text-muted-foreground/60 text-sm">
                Salvando relatorio no sistema
              </span>
            </div>
            {segundosDecorridos > 0 && (
              <p className="text-muted-foreground mt-1 font-mono text-xs" aria-live="polite">
                Tempo decorrido: {segundosDecorridos}s
              </p>
            )}
          </div>
        )}

        {statusImportacao === "erro" && erroImportacao && (
          <div
            className="border-destructive/30 bg-destructive/5 flex items-start gap-2 rounded-md border p-3"
            role="alert"
          >
            <XCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
            <pre className="text-destructive text-xs whitespace-pre-wrap">{erroImportacao}</pre>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Button variant="outline" onClick={onVoltar} disabled={estaValidando}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao prompt
          </Button>

          <Button onClick={handleSubmeter} disabled={!conteudoJson.trim() || estaValidando}>
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
