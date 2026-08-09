import { mkdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";

import {
  ProviderLogo,
  type Provider,
} from "../packages/provider-icons/src/index";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

const root = resolve(import.meta.dirname, "..");
const assets = join(root, "apps/extension/store-assets");
const promo = join(assets, "promo");
const icon = join(assets, "icon");
const website = join(root, "apps/web/public");

function nestedProviderLogo(
  provider: Provider,
  x: number,
  y: number,
  size: number,
): string {
  return renderToStaticMarkup(
    <ProviderLogo provider={provider} size={size} title={provider} />,
  ).replace("<svg", `<svg x="${x}" y="${y}"`);
}

function brandMark(x: number, y: number, size: number): string {
  const radius = Math.round(size * 0.24);
  return `<g transform="translate(${x} ${y}) scale(${size / 512})">
    <rect width="512" height="512" rx="${radius / (size / 512)}" fill="#0b0b0c"/>
    <path d="M142 166h102v42h-60v96h60v42H142V166Zm228 0v180H268v-42h60v-96h-60v-42h102Z" fill="#fff"/>
  </g>`;
}

function smallPromo(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="280" viewBox="0 0 440 280">
    <rect width="440" height="280" fill="#f7f7f8"/>
    <rect x="14" y="14" width="412" height="252" rx="20" fill="#fff" stroke="#dedee3"/>
    ${brandMark(36, 34, 44)}
    <text x="94" y="63" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="18" font-weight="700">Open Queries</text>
    <text x="36" y="133" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="32" font-weight="700" letter-spacing="-1.5">See the queries behind</text>
    <text x="36" y="170" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="32" font-weight="700" letter-spacing="-1.5">AI search.</text>
    <g transform="translate(36 204)">
      <rect width="44" height="34" rx="9" fill="#fff" stroke="#dedee3"/>
      ${nestedProviderLogo("chatgpt", 13, 8, 18)}
    </g>
    <g transform="translate(90 204)">
      <rect width="44" height="34" rx="9" fill="#fff" stroke="#dedee3"/>
      ${nestedProviderLogo("claude", 13, 8, 18)}
    </g>
    <g transform="translate(144 204)">
      <rect width="44" height="34" rx="9" fill="#fff" stroke="#dedee3"/>
      ${nestedProviderLogo("google", 13, 8, 18)}
    </g>
    <text x="210" y="226" fill="#6e6e76" font-family="Arial, sans-serif" font-size="12">Local side panel · Open source</text>
  </svg>`;
}

function marqueePromo(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="560" viewBox="0 0 1400 560">
    <rect width="1400" height="560" fill="#efeff2"/>
    <rect x="34" y="34" width="1332" height="492" rx="28" fill="#fff" stroke="#d9d9df"/>
    ${brandMark(84, 80, 64)}
    <text x="168" y="121" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="26" font-weight="700">Open Queries</text>
    <text x="84" y="260" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="68" font-weight="700" letter-spacing="-3">See the queries behind</text>
    <text x="84" y="334" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="68" font-weight="700" letter-spacing="-3">AI search.</text>
    <text x="84" y="392" fill="#686871" font-family="Arial, sans-serif" font-size="22">Observed web searches and likely fan-outs—kept rigorously separate.</text>
    <rect x="84" y="435" width="247" height="48" rx="10" fill="#0b0b0c"/>
    <text x="207.5" y="466" fill="#fff" font-family="Arial, sans-serif" font-size="14" font-weight="700" text-anchor="middle">Make AI search transparent</text>

    <g transform="translate(910 76)">
      <rect width="392" height="408" rx="18" fill="#fff" stroke="#d9d9df"/>
      <rect width="392" height="62" rx="18" fill="#fff"/>
      <path d="M0 62h392" stroke="#e1e1e5"/>
      ${brandMark(20, 17, 28)}
      <text x="60" y="37" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="14" font-weight="700">Open Queries</text>
      <circle cx="354" cy="31" r="4" fill="#b7b7bd"/>
      <text x="366" y="35" fill="#777780" font-family="Arial, sans-serif" font-size="9">Local</text>
      <text x="20" y="100" fill="#5b4de8" font-family="monospace" font-size="9" font-weight="700" letter-spacing="1">LIVE QUERY TRACE</text>
      <text x="20" y="130" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="22" font-weight="700">What the model searched</text>
      <g transform="translate(20 154)">
        <rect width="352" height="62" rx="10" fill="#fff" stroke="#e1e1e5"/>
        ${nestedProviderLogo("chatgpt", 15, 14, 17)}
        <text x="44" y="27" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="11" font-weight="700">ChatGPT</text>
        <text x="15" y="49" fill="#55555d" font-family="Arial, sans-serif" font-size="10">open source product analytics tools</text>
      </g>
      <g transform="translate(20 228)">
        <rect width="352" height="62" rx="10" fill="#fff" stroke="#e1e1e5"/>
        ${nestedProviderLogo("claude", 15, 14, 17)}
        <text x="44" y="27" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="11" font-weight="700">Claude</text>
        <text x="15" y="49" fill="#55555d" font-family="Arial, sans-serif" font-size="10">privacy focused analytics comparison</text>
      </g>
      <g transform="translate(20 302)">
        <rect width="352" height="62" rx="10" fill="#fff" stroke="#e1e1e5"/>
        ${nestedProviderLogo("google", 15, 14, 17)}
        <text x="44" y="27" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="11" font-weight="700">Google AI Overviews</text>
        <text x="15" y="49" fill="#55555d" font-family="Arial, sans-serif" font-size="10">best open source analytics platforms</text>
      </g>
      <text x="20" y="390" fill="#777780" font-family="Arial, sans-serif" font-size="9">Queries, not conversations · Provider-native evidence</text>
    </g>
  </svg>`;
}

function websiteSocial(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#efeff2"/>
    <rect x="34" y="34" width="1132" height="562" rx="28" fill="#fff" stroke="#d9d9df"/>
    ${brandMark(78, 76, 58)}
    <text x="154" y="113" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="24" font-weight="700">Open Queries</text>
    <text x="78" y="262" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="64" font-weight="700" letter-spacing="-3">See the queries behind</text>
    <text x="78" y="334" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="64" font-weight="700" letter-spacing="-3">AI search.</text>
    <text x="78" y="390" fill="#686871" font-family="Arial, sans-serif" font-size="21">Open-source query transparency for ChatGPT, Claude</text>
    <text x="78" y="420" fill="#686871" font-family="Arial, sans-serif" font-size="21">and Google AI Overviews.</text>
    <g transform="translate(78 466)">
      <rect width="52" height="44" rx="11" fill="#fff" stroke="#dedee3"/>
      ${nestedProviderLogo("chatgpt", 15, 11, 22)}
    </g>
    <g transform="translate(142 466)">
      <rect width="52" height="44" rx="11" fill="#fff" stroke="#dedee3"/>
      ${nestedProviderLogo("claude", 15, 11, 22)}
    </g>
    <g transform="translate(206 466)">
      <rect width="52" height="44" rx="11" fill="#fff" stroke="#dedee3"/>
      ${nestedProviderLogo("google", 15, 11, 22)}
    </g>
    <text x="282" y="494" fill="#5b4de8" font-family="monospace" font-size="13" font-weight="700" letter-spacing="1">OPENQUERIES.ORG</text>
    <g transform="translate(840 120)">
      <rect width="276" height="390" rx="18" fill="#fff" stroke="#d9d9df"/>
      <path d="M0 58h276" stroke="#e1e1e5"/>
      ${brandMark(18, 15, 28)}
      <text x="58" y="35" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="13" font-weight="700">Open Queries</text>
      <text x="18" y="92" fill="#5b4de8" font-family="monospace" font-size="8" font-weight="700" letter-spacing="1">LIVE QUERY TRACE</text>
      <text x="18" y="121" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="20" font-weight="700">What the model searched</text>
      <g transform="translate(18 146)">
        <rect width="240" height="58" rx="9" fill="#fff" stroke="#e1e1e5"/>
        ${nestedProviderLogo("chatgpt", 13, 12, 16)}
        <text x="40" y="25" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="10" font-weight="700">ChatGPT</text>
        <text x="13" y="45" fill="#66666f" font-family="Arial, sans-serif" font-size="9">open source analytics tools</text>
      </g>
      <g transform="translate(18 216)">
        <rect width="240" height="58" rx="9" fill="#fff" stroke="#e1e1e5"/>
        ${nestedProviderLogo("claude", 13, 12, 16)}
        <text x="40" y="25" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="10" font-weight="700">Claude</text>
        <text x="13" y="45" fill="#66666f" font-family="Arial, sans-serif" font-size="9">privacy analytics comparison</text>
      </g>
      <g transform="translate(18 286)">
        <rect width="240" height="58" rx="9" fill="#fff" stroke="#e1e1e5"/>
        ${nestedProviderLogo("google", 13, 12, 16)}
        <text x="40" y="25" fill="#0b0b0c" font-family="Arial, sans-serif" font-size="10" font-weight="700">Google AI Overviews</text>
        <text x="13" y="45" fill="#66666f" font-family="Arial, sans-serif" font-size="9">best open source analytics</text>
      </g>
      <text x="18" y="372" fill="#777780" font-family="Arial, sans-serif" font-size="8">Queries, not conversations</text>
    </g>
  </svg>`;
}

async function main() {
  await Promise.all([
    mkdir(promo, { recursive: true }),
    mkdir(icon, { recursive: true }),
  ]);
  await Promise.all([
    sharp(Buffer.from(smallPromo()))
      .png()
      .toFile(join(promo, "small-promo-440x280.png")),
    sharp(Buffer.from(marqueePromo()))
      .png()
      .toFile(join(promo, "marquee-1400x560.png")),
    sharp(Buffer.from(websiteSocial())).png().toFile(join(website, "og.png")),
  ]);
  const extensionIcon = await readFile(
    join(root, "apps/extension/assets/icon.svg"),
  );
  await sharp(extensionIcon)
    .resize(128, 128)
    .png()
    .toFile(join(icon, "store-icon-128.png"));
}

void main();
