"use client";

import { createClient, Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

const BRAND_GREEN = "#aecb41";
const WHATSAPP = "5587991008521";
const INSTAGRAM = "https://instagram.com/renewingsportwear";
const ADMIN_EMAIL = "admin@renewing.com";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

type Variant = {
  id?: string;
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
  product_variants: Variant[];
};

function formatPrice(value: number) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function uniqueColors(product: Product) {
  return [...new Set(product.product_variants.map((v) => v.color))];
}

function sizesForColor(product: Product, color: string) {
  return [
    ...new Set(
      product.product_variants
        .filter((v) => v.color === color)
        .map((v) => v.size)
    ),
  ];
}

function getVariant(product: Product, color: string, size: string) {
  return product.product_variants.find(
    (v) => v.color === color && v.size === size
  );
}

function totalStock(product: Product) {
  return product.product_variants.reduce((sum, v) => sum + Number(v.stock), 0);
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [selected, setSelected] = useState<Record<string, { color: string; size: string }>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [variants, setVariants] = useState<Variant[]>([
    { color: "", size: "", stock: 0 },
  ]);

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  async function loadProducts() {
    if (!supabase) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("id,name,price,image,description,product_variants(id,color,size,stock)")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setProducts((data || []) as Product[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!supabase) {
      setMessage("Supabase não configurado. Verifique as variáveis na Vercel.");
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    loadProducts();

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const selectionMap = useMemo(() => {
    const next = { ...selected };

    products.forEach((product) => {
      const colors = uniqueColors(product);
      const firstColor = colors[0] || "";
      const currentColor = next[product.id]?.color || firstColor;
      const sizes = sizesForColor(product, currentColor);
      const firstSize = sizes[0] || "";
      const currentSize = next[product.id]?.size || firstSize;

      next[product.id] = {
        color: currentColor,
        size: currentSize,
      };
    });

    return next;
  }, [products, selected]);

  function changeColor(product: Product, color: string) {
    const firstSize = sizesForColor(product, color)[0] || "";

    setSelected((current) => ({
      ...current,
      [product.id]: {
        color,
        size: firstSize,
      },
    }));
  }

  function changeSize(product: Product, size: string) {
    setSelected((current) => ({
      ...current,
      [product.id]: {
        ...current[product.id],
        size,
      },
    }));
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();

    if (!supabase) return;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Login realizado com sucesso.");
      setPassword("");
    }
  }

  async function logout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setMessage("Você saiu do painel.");
  }

  function updateVariant(index: number, field: keyof Variant, value: string) {
    setVariants((current) =>
      current.map((variant, i) =>
        i === index
          ? {
              ...variant,
              [field]: field === "stock" ? Number(value) : value,
            }
          : variant
      )
    );
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();

    if (!supabase || !isAdmin) return;

    const cleanVariants = variants.filter(
      (v) => v.color.trim() && v.size.trim()
    );

    if (!name || !price || !image || !description || cleanVariants.length === 0) {
      setMessage("Preencha todos os campos e pelo menos uma variação.");
      return;
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name,
        price: Number(price),
        image,
        description,
      })
      .select("id")
      .single();

    if (error || !product) {
      setMessage(error?.message || "Erro ao salvar produto.");
      return;
    }

    const { error: variantsError } = await supabase
      .from("product_variants")
      .insert(
        cleanVariants.map((v) => ({
          product_id: product.id,
          color: v.color,
          size: v.size,
          stock: Number(v.stock),
        }))
      );

    if (variantsError) {
      setMessage(variantsError.message);
      return;
    }

    setName("");
    setPrice("");
    setImage("");
    setDescription("");
    setVariants([{ color: "", size: "", stock: 0 }]);
    setMessage("Produto cadastrado com sucesso.");
    loadProducts();
  }

  async function deleteProduct(id: string) {
    if (!supabase || !isAdmin) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Produto excluído.");
      loadProducts();
    }
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
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
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
            </p>
          </div>

          <div className="rounded-[2rem] bg-zinc-950 p-6 shadow-2xl">
            <div className="overflow-hidden rounded-[1.5rem] bg-white">
              <img
                src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"
                alt="Moda esportiva"
                className="h-[420px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
          Catálogo
        </p>
        <h2 className="mb-10 text-4xl font-black">Peças disponíveis</h2>

        {loading && <p>Carregando produtos...</p>}

        <div className="grid gap-8 md:grid-cols-3">
          {products.map((product) => {
            const selection = selectionMap[product.id];
            const colors = uniqueColors(product);
            const sizes = sizesForColor(product, selection?.color || "");
            const variant = getVariant(
              product,
              selection?.color || "",
              selection?.size || ""
            );
            const stock = variant?.stock || 0;

            const whatsappMessage = encodeURIComponent(
              `Olá! Quero comprar ${product.name}. Cor: ${selection?.color}. Tamanho: ${selection?.size}.`
            );

            return (
              <div
                key={product.id}
                className="overflow-hidden rounded-[2rem] border bg-white shadow-sm"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-80 w-full object-cover"
                />

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

                  <label className="mb-2 block text-sm font-semibold">
                    Cor
                  </label>
                  <select
                    value={selection?.color || ""}
                    onChange={(e) => changeColor(product, e.target.value)}
                    className="mb-4 h-11 w-full rounded-2xl border px-4"
                  >
                    {colors.map((color) => (
                      <option key={color}>{color}</option>
                    ))}
                  </select>

                  <label className="mb-2 block text-sm font-semibold">
                    Tamanho
                  </label>
                  <select
                    value={selection?.size || ""}
                    onChange={(e) => changeSize(product, e.target.value)}
                    className="mb-4 h-11 w-full rounded-2xl border px-4"
                  >
                    {sizes.map((size) => (
                      <option key={size}>{size}</option>
                    ))}
                  </select>

                  <p className="mb-4 rounded-2xl bg-zinc-50 p-4 text-sm">
                    <strong>Disponível:</strong> {stock} unidade(s)
                  </p>

                  {stock > 0 ? (
                    <a
                      href={`https://wa.me/${WHATSAPP}?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <button className="h-11 w-full rounded-2xl bg-zinc-950 text-white">
                        Comprar pelo WhatsApp
                      </button>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="h-11 w-full rounded-2xl bg-zinc-200 text-zinc-500"
                    >
                      Indisponível
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-zinc-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-black">Painel administrador</h2>

          {message && <p className="mt-4 text-sm text-yellow-300">{message}</p>}

          {!isAdmin ? (
            <form onSubmit={login} className="mt-8 max-w-md space-y-4">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-2xl px-4 text-black"
                placeholder="E-mail"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="h-12 w-full rounded-2xl px-4 text-black"
                placeholder="Senha"
              />
              <button className="h-12 w-full rounded-2xl bg-white text-black font-bold">
                Entrar
              </button>
            </form>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <form onSubmit={addProduct} className="space-y-4 rounded-[2rem] bg-white p-6 text-black">
                <h3 className="text-2xl font-black">Adicionar produto</h3>

                <input value={name} onChange={(e) => setName(e.target.value)} className="h-12 w-full rounded-2xl border px-4" placeholder="Nome do produto" />
                <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" className="h-12 w-full rounded-2xl border px-4" placeholder="Preço" />
                <input value={image} onChange={(e) => setImage(e.target.value)} className="h-12 w-full rounded-2xl border px-4" placeholder="URL da imagem" />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-2xl border px-4 py-3" placeholder="Descrição" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold">Variações</p>
                    <button
                      type="button"
                      onClick={() =>
                        setVariants((v) => [
                          ...v,
                          { color: "", size: "", stock: 0 },
                        ])
                      }
                      className="rounded-2xl border px-4 py-2 text-sm"
                    >
                      Adicionar
                    </button>
                  </div>

                  {variants.map((variant, index) => (
                    <div key={index} className="grid gap-3 md:grid-cols-3">
                      <input value={variant.color} onChange={(e) => updateVariant(index, "color", e.target.value)} className="h-11 rounded-2xl border px-4" placeholder="Cor" />
                      <input value={variant.size} onChange={(e) => updateVariant(index, "size", e.target.value)} className="h-11 rounded-2xl border px-4" placeholder="Tamanho" />
                      <input value={variant.stock} onChange={(e) => updateVariant(index, "stock", e.target.value)} type="number" className="h-11 rounded-2xl border px-4" placeholder="Estoque" />
                    </div>
                  ))}
                </div>

                <button className="h-12 w-full rounded-2xl bg-zinc-950 text-white">
                  Salvar produto
                </button>
              </form>

              <div className="rounded-[2rem] bg-white p-6 text-black">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-2xl font-black">Produtos</h3>
                  <button onClick={logout} className="rounded-2xl border px-4 py-2">
                    Sair
                  </button>
                </div>

                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="rounded-2xl border p-4">
                      <p className="font-black">{product.name}</p>
                      <p className="text-sm text-zinc-600">
                        {formatPrice(product.price)} • {totalStock(product)} em estoque
                      </p>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="mt-3 rounded-2xl border px-4 py-2 text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t px-6 py-8 text-center text-sm text-zinc-500">
        © 2026 Renewing Sportwear. Todos os direitos reservados.
      </footer>
    </main>
  );
}