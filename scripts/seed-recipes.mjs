import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const recipes = [
  // CERVEJA - 15 receitas
  {
    name: "Pilsen Clássica",
    slug: "pilsen-classica",
    category: "CERVEJA",
    difficulty: "CLASSICO",
    description: "A cerveja mais popular do Brasil. Leve, refrescante e perfeita para começar.",
    rajado: {
      ingredientes: ["1kg Pilsen", "10g Lúpulo Saaz (60min)", "Fermento de pão"],
      passos: ["Mostura 66°C por 60min", "Ferva 60min com lúpulo", "Resfrie e fermente 7 dias"],
      tempo: "14 dias"
    },
    classico: {
      ingredientes: ["2kg Pilsen", "US-05 (1 sachê)", "15g Saaz (60min)", "10g Saaz (5min)"],
      passos: ["Mostura 66°C por 60min", "Ferva 60min", "Pitch US-05", "Fermente 18-20°C por 7 dias"],
      tempo: "21 dias"
    },
    mestre: {
      ingredientes: ["2.5kg Pilsen", "US-05 + Saaz Hallertau", "Controle de temperatura preciso"],
      passos: ["Mostura 65°C → OG 1.050", "Ferva 90min", "Pitch US-05", "Envelhece 3 meses"],
      tempo: "3 meses"
    },
    macete: "Use água filtrada. Pilsen é sensível à qualidade da água. Se tiver cloro, deixe descansar 24h.",
    xp: 50,
    warnings: []
  },
  {
    name: "IPA do Bro",
    slug: "ipa-do-bro",
    category: "CERVEJA",
    difficulty: "CLASSICO",
    description: "IPA americana com dry-hop generoso. Amargo e aromático.",
    rajado: {
      ingredientes: ["1.5kg Pilsen", "15g Cascade (60min)", "20g Cascade (5min)"],
      passos: ["Mostura 66°C por 60min", "Ferva 60min com lúpulo", "Fermenta com fermento de pão"],
      tempo: "14 dias"
    },
    classico: {
      ingredientes: ["2kg Pilsen", "US-05", "10g Cascade (60min)", "15g Cascade (15min)", "25g Cascade (flameout)", "30g Cascade (dry-hop)"],
      passos: ["Mostura 66°C", "Ferva 60min", "Pitch US-05", "Dry-hop dia 7", "Garrafa com 5g/L açúcar"],
      tempo: "21 dias"
    },
    mestre: {
      ingredientes: ["2.5kg Pilsen", "US-05 + Brettanomyces", "100% Cascade (schedule complexo)"],
      passos: ["Mostura 64°C → OG 1.080", "Ferva 90min", "Pitch US-05", "Dia 10: adicione Brett", "Envelhece 6 meses"],
      tempo: "6 meses"
    },
    macete: "Usa garrafa PET pro dry-hop. Abre todo dia pra 'burpear' e evitar bomba. Cerveja com gás demais = garrafa explodindo na cara.",
    xp: 75,
    warnings: []
  },
  {
    name: "Stout Cremosa",
    slug: "stout-cremosa",
    category: "CERVEJA",
    difficulty: "CLASSICO",
    description: "Escura, cremosa e com notas de chocolate. Perfeita para noites frias.",
    rajado: {
      ingredientes: ["1.5kg Pilsen", "300g Malte Escuro", "10g Lúpulo Amargo"],
      passos: ["Mostura 66°C por 60min", "Ferva 60min", "Fermente 7 dias"],
      tempo: "14 dias"
    },
    classico: {
      ingredientes: ["2kg Pilsen", "400g Malte Escuro", "US-05", "15g Fuggle (60min)"],
      passos: ["Mostura 66°C", "Ferva 60min", "Pitch US-05", "Fermente 18-20°C por 10 dias"],
      tempo: "24 dias"
    },
    mestre: {
      ingredientes: ["2.5kg Pilsen", "500g Malte Escuro", "100g Chocolate Malt", "US-05 + Lactobacillus"],
      passos: ["Mostura 64°C → OG 1.070", "Ferva 90min", "Pitch US-05", "Dia 5: Lactobacillus", "Envelhece 4 meses"],
      tempo: "4 meses"
    },
    macete: "Malte escuro pode deixar amargo. Use pouco. O segredo é o equilíbrio entre amargo e doçura.",
    xp: 75,
    warnings: []
  },
  {
    name: "Hazy IPA",
    slug: "hazy-ipa",
    category: "CERVEJA",
    difficulty: "MESTRE",
    description: "IPA turva com aroma frutado. Tendência atual do mercado craft.",
    rajado: {
      ingredientes: ["1.5kg Pilsen", "Lúpulo Citra (flameout)", "Fermento de pão"],
      passos: ["Mostura 66°C", "Ferva 60min", "Adicione lúpulo no final", "Fermente 7 dias"],
      tempo: "14 dias"
    },
    classico: {
      ingredientes: ["2kg Pilsen", "US-05", "20g Citra (flameout)", "30g Citra (dry-hop dia 1)", "30g Citra (dry-hop dia 5)"],
      passos: ["Mostura 66°C", "Ferva 60min", "Pitch US-05", "Dry-hop 2x", "Garrafa com 5g/L açúcar"],
      tempo: "21 dias"
    },
    mestre: {
      ingredientes: ["2.5kg Pilsen", "US-05 + Kveik", "Citra + Mosaic + Amarillo", "Dry-hop schedule complexo"],
      passos: ["Mostura 66°C → OG 1.065", "Ferva 60min", "Pitch US-05 + Kveik", "Dry-hop 3x", "Envelhece 2 meses"],
      tempo: "2 meses"
    },
    macete: "A turbidez vem da proteína do lúpulo. Não clarifique! Beba fresca (até 30 dias).",
    xp: 100,
    warnings: []
  },
  {
    name: "Weizen (Cerveja de Trigo)",
    slug: "weizen",
    category: "CERVEJA",
    difficulty: "CLASSICO",
    description: "Cerveja alemã com 50% trigo. Banana e cravo naturais.",
    rajado: {
      ingredientes: ["1kg Pilsen", "500g Trigo", "Fermento de pão"],
      passos: ["Mostura 66°C", "Ferva 60min", "Fermente 7 dias"],
      tempo: "14 dias"
    },
    classico: {
      ingredientes: ["1.5kg Pilsen", "750g Trigo", "WB-06 (fermento Weizen)", "10g Hallertau (60min)"],
      passos: ["Mostura 66°C", "Ferva 60min", "Pitch WB-06 (20-22°C)", "Fermente 10 dias"],
      tempo: "21 dias"
    },
    mestre: {
      ingredientes: ["2kg Pilsen", "1kg Trigo", "WB-06 + Lactobacillus", "Hallertau + Tettnang"],
      passos: ["Mostura 66°C → OG 1.055", "Ferva 60min", "Pitch WB-06", "Dia 5: Lactobacillus", "Envelhece 3 meses"],
      tempo: "3 meses"
    },
    macete: "Weizen precisa de temperatura alta (20-22°C). Quanto mais quente, mais banana. Quanto mais frio, mais cravo.",
    xp: 75,
    warnings: []
  },
  {
    name: "Porter Clássica",
    slug: "porter-classica",
    category: "CERVEJA",
    difficulty: "CLASSICO",
    description: "Escura, encorpada e com notas de café. Cerveja de inverno.",
    rajado: {
      ingredientes: ["1.5kg Pilsen", "400g Malte Escuro", "10g Lúpulo Amargo"],
      passos: ["Mostura 66°C", "Ferva 60min", "Fermente 7 dias"],
      tempo: "14 dias"
    },
    classico: {
      ingredientes: ["2kg Pilsen", "500g Malte Escuro", "US-05", "15g Fuggle (60min)"],
      passos: ["Mostura 66°C", "Ferva 60min", "Pitch US-05", "Fermente 18-20°C por 10 dias"],
      tempo: "24 dias"
    },
    mestre: {
      ingredientes: ["2.5kg Pilsen", "600g Malte Escuro", "100g Chocolate Malt", "US-05"],
      passos: ["Mostura 64°C → OG 1.065", "Ferva 90min", "Pitch US-05", "Envelhece 4 meses"],
      tempo: "4 meses"
    },
    macete: "Porter é mais leve que Stout. Use menos malte escuro. O segredo é a proporção.",
    xp: 75,
    warnings: []
  },
  {
    name: "Pale Ale Americana",
    slug: "pale-ale-americana",
    category: "CERVEJA",
    difficulty: "CLASSICO",
    description: "Equilibrada entre malte e lúpulo. Clássica americana.",
    rajado: {
      ingredientes: ["1.5kg Pilsen", "15g Cascade (60min)", "15g Cascade (5min)"],
      passos: ["Mostura 66°C", "Ferva 60min", "Fermente 7 dias"],
      tempo: "14 dias"
    },
    classico: {
      ingredientes: ["2kg Pilsen", "US-05", "15g Cascade (60min)", "20g Cascade (15min)", "20g Cascade (flameout)"],
      passos: ["Mostura 66°C", "Ferva 60min", "Pitch US-05", "Fermente 18-20°C por 8 dias"],
      tempo: "21 dias"
    },
    mestre: {
      ingredientes: ["2.5kg Pilsen", "US-05", "Cascade + Centennial + Amarillo", "Dry-hop schedule"],
      passos: ["Mostura 66°C → OG 1.055", "Ferva 60min", "Pitch US-05", "Dry-hop dia 7", "Envelhece 2 meses"],
      tempo: "2 meses"
    },
    macete: "Pale Ale é o ponto de partida perfeito. Não é muito amarga, não é muito doce.",
    xp: 50,
    warnings: []
  },
  {
    name: "Saison (Cerveja de Fazenda)",
    slug: "saison",
    category: "CERVEJA",
    difficulty: "MESTRE",
    description: "Belga, seca e com especiarias. Histórica e complexa.",
    rajado: {
      ingredientes: ["1.5kg Pilsen", "Especiarias (cravo, gengibre)", "Fermento de pão"],
      passos: ["Mostura 66°C", "Ferva 60min", "Adicione especiarias", "Fermente 10 dias"],
      tempo: "21 dias"
    },
    classico: {
      ingredientes: ["2kg Pilsen", "Saison Yeast", "Cravo, gengibre, coentro", "10g Hallertau (60min)"],
      passos: ["Mostura 66°C", "Ferva 60min", "Pitch Saison Yeast (22-24°C)", "Fermente 12 dias"],
      tempo: "28 dias"
    },
    mestre: {
      ingredientes: ["2.5kg Pilsen", "Saison Yeast + Brettanomyces", "Especiarias complexas", "Hallertau + Saaz"],
      passos: ["Mostura 66°C → OG 1.060", "Ferva 90min", "Pitch Saison + Brett", "Envelhece 6 meses"],
      tempo: "6 meses"
    },
    macete: "Saison Yeast é selvagem. Quanto mais quente, mais frutada. Deixe envelhecer para complexidade.",
    xp: 100,
    warnings: []
  },
  {
    name: "Barley Wine",
    slug: "barley-wine",
    category: "CERVEJA",
    difficulty: "MESTRE",
    description: "Forte, encorpada e alcoólica. Cerveja de guarda.",
    rajado: {
      ingredientes: ["3kg Pilsen", "Lúpulo amargo", "Fermento de pão"],
      passos: ["Mostura 66°C", "Ferva 90min", "Fermente 14 dias"],
      tempo: "30 dias"
    },
    classico: {
      ingredientes: ["4kg Pilsen", "US-05", "20g Nugget (60min)", "10g Cascade (5min)"],
      passos: ["Mostura 66°C", "Ferva 90min", "Pitch US-05", "Fermente 18-20°C por 14 dias"],
      tempo: "35 dias"
    },
    mestre: {
      ingredientes: ["5kg Pilsen", "US-05", "Nugget + Cascade + Hallertau", "Envelhecimento em carvalho"],
      passos: ["Mostura 66°C → OG 1.100", "Ferva 120min", "Pitch US-05", "Envelhece 12 meses em carvalho"],
      tempo: "12 meses"
    },
    macete: "Barley Wine é uma maratona, não uma corrida. Quanto mais velha, melhor. Guarde por anos.",
    xp: 150,
    warnings: []
  },
  {
    name: "Lambic (Cerveja Selvagem)",
    slug: "lambic",
    category: "CERVEJA",
    difficulty: "MESTRE",
    description: "Belga, fermentada com bactérias selvagens. Azeda e complexa.",
    rajado: {
      ingredientes: ["2kg Pilsen", "Sem fermento (selvagem)", "Lúpulo velho"],
      passos: ["Mostura 66°C", "Ferva 90min", "Deixe exposto ao ar", "Fermente 1 ano"],
      tempo: "1 ano"
    },
    classico: {
      ingredientes: ["2.5kg Pilsen", "Brettanomyces + Lactobacillus", "Lúpulo velho", "Carvalho"],
      passos: ["Mostura 66°C", "Ferva 90min", "Pitch Brettanomyces + Lactobacillus", "Envelhece 1 ano em carvalho"],
      tempo: "1 ano"
    },
    mestre: {
      ingredientes: ["3kg Pilsen", "Cultura selvagem mista", "Carvalho francês", "Frutas (opcional)"],
      passos: ["Mostura 66°C → OG 1.055", "Ferva 120min", "Pitch cultura selvagem", "Envelhece 2-3 anos em carvalho"],
      tempo: "2-3 anos"
    },
    macete: "Lambic é para pacientes. Você precisa de paciência, carvalho e fé. O resultado é mágico.",
    xp: 200,
    warnings: ["EDUCACIONAL: Fermentação selvagem pode resultar em contaminação. Estude antes."]
  },
  {
    name: "Sour Ale (Cerveja Azeda)",
    slug: "sour-ale",
    category: "CERVEJA",
    difficulty: "MESTRE",
    description: "Azeda, refrescante e complexa. Tendência moderna.",
    rajado: {
      ingredientes: ["1.5kg Pilsen", "Lactobacillus", "Lúpulo leve"],
      passos: ["Mostura 66°C", "Ferva 60min", "Pitch Lactobacillus", "Fermente 7 dias"],
      tempo: "14 dias"
    },
    classico: {
      ingredientes: ["2kg Pilsen", "Lactobacillus + US-05", "Hallertau", "Carvalho"],
      passos: ["Mostura 66°C", "Ferva 60min", "Pitch Lactobacillus (48h)", "Pitch US-05", "Envelhece 3 meses em carvalho"],
      tempo: "3 meses"
    },
    mestre: {
      ingredientes: ["2.5kg Pilsen", "Lactobacillus + Brettanomyces + US-05", "Frutas (framboesa, cereja)", "Carvalho"],
      passos: ["Mostura 66°C → OG 1.050", "Ferva 60min", "Pitch Lactobacillus (48h)", "Pitch US-05 + Brett", "Envelhece 6 meses em carvalho + frutas"],
      tempo: "6 meses"
    },
    macete: "Sour Ale é o futuro. Lactobacillus é seu amigo. Quanto mais tempo, mais azeda.",
    xp: 125,
    warnings: ["EDUCACIONAL: Lactobacillus pode contaminar outras cervejas. Isole."]
  },
  {
    name: "Cream Ale",
    slug: "cream-ale",
    category: "CERVEJA",
    difficulty: "CLASSICO",
    description: "Americana, suave e refrescante. Fácil de beber.",
    rajado: {
      ingredientes: ["1.5kg Pilsen", "500g Milho", "Fermento de pão"],
      passos: ["Mostura 66°C", "Ferva 60min", "Fermente 7 dias"],
      tempo: "14 dias"
    },
    classico: {
      ingredientes: ["2kg Pilsen", "500g Milho", "US-05", "10g Hallertau (60min)"],
      passos: ["Mostura 66°C", "Ferva 60min", "Pitch US-05", "Fermente 18-20°C por 7 dias"],
      tempo: "21 dias"
    },
    mestre: {
      ingredientes: ["2.5kg Pilsen", "750g Milho", "US-05", "Hallertau + Saaz"],
      passos: ["Mostura 66°C → OG 1.050", "Ferva 60min", "Pitch US-05", "Envelhece 2 meses"],
      tempo: "2 meses"
    },
    macete: "Cream Ale é a cerveja do povo. Suave, refrescante, fácil. Perfeita para iniciantes.",
    xp: 50,
    warnings: []
  },
  {
    name: "Amber Ale",
    slug: "amber-ale",
    category: "CERVEJA",
    difficulty: "CLASSICO",
    description: "Âmbar, encorpada e equilibrada. Clássica americana.",
    rajado: {
      ingredientes: ["1.5kg Pilsen", "300g Malte Âmbar", "10g Lúpulo Amargo"],
      passos: ["Mostura 66°C", "Ferva 60min", "Fermente 7 dias"],
      tempo: "14 dias"
    },
    classico: {
      ingredientes: ["2kg Pilsen", "400g Malte Âmbar", "US-05", "15g Cascade (60min)", "10g Cascade (5min)"],
      passos: ["Mostura 66°C", "Ferva 60min", "Pitch US-05", "Fermente 18-20°C por 8 dias"],
      tempo: "21 dias"
    },
    mestre: {
      ingredientes: ["2.5kg Pilsen", "500g Malte Âmbar", "US-05", "Cascade + Centennial"],
      passos: ["Mostura 66°C → OG 1.055", "Ferva 60min", "Pitch US-05", "Dry-hop dia 7", "Envelhece 2 meses"],
      tempo: "2 meses"
    },
    macete: "Amber Ale é o equilíbrio perfeito. Nem muito amarga, nem muito doce. Cerveja de todos os dias.",
    xp: 50,
    warnings: []
  },
  {
    name: "Brown Ale",
    slug: "brown-ale",
    category: "CERVEJA",
    difficulty: "CLASSICO",
    description: "Marrom, encorpada e com notas de noz. Inglesa clássica.",
    rajado: {
      ingredientes: ["1.5kg Pilsen", "300g Malte Marrom", "10g Lúpulo Amargo"],
      passos: ["Mostura 66°C", "Ferva 60min", "Fermente 7 dias"],
      tempo: "14 dias"
    },
    classico: {
      ingredientes: ["2kg Pilsen", "400g Malte Marrom", "US-05", "15g Fuggle (60min)"],
      passos: ["Mostura 66°C", "Ferva 60min", "Pitch US-05", "Fermente 18-20°C por 8 dias"],
      tempo: "21 dias"
    },
    mestre: {
      ingredientes: ["2.5kg Pilsen", "500g Malte Marrom", "100g Chocolate Malt", "US-05"],
      passos: ["Mostura 66°C → OG 1.055", "Ferva 60min", "Pitch US-05", "Envelhece 3 meses"],
      tempo: "3 meses"
    },
    macete: "Brown Ale é subestimada. Tem notas de noz, chocolate e caramelo. Cerveja de conforto.",
    xp: 50,
    warnings: []
  },

  // FERMENTADOS - 15 receitas
  {
    name: "Kimchi Clássico",
    slug: "kimchi-classico",
    category: "FERMENTADOS",
    difficulty: "CLASSICO",
    description: "Repolho fermentado coreano. Picante, saudável e delicioso.",
    rajado: {
      ingredientes: ["1 repolho napa", "3 colheres sal", "Pimenta vermelha", "Alho"],
      passos: ["Corte o repolho", "Salga e deixe 2h", "Adicione pimenta e alho", "Fermente 3-5 dias"],
      tempo: "5 dias"
    },
    classico: {
      ingredientes: ["1.5kg repolho napa", "30g sal marinho", "50g pimenta vermelha em pó", "10 dentes alho", "1 colher gengibre"],
      passos: ["Corte o repolho em tiras", "Salga e deixe 3h", "Enxague e esprema", "Misture com pimenta, alho e gengibre", "Fermente 5-7 dias em pote de vidro"],
      tempo: "7 dias"
    },
    mestre: {
      ingredientes: ["2kg repolho napa", "40g sal marinho", "100g pimenta vermelha", "20 dentes alho", "2 colheres gengibre", "Starter culture"],
      passos: ["Corte o repolho", "Salga e deixe 4h", "Enxague e esprema", "Misture com pimenta, alho, gengibre e starter", "Fermente 10-14 dias em pote anaeróbico", "Envelhece 1 mês"],
      tempo: "1 mês"
    },
    macete: "Kimchi precisa de sal. Quanto mais sal, mais longo a fermentação. Mantenha submerso.",
    xp: 50,
    warnings: []
  },
  {
    name: "Kombucha Caseira",
    slug: "kombucha-caseira",
    category: "FERMENTADOS",
    difficulty: "CLASSICO",
    description: "Chá fermentado com probióticos. Refrescante e saudável.",
    rajado: {
      ingredientes: ["1 litro chá preto", "100g açúcar", "SCOBY (mãe de kombucha)"],
      passos: ["Prepare chá quente", "Adicione açúcar", "Esfrie", "Adicione SCOBY", "Fermente 7-10 dias"],
      tempo: "10 dias"
    },
    classico: {
      ingredientes: ["2 litros chá preto", "200g açúcar", "SCOBY + starter liquid", "Frasco de vidro 3L"],
      passos: ["Prepare chá quente", "Adicione açúcar", "Esfrie para 25°C", "Adicione SCOBY e starter", "Fermente 10-14 dias coberto com pano"],
      tempo: "14 dias"
    },
    mestre: {
      ingredientes: ["3 litros chá preto + verde", "300g açúcar", "SCOBY + starter liquid", "Frutas para segunda fermentação"],
      passos: ["Prepare chá misto", "Adicione açúcar", "Esfrie para 25°C", "Fermente 14-21 dias", "Segunda fermentação com frutas (3-5 dias)"],
      tempo: "3 semanas"
    },
    macete: "Kombucha ama temperatura estável (22-26°C). SCOBY é seu amigo. Quanto mais velha, mais forte.",
    xp: 75,
    warnings: ["SAÚDE: Kombucha contém pequenas quantidades de álcool. Não é recomendado para menores."]
  },
  {
    name: "Levain (Massa Mãe)",
    slug: "levain",
    category: "FERMENTADOS",
    difficulty: "CLASSICO",
    description: "Cultura de fermento natural para pão. Base para fermentação.",
    rajado: {
      ingredientes: ["100g farinha de trigo", "100g água", "Paciência"],
      passos: ["Misture farinha e água", "Deixe 24h em temperatura ambiente", "Alimente diariamente por 5-7 dias"],
      tempo: "7 dias"
    },
    classico: {
      ingredientes: ["100g farinha de trigo integral", "100g água filtrada", "Vidro limpo"],
      passos: ["Misture farinha e água", "Deixe 24h em 22-25°C", "Alimente 1:1:1 (levain:farinha:água) diariamente", "Após 5-7 dias, está pronto"],
      tempo: "7 dias"
    },
    mestre: {
      ingredientes: ["100g farinha de trigo", "100g farinha de centeio", "100g água", "Temperatura controlada"],
      passos: ["Misture farinhas e água", "Deixe 24h", "Alimente 1:1:1 diariamente", "Após 7 dias, teste com teste de flutuação", "Mantenha em geladeira"],
      tempo: "7 dias + manutenção"
    },
    macete: "Levain é vivo. Alimente regularmente. Se virar rosa ou laranja, descarte e comece de novo.",
    xp: 100,
    warnings: []
  },
  {
    name: "Miso Caseiro",
    slug: "miso-caseiro",
    category: "FERMENTADOS",
    difficulty: "MESTRE",
    description: "Pasta de soja fermentada. Umami puro.",
    rajado: {
      ingredientes: ["500g soja cozida", "100g sal", "Koji"],
      passos: ["Cozinhe soja", "Misture com sal e koji", "Fermente 3 meses"],
      tempo: "3 meses"
    },
    classico: {
      ingredientes: ["1kg soja cozida", "200g sal marinho", "200g koji", "Pote de vidro"],
      passos: ["Cozinhe soja até macio", "Esmague levemente", "Misture com sal e koji", "Fermente 6 meses em pote anaeróbico"],
      tempo: "6 meses"
    },
    mestre: {
      ingredientes: ["2kg soja cozida", "400g sal marinho", "400g koji caseiro", "Pote de vidro 5L"],
      passos: ["Cozinhe soja", "Esmague", "Misture com sal e koji", "Fermente 12 meses em pote anaeróbico", "Envelhece 2-3 anos"],
      tempo: "1-3 anos"
    },
    macete: "Miso é paciência. Quanto mais tempo, mais profundo o sabor. Mantenha anaeróbico.",
    xp: 150,
    warnings: []
  },
  {
    name: "Iogurte Natural",
    slug: "iogurte-natural",
    category: "FERMENTADOS",
    difficulty: "CLASSICO",
    description: "Iogurte caseiro com probióticos. Simples e saudável.",
    rajado: {
      ingredientes: ["1 litro leite", "100g iogurte natural", "Calor"],
      passos: ["Aqueça leite a 43°C", "Misture com iogurte", "Mantenha 43°C por 8h", "Resfrie"],
      tempo: "8 horas"
    },
    classico: {
      ingredientes: ["1 litro leite integral", "100g iogurte natural com probióticos", "Termômetro"],
      passos: ["Aqueça leite a 43°C", "Misture com iogurte", "Mantenha 43°C por 8-10h em cooler com água quente", "Resfrie e guarde"],
      tempo: "10 horas"
    },
    mestre: {
      ingredientes: ["2 litros leite A2", "100g iogurte natural", "Starter culture", "Incubadora"],
      passos: ["Aqueça leite a 43°C", "Misture com iogurte e starter", "Incube a 43°C por 12h", "Resfrie lentamente", "Envelhece 24h"],
      tempo: "36 horas"
    },
    macete: "Iogurte ama consistência de temperatura. Use cooler ou incubadora. Quanto mais tempo, mais azedo.",
    xp: 50,
    warnings: []
  },
  {
    name: "Chucrute (Repolho Fermentado)",
    slug: "chucrute",
    category: "FERMENTADOS",
    difficulty: "CLASSICO",
    description: "Repolho fermentado alemão. Clássico e saudável.",
    rajado: {
      ingredientes: ["1 repolho", "2 colheres sal", "Pote de vidro"],
      passos: ["Corte o repolho", "Salga e deixe 2h", "Coloque em pote", "Fermente 3-5 dias"],
      tempo: "5 dias"
    },
    classico: {
      ingredientes: ["1.5kg repolho", "30g sal marinho", "Pote de vidro 2L"],
      passos: ["Corte o repolho em tiras finas", "Salga (2% do peso)", "Deixe 30min", "Coloque em pote, pressione", "Fermente 5-7 dias"],
      tempo: "7 dias"
    },
    mestre: {
      ingredientes: ["2kg repolho", "40g sal marinho", "Sementes de carvi", "Starter culture"],
      passos: ["Corte o repolho", "Salga e deixe 1h", "Misture com carvi e starter", "Fermente 10-14 dias", "Envelhece 1 mês"],
      tempo: "1 mês"
    },
    macete: "Chucrute é simples: repolho + sal. Mantenha submerso. Quanto mais tempo, mais azedo.",
    xp: 50,
    warnings: []
  },
  {
    name: "Tempeh (Soja Fermentada)",
    slug: "tempeh",
    category: "FERMENTADOS",
    difficulty: "MESTRE",
    description: "Soja fermentada com koji. Proteína completa.",
    rajado: {
      ingredientes: ["500g soja cozida", "Koji", "Pano"],
      passos: ["Cozinhe soja", "Misture com koji", "Embrulhe em pano", "Fermente 24h"],
      tempo: "24 horas"
    },
    classico: {
      ingredientes: ["1kg soja cozida", "Koji", "Pano de algodão", "Incubadora"],
      passos: ["Cozinhe soja", "Seque bem", "Misture com koji", "Embrulhe em pano", "Incube a 30°C por 24-48h"],
      tempo: "48 horas"
    },
    mestre: {
      ingredientes: ["2kg soja cozida", "Koji caseiro", "Pano de algodão", "Incubadora controlada"],
      passos: ["Cozinhe soja", "Seque bem", "Misture com koji", "Embrulhe em pano", "Incube a 30°C por 48h", "Envelhece 1 semana"],
      tempo: "1 semana"
    },
    macete: "Tempeh é rápido. Koji é a chave. Mantenha a temperatura estável (30°C).",
    xp: 100,
    warnings: []
  },
  {
    name: "Vinagre de Frutas",
    slug: "vinagre-frutas",
    category: "FERMENTADOS",
    difficulty: "CLASSICO",
    description: "Vinagre caseiro de frutas. Delicioso e saudável.",
    rajado: {
      ingredientes: ["1kg frutas", "1 litro água", "100g açúcar"],
      passos: ["Corte frutas", "Misture com água e açúcar", "Fermente 2-3 semanas"],
      tempo: "3 semanas"
    },
    classico: {
      ingredientes: ["1.5kg frutas (maçã, morango)", "1 litro água filtrada", "150g açúcar", "Pote de vidro"],
      passos: ["Corte frutas", "Misture com água e açúcar", "Fermente 3-4 semanas coberto com pano", "Coe e envelhece 2 semanas"],
      tempo: "1 mês"
    },
    mestre: {
      ingredientes: ["2kg frutas variadas", "1 litro água", "200g açúcar", "Starter culture", "Pote de vidro"],
      passos: ["Corte frutas", "Misture com água, açúcar e starter", "Fermente 4-6 semanas", "Coe e envelhece 1 mês", "Filtre e engarrafe"],
      tempo: "2 meses"
    },
    macete: "Vinagre ama ar. Deixe coberto com pano. Quanto mais tempo, mais forte.",
    xp: 75,
    warnings: []
  },
  {
    name: "Água Kefir",
    slug: "agua-kefir",
    category: "FERMENTADOS",
    difficulty: "CLASSICO",
    description: "Bebida fermentada com kefir de água. Probióticos naturais.",
    rajado: {
      ingredientes: ["1 litro água", "50g açúcar", "Grãos de kefir"],
      passos: ["Dissolva açúcar em água", "Adicione kefir", "Fermente 24h", "Coe"],
      tempo: "24 horas"
    },
    classico: {
      ingredientes: ["1 litro água filtrada", "50g açúcar mascavo", "2 colheres grãos de kefir", "Pote de vidro"],
      passos: ["Dissolva açúcar em água", "Adicione kefir", "Fermente 24-48h em temperatura ambiente", "Coe e guarde"],
      tempo: "48 horas"
    },
    mestre: {
      ingredientes: ["2 litros água", "100g açúcar", "4 colheres grãos de kefir", "Frutas para segunda fermentação"],
      passos: ["Dissolva açúcar em água", "Fermente 48h", "Coe", "Segunda fermentação com frutas (24-48h)", "Filtre e engarrafe"],
      tempo: "3-4 dias"
    },
    macete: "Kefir de água é vivo. Alimente regularmente. Quanto mais quente, mais rápido.",
    xp: 75,
    warnings: []
  },
  {
    name: "Koji (Bolor Sagrado)",
    slug: "koji",
    category: "FERMENTADOS",
    difficulty: "MESTRE",
    description: "Bolor Aspergillus oryzae. Base para miso, sake e muito mais.",
    rajado: {
      ingredientes: ["500g arroz", "Esporos de koji", "Pano úmido"],
      passos: ["Cozinhe arroz", "Inocule koji", "Mantenha úmido", "Fermente 3-5 dias"],
      tempo: "5 dias"
    },
    classico: {
      ingredientes: ["1kg arroz cozido", "Esporos de koji", "Incubadora", "Pano úmido"],
      passos: ["Cozinhe arroz", "Inocule koji", "Incube a 27°C", "Mantenha úmido", "Fermente 5-7 dias"],
      tempo: "7 dias"
    },
    mestre: {
      ingredientes: ["2kg arroz cozido", "Esporos de koji selecionados", "Incubadora controlada", "Higiene rigorosa"],
      passos: ["Cozinhe arroz", "Inocule koji", "Incube a 27°C com umidade 80%", "Fermente 7-10 dias", "Seque e armazene"],
      tempo: "10 dias"
    },
    macete: "Koji é mágico. Temperatura e umidade são tudo. Mantenha limpo para evitar contaminação.",
    xp: 150,
    warnings: ["EDUCACIONAL: Koji requer higiene rigorosa. Qualquer contaminação deve ser descartada."]
  },
  {
    name: "Pasta de Missô de Grão de Bico",
    slug: "miso-grão-bico",
    category: "FERMENTADOS",
    difficulty: "MESTRE",
    description: "Miso alternativo com grão de bico. Vegano e delicioso.",
    rajado: {
      ingredientes: ["500g grão de bico cozido", "100g sal", "Koji"],
      passos: ["Cozinhe grão de bico", "Misture com sal e koji", "Fermente 2 meses"],
      tempo: "2 meses"
    },
    classico: {
      ingredientes: ["1kg grão de bico cozido", "200g sal marinho", "200g koji", "Pote de vidro"],
      passos: ["Cozinhe grão de bico", "Esmague levemente", "Misture com sal e koji", "Fermente 6 meses"],
      tempo: "6 meses"
    },
    mestre: {
      ingredientes: ["2kg grão de bico cozido", "400g sal marinho", "400g koji caseiro", "Pote de vidro 5L"],
      passos: ["Cozinhe grão de bico", "Esmague", "Misture com sal e koji", "Fermente 12 meses", "Envelhece 2-3 anos"],
      tempo: "1-3 anos"
    },
    macete: "Miso de grão de bico é mais leve que miso de soja. Perfeito para veganos.",
    xp: 150,
    warnings: []
  },
  {
    name: "Picles Fermentados",
    slug: "picles-fermentados",
    category: "FERMENTADOS",
    difficulty: "CLASSICO",
    description: "Pepino fermentado. Crocante e saudável.",
    rajado: {
      ingredientes: ["1kg pepino", "100g sal", "Água", "Especiarias"],
      passos: ["Corte pepino", "Prepare salmoura (10% sal)", "Adicione especiarias", "Fermente 3-5 dias"],
      tempo: "5 dias"
    },
    classico: {
      ingredientes: ["1.5kg pepino", "150g sal marinho", "1 litro água", "Alho, dill, pimenta"],
      passos: ["Corte pepino", "Prepare salmoura 10%", "Adicione especiarias", "Fermente 5-7 dias", "Guarde em geladeira"],
      tempo: "7 dias"
    },
    mestre: {
      ingredientes: ["2kg pepino", "200g sal marinho", "1.5 litro água", "Especiarias variadas", "Starter culture"],
      passos: ["Corte pepino", "Prepare salmoura", "Adicione especiarias e starter", "Fermente 10-14 dias", "Envelhece 1 mês"],
      tempo: "1 mês"
    },
    macete: "Picles precisa de crunch. Use pepino fresco. Mantenha submerso e frio.",
    xp: 50,
    warnings: []
  },

  // QUEIJOS - 10 receitas
  {
    name: "Ricota Caseira",
    slug: "ricota-caseira",
    category: "LATICINIOS",
    difficulty: "CLASSICO",
    description: "Queijo fresco e macio. Simples e delicioso.",
    rajado: {
      ingredientes: ["1 litro leite", "Sal", "Vinagre"],
      passos: ["Aqueça leite a 80°C", "Adicione vinagre", "Coe", "Pronto"],
      tempo: "30 minutos"
    },
    classico: {
      ingredientes: ["2 litros leite integral", "50ml vinagre branco", "Sal a gosto", "Pano de queijo"],
      passos: ["Aqueça leite a 80°C", "Adicione vinagre lentamente", "Deixe 10min", "Coe em pano", "Pronto"],
      tempo: "1 hora"
    },
    mestre: {
      ingredientes: ["4 litros leite A2", "100ml vinagre de maçã", "Sal marinho", "Pano de queijo fino"],
      passos: ["Aqueça leite a 80°C", "Adicione vinagre", "Deixe 15min", "Coe em pano", "Pendurar 2h", "Tempere"],
      tempo: "2 horas"
    },
    macete: "Ricota é rápida. Use leite fresco. Quanto mais quente, mais seca.",
    xp: 50,
    warnings: []
  },
  {
    name: "Queijo Minas Fresco",
    slug: "queijo-minas-fresco",
    category: "LATICINIOS",
    difficulty: "CLASSICO",
    description: "Queijo fresco brasileiro. Macio e delicado.",
    rajado: {
      ingredientes: ["1 litro leite", "Sal", "Fermento"],
      passos: ["Aqueça leite a 32°C", "Adicione fermento", "Deixe 30min", "Corte coalhada", "Coe"],
      tempo: "2 horas"
    },
    classico: {
      ingredientes: ["2 litros leite integral", "Fermento lático", "Sal marinho", "Forma de queijo"],
      passos: ["Aqueça leite a 32°C", "Adicione fermento", "Deixe 40min", "Corte coalhada", "Coe em pano", "Pronto"],
      tempo: "3 horas"
    },
    mestre: {
      ingredientes: ["4 litros leite A2", "Fermento lático selecionado", "Sal marinho", "Forma de queijo"],
      passos: ["Aqueça leite a 32°C", "Adicione fermento", "Deixe 45min", "Corte coalhada", "Coe", "Prensa leve 2h"],
      tempo: "4 horas"
    },
    macete: "Minas fresco é delicado. Use leite fresco. Coma no mesmo dia.",
    xp: 75,
    warnings: []
  },
  {
    name: "Mozzarella Caseira",
    slug: "mozzarella-caseira",
    category: "LATICINIOS",
    difficulty: "MESTRE",
    description: "Queijo de massa filada. Fresco e elástico.",
    rajado: {
      ingredientes: ["1 litro leite", "Sal", "Fermento", "Coalho"],
      passos: ["Aqueça leite", "Adicione fermento", "Corte coalhada", "Coe", "Aqueça novamente", "Estique"],
      tempo: "2 horas"
    },
    classico: {
      ingredientes: ["2 litros leite integral", "Fermento lático", "Coalho", "Sal marinho"],
      passos: ["Aqueça leite a 32°C", "Adicione fermento", "Deixe 30min", "Corte coalhada", "Aqueça a 40°C", "Coe", "Aqueça a 90°C", "Estique"],
      tempo: "3 horas"
    },
    mestre: {
      ingredientes: ["4 litros leite A2", "Fermento selecionado", "Coalho de qualidade", "Sal marinho"],
      passos: ["Aqueça leite a 32°C", "Adicione fermento", "Deixe 40min", "Corte coalhada fina", "Aqueça a 40°C", "Coe", "Aqueça a 95°C", "Estique", "Molde"],
      tempo: "4 horas"
    },
    macete: "Mozzarella é técnica. Temperatura é tudo. Estique quando estiver no ponto.",
    xp: 100,
    warnings: []
  },
  {
    name: "Queijo Parmesão Caseiro",
    slug: "queijo-parmesao-caseiro",
    category: "LATICINIOS",
    difficulty: "MESTRE",
    description: "Queijo duro e envelhecido. Complexo e saboroso.",
    rajado: {
      ingredientes: ["2 litros leite", "Fermento", "Coalho", "Sal"],
      passos: ["Aqueça leite", "Adicione fermento", "Corte coalhada", "Prensa", "Envelhece 1 mês"],
      tempo: "1 mês"
    },
    classico: {
      ingredientes: ["4 litros leite integral", "Fermento lático", "Coalho", "Sal marinho", "Forma de queijo"],
      passos: ["Aqueça leite a 32°C", "Adicione fermento", "Deixe 40min", "Corte coalhada", "Aqueça a 55°C", "Coe", "Prensa 12h", "Envelhece 3 meses"],
      tempo: "3 meses"
    },
    mestre: {
      ingredientes: ["8 litros leite A2", "Fermento selecionado", "Coalho de qualidade", "Sal marinho"],
      passos: ["Aqueça leite a 32°C", "Adicione fermento", "Deixe 40min", "Corte coalhada fina", "Aqueça a 55°C", "Coe", "Prensa 24h", "Salga", "Envelhece 12 meses"],
      tempo: "12 meses"
    },
    macete: "Parmesão é paciência. Quanto mais tempo, mais duro e saboroso. Armazene em local fresco.",
    xp: 150,
    warnings: []
  },
  {
    name: "Queijo Brie Caseiro",
    slug: "queijo-brie-caseiro",
    category: "LATICINIOS",
    difficulty: "MESTRE",
    description: "Queijo mofado branco. Cremoso e luxuoso.",
    rajado: {
      ingredientes: ["1 litro leite", "Fermento", "Mofo branco", "Sal"],
      passos: ["Aqueça leite", "Adicione fermento e mofo", "Corte coalhada", "Coe", "Envelhece 2 semanas"],
      tempo: "2 semanas"
    },
    classico: {
      ingredientes: ["2 litros leite integral", "Fermento lático", "Penicillium candidum", "Sal marinho"],
      passos: ["Aqueça leite a 30°C", "Adicione fermento e mofo", "Deixe 30min", "Corte coalhada", "Coe em pano", "Molde", "Envelhece 3 semanas"],
      tempo: "3 semanas"
    },
    mestre: {
      ingredientes: ["4 litros leite A2", "Fermento selecionado", "Penicillium candidum puro", "Sal marinho"],
      passos: ["Aqueça leite a 30°C", "Adicione fermento e mofo", "Deixe 40min", "Corte coalhada", "Coe", "Molde", "Vire diariamente", "Envelhece 4 semanas"],
      tempo: "4 semanas"
    },
    macete: "Brie precisa de mofo. Mantenha úmido. Quanto mais tempo, mais cremoso.",
    xp: 125,
    warnings: []
  },
  {
    name: "Queijo Cheddar Caseiro",
    slug: "queijo-cheddar-caseiro",
    category: "LATICINIOS",
    difficulty: "MESTRE",
    description: "Queijo duro inglês. Amarelo e saboroso.",
    rajado: {
      ingredientes: ["2 litros leite", "Fermento", "Coalho", "Sal"],
      passos: ["Aqueça leite", "Adicione fermento", "Corte coalhada", "Prensa", "Envelhece 2 meses"],
      tempo: "2 meses"
    },
    classico: {
      ingredientes: ["4 litros leite integral", "Fermento lático", "Coalho", "Sal marinho"],
      passos: ["Aqueça leite a 32°C", "Adicione fermento", "Deixe 40min", "Corte coalhada", "Aqueça a 40°C", "Coe", "Prensa 12h", "Envelhece 3 meses"],
      tempo: "3 meses"
    },
    mestre: {
      ingredientes: ["8 litros leite A2", "Fermento selecionado", "Coalho de qualidade", "Sal marinho"],
      passos: ["Aqueça leite a 32°C", "Adicione fermento", "Deixe 40min", "Corte coalhada fina", "Aqueça a 40°C", "Coe", "Prensa 24h", "Envelhece 6 meses"],
      tempo: "6 meses"
    },
    macete: "Cheddar é técnico. Temperatura e tempo são críticos. Envelhece bem.",
    xp: 125,
    warnings: []
  },
  {
    name: "Queijo Fresco de Cabra",
    slug: "queijo-fresco-cabra",
    category: "LATICINIOS",
    difficulty: "CLASSICO",
    description: "Queijo fresco de leite de cabra. Tangy e delicado.",
    rajado: {
      ingredientes: ["1 litro leite de cabra", "Sal", "Vinagre"],
      passos: ["Aqueça leite a 80°C", "Adicione vinagre", "Coe", "Pronto"],
      tempo: "1 hora"
    },
    classico: {
      ingredientes: ["2 litros leite de cabra", "Fermento lático", "Sal marinho", "Pano de queijo"],
      passos: ["Aqueça leite a 30°C", "Adicione fermento", "Deixe 12h", "Coe em pano", "Pendurar 4h", "Tempere"],
      tempo: "16 horas"
    },
    mestre: {
      ingredientes: ["4 litros leite de cabra A2", "Fermento selecionado", "Sal marinho", "Pano de queijo fino"],
      passos: ["Aqueça leite a 30°C", "Adicione fermento", "Deixe 12h", "Coe", "Pendurar 6h", "Molde", "Envelhece 1 semana"],
      tempo: "1 semana"
    },
    macete: "Queijo de cabra é tangy. Leite de cabra é diferente. Experimente.",
    xp: 75,
    warnings: []
  },
  {
    name: "Queijo Roquefort Caseiro",
    slug: "queijo-roquefort-caseiro",
    category: "LATICINIOS",
    difficulty: "MESTRE",
    description: "Queijo azul francês. Intenso e complexo.",
    rajado: {
      ingredientes: ["2 litros leite", "Fermento", "Mofo azul", "Sal"],
      passos: ["Aqueça leite", "Adicione fermento e mofo", "Corte coalhada", "Prensa", "Envelhece 3 meses"],
      tempo: "3 meses"
    },
    classico: {
      ingredientes: ["4 litros leite integral", "Fermento lático", "Penicillium roqueforti", "Sal marinho"],
      passos: ["Aqueça leite a 32°C", "Adicione fermento e mofo", "Deixe 40min", "Corte coalhada", "Coe", "Prensa 24h", "Fure", "Envelhece 4 meses"],
      tempo: "4 meses"
    },
    mestre: {
      ingredientes: ["8 litros leite A2", "Fermento selecionado", "Penicillium roqueforti puro", "Sal marinho"],
      passos: ["Aqueça leite a 32°C", "Adicione fermento e mofo", "Deixe 40min", "Corte coalhada fina", "Coe", "Prensa 24h", "Fure profundamente", "Envelhece 6 meses"],
      tempo: "6 meses"
    },
    macete: "Roquefort é mofo. Quanto mais mofo, mais intenso. Armazene em local fresco e úmido.",
    xp: 150,
    warnings: []
  },
  {
    name: "Queijo Mozzarella de Búfala",
    slug: "mozzarella-bufala",
    category: "LATICINIOS",
    difficulty: "MESTRE",
    description: "Mozzarella de leite de búfala. Cremosa e luxuosa.",
    rajado: {
      ingredientes: ["1 litro leite de búfala", "Sal", "Fermento", "Coalho"],
      passos: ["Aqueça leite", "Adicione fermento", "Corte coalhada", "Estique", "Pronto"],
      tempo: "2 horas"
    },
    classico: {
      ingredientes: ["2 litros leite de búfala", "Fermento lático", "Coalho", "Sal marinho"],
      passos: ["Aqueça leite a 32°C", "Adicione fermento", "Deixe 30min", "Corte coalhada", "Aqueça a 40°C", "Coe", "Aqueça a 90°C", "Estique"],
      tempo: "3 horas"
    },
    mestre: {
      ingredientes: ["4 litros leite de búfala A2", "Fermento selecionado", "Coalho de qualidade", "Sal marinho"],
      passos: ["Aqueça leite a 32°C", "Adicione fermento", "Deixe 40min", "Corte coalhada fina", "Aqueça a 40°C", "Coe", "Aqueça a 95°C", "Estique", "Molde"],
      tempo: "4 horas"
    },
    macete: "Mozzarella de búfala é mais cremosa que de vaca. Leite de búfala é diferente.",
    xp: 125,
    warnings: []
  },

  // CHARCUTARIA - 10 receitas
  {
    name: "Salame Caseiro",
    slug: "salame-caseiro",
    category: "CHARCUTARIA",
    difficulty: "CLASSICO",
    description: "Embutido fermentado. Clássico italiano.",
    rajado: {
      ingredientes: ["1kg carne de porco", "30g sal", "Fermento", "Tripa"],
      passos: ["Misture carne com sal e fermento", "Embuche", "Fermente 2 semanas"],
      tempo: "2 semanas"
    },
    classico: {
      ingredientes: ["2kg carne de porco", "60g sal marinho", "Fermento lático", "Tripa natural", "Especiarias"],
      passos: ["Misture carne com sal, fermento e especiarias", "Embuche", "Fermente 3 semanas", "Seque 2 semanas"],
      tempo: "5 semanas"
    },
    mestre: {
      ingredientes: ["3kg carne de porco", "90g sal marinho", "Fermento selecionado", "Tripa natural", "Especiarias complexas"],
      passos: ["Misture carne com sal, fermento e especiarias", "Embuche", "Fermente 4 semanas", "Seque 4 semanas", "Envelhece 2 meses"],
      tempo: "3 meses"
    },
    macete: "Salame precisa de sal. Quanto mais sal, mais longo a fermentação. Mantenha fresco.",
    xp: 100,
    warnings: ["SEGURANÇA: Use sal de cura #2. pH < 4.6. Botulismo mata. Estude antes."]
  },
  {
    name: "Guanciale (Bochecha de Porco)",
    slug: "guanciale",
    category: "CHARCUTARIA",
    difficulty: "MESTRE",
    description: "Curado italiano de bochecha de porco. Luxuoso e saboroso.",
    rajado: {
      ingredientes: ["1kg bochecha de porco", "30g sal", "Especiarias"],
      passos: ["Salga a carne", "Deixe 1 semana", "Seque 3 semanas"],
      tempo: "4 semanas"
    },
    classico: {
      ingredientes: ["2kg bochecha de porco", "60g sal marinho", "Pimenta preta", "Alecrim"],
      passos: ["Salga a carne", "Deixe 2 semanas", "Enxague", "Seque 4 semanas", "Envelhece 2 meses"],
      tempo: "3 meses"
    },
    mestre: {
      ingredientes: ["3kg bochecha de porco", "90g sal marinho", "Especiarias variadas", "Carvalho (opcional)"],
      passos: ["Salga a carne", "Deixe 3 semanas", "Enxague", "Seque 6 semanas", "Envelhece 4 meses"],
      tempo: "4 meses"
    },
    macete: "Guanciale é luxo. Quanto mais tempo, mais saboroso. Armazene em local fresco.",
    xp: 150,
    warnings: ["SEGURANÇA: Use sal de cura #2. Mantenha pH < 4.6. Botulismo mata."]
  },
  {
    name: "Presunto Caseiro",
    slug: "presunto-caseiro",
    category: "CHARCUTARIA",
    difficulty: "MESTRE",
    description: "Presunto curado. Clássico português.",
    rajado: {
      ingredientes: ["2kg coxa de porco", "60g sal", "Especiarias"],
      passos: ["Salga a carne", "Deixe 2 semanas", "Seque 4 semanas"],
      tempo: "6 semanas"
    },
    classico: {
      ingredientes: ["3kg coxa de porco", "90g sal marinho", "Pimenta preta", "Alecrim"],
      passos: ["Salga a carne", "Deixe 3 semanas", "Enxague", "Seque 6 semanas", "Envelhece 3 meses"],
      tempo: "4 meses"
    },
    mestre: {
      ingredientes: ["5kg coxa de porco", "150g sal marinho", "Especiarias variadas", "Carvalho"],
      passos: ["Salga a carne", "Deixe 4 semanas", "Enxague", "Seque 8 semanas", "Envelhece 6 meses"],
      tempo: "6 meses"
    },
    macete: "Presunto é paciência. Quanto mais tempo, mais saboroso. Armazene pendurado.",
    xp: 150,
    warnings: ["SEGURANÇA: Use sal de cura #2. Botulismo mata. Estude antes."]
  },
  {
    name: "Bacon Caseiro",
    slug: "bacon-caseiro",
    category: "CHARCUTARIA",
    difficulty: "CLASSICO",
    description: "Bacon curado. Crocante e saboroso.",
    rajado: {
      ingredientes: ["1kg barriga de porco", "30g sal", "Açúcar"],
      passos: ["Salga a carne", "Deixe 1 semana", "Seque 2 semanas"],
      tempo: "3 semanas"
    },
    classico: {
      ingredientes: ["2kg barriga de porco", "60g sal marinho", "30g açúcar mascavo", "Pimenta preta"],
      passos: ["Salga a carne", "Deixe 2 semanas", "Enxague", "Seque 3 semanas", "Fume (opcional)"],
      tempo: "5 semanas"
    },
    mestre: {
      ingredientes: ["3kg barriga de porco", "90g sal marinho", "45g açúcar", "Especiarias", "Fumaça"],
      passos: ["Salga a carne", "Deixe 3 semanas", "Enxague", "Seque 4 semanas", "Fume 8h", "Envelhece 1 mês"],
      tempo: "2 meses"
    },
    macete: "Bacon é rápido. Quanto mais sal, mais seco. Fume para mais sabor.",
    xp: 75,
    warnings: ["SEGURANÇA: Use sal de cura #2. Botulismo mata."]
  },
  {
    name: "Pastrami Caseiro",
    slug: "pastrami-caseiro",
    category: "CHARCUTARIA",
    difficulty: "MESTRE",
    description: "Carne curada e defumada. Judeu-americano.",
    rajado: {
      ingredientes: ["2kg peito de porco", "60g sal", "Especiarias"],
      passos: ["Salga a carne", "Deixe 1 semana", "Fume 4h"],
      tempo: "1 semana"
    },
    classico: {
      ingredientes: ["3kg peito de porco", "90g sal marinho", "Especiarias variadas", "Fumaça"],
      passos: ["Salga a carne", "Deixe 2 semanas", "Enxague", "Seque 1 semana", "Fume 8h", "Cozinhe"],
      tempo: "4 semanas"
    },
    mestre: {
      ingredientes: ["4kg peito de porco", "120g sal marinho", "Especiarias complexas", "Fumaça de qualidade"],
      passos: ["Salga a carne", "Deixe 3 semanas", "Enxague", "Seque 2 semanas", "Fume 12h", "Cozinhe a baixa temperatura"],
      tempo: "6 semanas"
    },
    macete: "Pastrami é técnico. Fumaça é tudo. Quanto mais tempo, mais saboroso.",
    xp: 125,
    warnings: ["SEGURANÇA: Use sal de cura #2. Botulismo mata."]
  },
  {
    name: "Peito de Porco Curado (Pancetta)",
    slug: "pancetta",
    category: "CHARCUTARIA",
    difficulty: "CLASSICO",
    description: "Pancetta italiana. Curada e envelhecida.",
    rajado: {
      ingredientes: ["1kg peito de porco", "30g sal", "Especiarias"],
      passos: ["Salga a carne", "Deixe 1 semana", "Seque 2 semanas"],
      tempo: "3 semanas"
    },
    classico: {
      ingredientes: ["2kg peito de porco", "60g sal marinho", "Pimenta preta", "Alecrim"],
      passos: ["Salga a carne", "Deixe 2 semanas", "Enxague", "Seque 3 semanas", "Enrole em papel"],
      tempo: "5 semanas"
    },
    mestre: {
      ingredientes: ["3kg peito de porco", "90g sal marinho", "Especiarias variadas", "Carvalho"],
      passos: ["Salga a carne", "Deixe 3 semanas", "Enxague", "Seque 4 semanas", "Enrole", "Envelhece 2 meses"],
      tempo: "3 meses"
    },
    macete: "Pancetta é italiana. Enrole bem. Quanto mais tempo, mais saborosa.",
    xp: 100,
    warnings: ["SEGURANÇA: Use sal de cura #2. Botulismo mata."]
  },
  {
    name: "Coppa (Capicola)",
    slug: "coppa",
    category: "CHARCUTARIA",
    difficulty: "MESTRE",
    description: "Curado italiano de pescoço de porco. Marmoreado e saboroso.",
    rajado: {
      ingredientes: ["1kg pescoço de porco", "30g sal", "Especiarias"],
      passos: ["Salga a carne", "Deixe 1 semana", "Seque 3 semanas"],
      tempo: "4 semanas"
    },
    classico: {
      ingredientes: ["2kg pescoço de porco", "60g sal marinho", "Pimenta preta", "Alecrim"],
      passos: ["Salga a carne", "Deixe 2 semanas", "Enxague", "Seque 4 semanas", "Embuche"],
      tempo: "6 semanas"
    },
    mestre: {
      ingredientes: ["3kg pescoço de porco", "90g sal marinho", "Especiarias variadas", "Tripa natural"],
      passos: ["Salga a carne", "Deixe 3 semanas", "Enxague", "Seque 5 semanas", "Embuche", "Envelhece 3 meses"],
      tempo: "4 meses"
    },
    macete: "Coppa é marmoreada. Quanto mais tempo, mais saborosa. Armazene em local fresco.",
    xp: 125,
    warnings: ["SEGURANÇA: Use sal de cura #2. Botulismo mata."]
  },
  {
    name: "Mortadela Caseira",
    slug: "mortadela-caseira",
    category: "CHARCUTARIA",
    difficulty: "MESTRE",
    description: "Embutido italiano com toucinho. Luxuoso e saboroso.",
    rajado: {
      ingredientes: ["2kg carne de porco", "500g toucinho", "30g sal", "Especiarias"],
      passos: ["Misture carne com toucinho", "Embuche", "Cozinhe 2h"],
      tempo: "2 horas"
    },
    classico: {
      ingredientes: ["3kg carne de porco", "750g toucinho", "60g sal marinho", "Especiarias variadas"],
      passos: ["Misture carne com toucinho e especiarias", "Embuche", "Cozinhe 3h a 75°C", "Esfrie"],
      tempo: "3 horas"
    },
    mestre: {
      ingredientes: ["4kg carne de porco", "1kg toucinho", "90g sal marinho", "Especiarias complexas"],
      passos: ["Misture carne com toucinho e especiarias", "Embuche", "Cozinhe 4h a 75°C", "Esfrie lentamente", "Envelhece 1 semana"],
      tempo: "1 semana"
    },
    macete: "Mortadela é luxo. Toucinho é tudo. Quanto mais toucinho, mais saborosa.",
    xp: 125,
    warnings: ["SEGURANÇA: Use sal de cura #2. Cozinhe bem."]
  },
  {
    name: "Salsichão Caseiro",
    slug: "salsicha-caseira",
    category: "CHARCUTARIA",
    difficulty: "CLASSICO",
    description: "Salsicha caseira. Fresca e saborosa.",
    rajado: {
      ingredientes: ["1kg carne de porco", "200g toucinho", "30g sal", "Tripa"],
      passos: ["Misture carne com toucinho", "Embuche", "Cozinhe"],
      tempo: "1 hora"
    },
    classico: {
      ingredientes: ["2kg carne de porco", "400g toucinho", "60g sal marinho", "Especiarias", "Tripa natural"],
      passos: ["Misture carne com toucinho e especiarias", "Embuche", "Cozinhe 1h a 75°C", "Esfrie"],
      tempo: "2 horas"
    },
    mestre: {
      ingredientes: ["3kg carne de porco", "600g toucinho", "90g sal marinho", "Especiarias variadas", "Tripa natural"],
      passos: ["Misture carne com toucinho e especiarias", "Embuche", "Cozinhe 2h a 75°C", "Esfrie lentamente", "Envelhece 3 dias"],
      tempo: "3 dias"
    },
    macete: "Salsicha é rápida. Toucinho é importante. Cozinhe bem.",
    xp: 75,
    warnings: ["SEGURANÇA: Use sal de cura #2. Cozinhe bem."]
  }
];

