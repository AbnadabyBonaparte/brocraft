import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, BookOpen, Search, Flame, Filter } from "lucide-react";
import { useLocation } from "wouter";

const CATEGORIES = [
  { value: "CERVEJA", label: "🍺 Cerveja", color: "from-yellow-500 to-amber-700" },
  { value: "FERMENTADOS", label: "🥒 Fermentados", color: "from-green-500 to-emerald-700" },
  { value: "LATICINIOS", label: "🧀 Queijos", color: "from-orange-400 to-orange-700" },
  { value: "CHARCUTARIA", label: "🥩 Charcutaria", color: "from-red-500 to-red-700" },
];

const DIFFICULTIES = [
  { value: "RAJADO", label: "🔥 Rajado", level: 1, color: "from-orange-400 to-orange-600" },
  { value: "CLASSICO", label: "⚗️ Clássico", level: 2, color: "from-yellow-400 to-yellow-600" },
  { value: "MESTRE", label: "👑 Mestre", level: 3, color: "from-purple-400 to-purple-600" },
];

export default function Recipes() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [category, setCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const recipesQuery = trpc.recipes.list.useQuery({
    category: category || undefined,
    difficulty: difficulty || undefined,
  });

  const startRecipeMutation = trpc.recipes.startRecipe.useMutation();

  const filteredRecipes = useMemo(
    () =>
      recipesQuery.data?.filter((recipe) =>
        recipe.name.toLowerCase().includes(search.toLowerCase())
      ) || [],
    [recipesQuery.data, search]
  );

  const handleStartRecipe = async (recipeId: number) => {
    try {
      await startRecipeMutation.mutateAsync({ recipeId });
      navigate("/");
    } catch (error) {
      console.error("Erro ao iniciar receita:", error);
    }
  };

  const getCategoryColor = (cat: string) => {
    return CATEGORIES.find((c) => c.value === cat)?.color || "from-gray-500 to-gray-700";
  };

  const getDifficultyInfo = (diff: string) => {
    return DIFFICULTIES.find((d) => d.value === diff);
  };

  const profileQuery = trpc.gamification.getProfile.useQuery();

  return (
    <DashboardLayout
      userRank={profileQuery.data?.rank}
      userXp={profileQuery.data?.xp}
      userTier={profileQuery.data?.tier}
      userStreak={profileQuery.data?.streak}
      onLogout={logout}
    >
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-orange-500" />
            Receitas BROCRAFT
          </h1>
          <p className="text-gray-400 text-lg">
            Escolha uma receita e comece sua jornada de fermentação. Ganhe XP com cada desafio!
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-b border-gray-700/50 px-6 py-4 flex items-center gap-2">
            <Filter className="h-5 w-5 text-orange-400" />
            <h2 className="text-lg font-bold text-white">Filtros</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
              <Input
                placeholder="Buscar receita..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-600 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {/* Category Filter */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulty Filter */}
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                <SelectValue placeholder="Todas as dificuldades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as dificuldades</SelectItem>
                {DIFFICULTIES.map((diff) => (
                  <SelectItem key={diff.value} value={diff.value}>
                    {diff.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          {!recipesQuery.isLoading && (
            <div className="px-6 py-3 border-t border-gray-700/50 bg-gray-900/30">
              <p className="text-sm text-gray-400">
                <span className="font-bold text-orange-400">{filteredRecipes.length}</span>{" "}
                {filteredRecipes.length === 1 ? "receita" : "receitas"} encontrada
                {filteredRecipes.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </Card>

        {/* Recipes Grid */}
        {recipesQuery.isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => {
              const categoryInfo = CATEGORIES.find((c) => c.value === recipe.category);
              const difficultyInfo = getDifficultyInfo(recipe.difficulty);

              return (
                <Card
                  key={recipe.id}
                  className="overflow-hidden hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 border-gray-700/50 bg-gray-800/30 backdrop-blur-sm flex flex-col group"
                >
                  {/* Header with Gradient */}
                  <div
                    className={`h-40 bg-gradient-to-br ${getCategoryColor(recipe.category)} relative overflow-hidden`}
                  >
                    {/* Decorative elements */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-2 right-2 text-6xl group-hover:scale-110 transition-transform">
                        {categoryInfo?.label.split(" ")[0]}
                      </div>
                    </div>
                    <div className="relative h-full flex flex-col justify-between p-6 text-white">
                      <div>
                        <h2 className="text-2xl font-black mb-2 drop-shadow-lg">
                          {recipe.name}
                        </h2>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold border border-white/30 shadow-lg">
                          {categoryInfo?.label}
                        </span>
                        <span className={`bg-gradient-to-r ${difficultyInfo?.color} text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg`}>
                          {difficultyInfo?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col gap-5">
                    {/* Description */}
                    <p className="text-gray-300 text-sm leading-relaxed flex-1">
                      {recipe.description}
                    </p>

                    {/* XP Badge */}
                    <div className="flex items-center gap-4 bg-gradient-to-r from-orange-600/30 to-red-600/30 border border-orange-500/50 rounded-lg px-4 py-4 shadow-lg">
                      <div className="text-3xl">⭐</div>
                      <div>
                        <p className="text-xs font-bold text-orange-300 uppercase tracking-wide">
                          Ganhe
                        </p>
                        <p className="text-2xl font-black text-orange-400">
                          +{recipe.xp} XP
                        </p>
                      </div>
                    </div>

                    {/* Difficulty Indicator */}
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        {[...Array(difficultyInfo?.level || 0)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2.5 w-8 bg-gradient-to-r ${difficultyInfo?.color} rounded-sm shadow-lg`}
                          />
                        ))}
                        {[...Array(3 - (difficultyInfo?.level || 0))].map((_, i) => (
                          <div
                            key={i}
                            className="h-2.5 w-8 bg-gray-700 rounded-sm"
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase">
                        Dificuldade
                      </span>
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleStartRecipe(recipe.id)}
                      disabled={startRecipeMutation.isPending}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-orange-500/50 mt-2 group"
                    >
                      {startRecipeMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Iniciando...
                        </>
                      ) : (
                        <>
                          <Flame className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                          <span>Começar Receita</span>
                          <span className="ml-2 group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm">
            <div className="text-center py-20">
              <BookOpen className="h-20 w-20 text-gray-600 mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-bold text-gray-300 mb-3">
                Nenhuma receita encontrada
              </h3>
              <p className="text-gray-500 text-base">
                Tente ajustar seus filtros de busca ou volte em breve para novas receitas.
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
