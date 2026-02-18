#!/usr/bin/env node

/**
 * Script para gerar ícones PWA a partir do SVG base
 * Usa sharp para conversão SVG -> PNG
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function gerarIcones() {
  try {
    // Importação dinâmica do sharp (ESM)
    const sharp = (await import("sharp")).default;

    const svgPath = path.join(__dirname, "..", "public", "icon.svg");
    const publicDir = path.join(__dirname, "..", "public");

    if (!fs.existsSync(svgPath)) {
      console.error("❌ Arquivo icon.svg não encontrado em public/");
      process.exit(1);
    }

    const svgBuffer = fs.readFileSync(svgPath);

    // Tamanhos necessários para PWA e iOS
    const tamanhos = [
      { nome: "icon-192.png", tamanho: 192 },
      { nome: "icon-512.png", tamanho: 512 },
      { nome: "apple-icon-180.png", tamanho: 180 },
      { nome: "favicon.ico", tamanho: 32 }, // Favicon básico
    ];

    console.log("🎨 Gerando ícones PWA...\n");

    for (const { nome, tamanho } of tamanhos) {
      const outputPath = path.join(publicDir, nome);

      await sharp(svgBuffer)
        .resize(tamanho, tamanho)
        .png()
        .toFile(outputPath);

      console.log(`✅ ${nome} (${tamanho}x${tamanho})`);
    }

    console.log("\n✨ Todos os ícones foram gerados com sucesso!");
  } catch (erro) {
    if (erro.code === "ERR_MODULE_NOT_FOUND") {
      console.error("\n❌ Pacote 'sharp' não encontrado.");
      console.error("\n📦 Instale com: npm install --save-dev sharp\n");
      process.exit(1);
    }
    console.error("❌ Erro ao gerar ícones:", erro);
    process.exit(1);
  }
}

gerarIcones();
