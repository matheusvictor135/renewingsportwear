"use client";

import React, { useState } from "react";

const BRAND_GREEN = "#aecb41";
const WHATSAPP_NUMBER = "5587991008521";
const INSTAGRAM_URL = "https://instagram.com/renewingsportwear";

type Variant = {
  color: string;
  size: string;
  stock: number;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  variants: Variant[];
};

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Camiseta Performance",
    price: 99.9,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    description: "Leve, esportiva e pronta para o movimento.",
    variants: [
      { color: "Verde", size: "P", stock: 4 },
      { color: "Verde", size: "M", stock: 5 },
      { color: "Branco", size: "G", stock: 3 },
      { color: "Preto", size: "M", stock: 6 },
    ],
  },
  {
    id: "2",
    name: "Short Training Elite",
    price: 119.9,
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
    description: "Mobilidade, conforto e visual premium.",
    variants: [
      { color: "Preto", size: "M", stock: 3 },
      { color: "Preto", size: "G", stock: 2 },
      { color: "Cinza", size: "GG", stock: 5 },
    ],
  },
  {
    id: "3",
    name: "Conjunto Active Pro",
    price: 189.9,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    description: "Visual forte para quem vive em movimento.",
    variants: [
      { color: "Verde", size: "P", stock: 2 },
      { color: "Verde", size: "M", stock: 2 },
      { color: "Off-white", size: "G", stock: 1 },
      { color: "Off-white", size: "GG", stock: 1 },
    ],
  },
];

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function uniqueColors(product: Product) {
  return [...new Set(product.variants.map((v) => v.color))];
}

function sizesForColor(product: Product, color: string) {
  return [
    ...new Set(
      product.variants.filter((v) => v.color === color).map((v) => v.size)
    ),
  ];
}

function getVariant(product: Product, color: string, size: string) {
  return product.variants.find((v) => v.color === color && v.size === size);
}