async function main() {
  // Suporta tanto DATABASE_URL quanto variáveis separadas
  const connectionConfig = process.env.DATABASE_URL 
    ? process.env.DATABASE_URL
    : {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'brocraft',
      };

  console.log('🔌 Conectando ao banco de dados...');
  const connection = await mysql.createConnection(connectionConfig);

  try {
    let inserted = 0;
    let skipped = 0;

    for (const recipe of recipes) {
      try {
        // Usa INSERT IGNORE para não falhar se a receita já existir (baseado no slug único)
        await connection.execute(
          `INSERT IGNORE INTO recipes (name, slug, category, difficulty, description, rajado, classico, mestre, macete, xp, warnings) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            recipe.name,
            recipe.slug,
            recipe.category,
            recipe.difficulty,
            recipe.description,
            JSON.stringify(recipe.rajado),
            JSON.stringify(recipe.classico),
            JSON.stringify(recipe.mestre),
            recipe.macete,
            recipe.xp,
            JSON.stringify(recipe.warnings),
          ]
        );
        
        // Verifica se foi inserido ou ignorado
        const [result] = await connection.execute(
          'SELECT ROW_COUNT() as affected'
        );
        if (result[0].affected > 0) {
          inserted++;
          console.log(`  ✓ ${recipe.name}`);
        } else {
          skipped++;
        }
      } catch (err) {
        console.error(`  ✗ Erro em "${recipe.name}":`, err.message);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Seed concluído!`);
    console.log(`   📝 Inseridas: ${inserted} receitas`);
    console.log(`   ⏭️  Ignoradas (já existiam): ${skipped} receitas`);
    console.log(`   📊 Total processadas: ${recipes.length} receitas`);
  } catch (error) {
    console.error('❌ Erro ao inserir receitas:', error);
    process.exit(1);
  } finally {
    await connection.end();
    console.log('🔌 Conexão encerrada.');
  }
}

main();
