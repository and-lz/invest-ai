/**
 * Tipos completos para @neslinesli93/qpdf-wasm.
 * O pacote original fornece tipos incompletos (faltam writeFile, unlink,
 * e opcoes alem de locateFile). Este arquivo substitui os tipos via paths no tsconfig.
 */
declare module "@neslinesli93/qpdf-wasm" {
  interface EmscriptenFS {
    writeFile(caminho: string, dados: Uint8Array | string): void;
    readFile(caminho: string): Uint8Array;
    unlink(caminho: string): void;
    mkdir(caminho: string): void;
    mount(
      tipo: QpdfInstance["WORKERFS"],
      opcoes: { blobs: { name: string; data: Blob }[] },
      pontoMontagem: string,
    ): void;
    unmount(pontoMontagem: string): void;
  }

  interface QpdfInstance {
    callMain: (argumentos: string[]) => number;
    FS: EmscriptenFS;
    WORKERFS: unknown;
  }

  interface OpcoesModuloQpdf {
    noInitialRun?: boolean;
    locateFile?: (caminho: string) => string;
    print?: (texto: string) => void;
    printErr?: (texto: string) => void;
    preRun?: ((modulo: QpdfInstance) => void)[];
  }

  type CriarModuloQpdf = (opcoes?: OpcoesModuloQpdf) => Promise<QpdfInstance>;

  const criarModulo: CriarModuloQpdf;
  export default criarModulo;
  export type { QpdfInstance, EmscriptenFS, OpcoesModuloQpdf };
}