export default function Home() {
  const [selected, setSelected] = useState<Record<string, { color: string; size: string }>>({});

  function getSelection(product: Product) {
    const firstColor = uniqueColors(product)[0];
    const firstSize = sizesForColor(product, firstColor)[0];

    return selected[product.id] || {
      color: firstColor,
      size: firstSize,
    };
  }

  function changeColor(product: Product, color: string) {
    const firstSize = sizesForColor(product, color)[0];

    setSelected((current) => ({
      ...current,
      [product.id]: {
        color,
        size: firstSize,
      },
    }));
  }

  function changeSize(product: Product, size: string) {
    const current = getSelection(product);

    setSelected((old) => ({
      ...old,
      [product.id]: {
        ...current,
        size,
      },
    }));
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl font-black text-white"
              style={{ background: BRAND_GREEN }}
            >
              R
            </div>
            <div>
              <p className="text-lg font-black">Renewing Sportwear</p>
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                Premium Sportswear
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              "Olá! Quero comprar na Renewing Sportwear."
            )}`}
            target="_blank"
          >
            <button className="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">
              Comprar agora
            </button>
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${BRAND_GREEN}, #d8ea88, #ffffff)`,
          }}
        />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-24 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em]">
              Lançamento oficial
            </p>

            <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">
              Essencialmente para quem vive em movimento.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-700">
              Performance, estilo e identidade em peças esportivas premium.
              A Renewing Sportwear nasceu para quem vive o esporte com atitude.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  "Olá! Quero ver o catálogo da Renewing Sportwear."
                )}`}
                target="_blank"
              >
                <button className="h-12 rounded-2xl bg-zinc-950 px-6 text-white">
                  Comprar pelo WhatsApp
                </button>
              </a>

              <a href={INSTAGRAM_URL} target="_blank">
                <button className="h-12 rounded-2xl border border-zinc-300 bg-white px-6">
                  Ver Instagram
                </button>
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] bg-zinc-950 p-6 shadow-2xl">
            <div className="overflow-hidden rounded-[1.5rem] bg-white">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-500">Nova coleção</p>
                  <p className="text-xl font-black">Renewing Sportwear</p>
                </div>

                <span
                  className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{ background: BRAND_GREEN }}
                >
                  Premium Drop
                </span>
              </div>

              <img
                src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"
                alt="Moda esportiva premium"
                className="h-[420px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
            Catálogo
          </p>
          <h2 className="text-4xl font-black">Peças para vender agora</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {PRODUCTS.map((product) => {
            const selection = getSelection(product);
            const colors = uniqueColors(product);
            const sizes = sizesForColor(product, selection.color);
            const variant = getVariant(product, selection.color, selection.size);
            const stock = variant?.stock || 0;

            const message = encodeURIComponent(
              `Olá! Quero comprar ${product.name}. Cor: ${selection.color}. Tamanho: ${selection.size}.`
            );

            return (
              <div
                key={product.id}
                className="overflow-hidden rounded-[2rem] border bg-white shadow-sm"
              >
                <div className="aspect-[4/5] overflow-hidden bg-zinc-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black">{product.name}</h3>
                      <p className="mt-2 text-sm text-zinc-600">
                        {product.description}
                      </p>
                    </div>

                    <span
                      className="rounded-full px-3 py-1 text-sm font-bold"
                      style={{ background: BRAND_GREEN }}
                    >
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Selecione a cor
                      </label>
                      <select
                        value={selection.color}
                        onChange={(e) => changeColor(product, e.target.value)}
                        className="h-11 w-full rounded-2xl border px-4"
                      >
                        {colors.map((color) => (
                          <option key={color}>{color}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Selecione o tamanho
                      </label>
                      <select
                        value={selection.size}
                        onChange={(e) => changeSize(product, e.target.value)}
                        className="h-11 w-full rounded-2xl border px-4"
                      >
                        {sizes.map((size) => (
                          <option key={size}>{size}</option>
                        ))}
                      </select>
                    </div>

                    <div className="rounded-2xl bg-zinc-50 p-4 text-sm">
                      <p>
                        <strong>Disponível:</strong> {stock} unidade(s)
                      </p>
                    </div>
                  </div>

                  {stock > 0 ? (
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
                      target="_blank"
                    >
                      <button className="mt-4 h-11 w-full rounded-2xl bg-zinc-950 text-white">
                        Comprar pelo WhatsApp
                      </button>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="mt-4 h-11 w-full rounded-2xl bg-zinc-200 text-zinc-500"
                    >
                      Opção indisponível
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-zinc-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-20 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white/5 p-8">
            <h3 className="text-2xl font-black">Compra rápida</h3>
            <p className="mt-3 text-sm text-zinc-300">
              Atendimento direto pelo WhatsApp.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white/5 p-8">
            <h3 className="text-2xl font-black">Estilo premium</h3>
            <p className="mt-3 text-sm text-zinc-300">
              Visual forte, esportivo e moderno.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white/5 p-8">
            <h3 className="text-2xl font-black">Pronto para vender</h3>
            <p className="mt-3 text-sm text-zinc-300">
              Cliente escolhe cor e tamanho antes de comprar.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[2rem] border bg-zinc-50 p-8 md:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
            Contato
          </p>

          <h2 className="mt-3 text-4xl font-black">
            Fale com a Renewing Sportwear
          </h2>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                "Olá! Quero comprar na Renewing Sportwear."
              )}`}
              target="_blank"
            >
              <button className="rounded-2xl bg-zinc-950 px-6 py-4 text-white">
                WhatsApp: (87) 99100-8521
              </button>
            </a>

            <a href={INSTAGRAM_URL} target="_blank">
              <button className="rounded-2xl border bg-white px-6 py-4">
                Instagram: @renewingsportwear
              </button>
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t px-6 py-8 text-center text-sm text-zinc-500">
        © 2026 Renewing Sportwear. Todos os direitos reservados.
      </footer>
    </main>
  );
}