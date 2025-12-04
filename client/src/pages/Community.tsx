import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2,
  Heart,
  Send,
  Trophy,
  Clock,
  MessageSquare,
  Users,
  Flame,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { COMMUNITY_CATEGORIES, LEADERBOARD_TIMEFRAMES } from "@shared/const";
import type { LeaderboardTimeframe, CommunityCategory } from "@shared/const";

// Timeframe labels para UI
const TIMEFRAME_LABELS: Record<LeaderboardTimeframe, string> = {
  ALL: "Tudo",
  DAY: "Hoje",
  WEEK: "Semana",
  MONTH: "Mês",
};

// Formatar data relativa
function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "agora mesmo";
  if (diffMinutes < 60) return `há ${diffMinutes} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays} dias`;
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
  return `há ${Math.floor(diffDays / 30)} meses`;
}

// Tipo para post local (com estado otimista)
type LocalPost = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  votes: number;
  authorName: string;
  createdAt: Date | string;
  hasVoted: boolean;
  isVoting?: boolean;
};

export default function Community() {
  const { isAuthenticated, logout } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState<LeaderboardTimeframe>("ALL");
  
  // Form states
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState<CommunityCategory>("CERVEJA");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local posts state para update otimista
  const [localPosts, setLocalPosts] = useState<LocalPost[]>([]);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  // Queries
  const profileQuery = trpc.gamification.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const postsQuery = trpc.community.getPosts.useQuery(
    { limit: 20 },
    { 
      enabled: true,
      staleTime: 30000, // 30 segundos
    }
  );

  const leaderboardQuery = trpc.community.getLeaderboard.useQuery(
    { timeframe: selectedTimeframe },
    { enabled: true }
  );

  // Mutations
  const createPostMutation = trpc.community.createPost.useMutation();
  const votePostMutation = trpc.community.votePost.useMutation();

  // Cursor para paginação
  const [cursor, setCursor] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Sincronizar posts do server com estado local
  useEffect(() => {
    if (postsQuery.data && !hasLoadedInitial) {
      setLocalPosts(postsQuery.data.items.map(p => ({
        ...p,
        hasVoted: p.hasVoted || false,
        isVoting: false,
      })));
      setHasMore(!!postsQuery.data.nextCursor);
      setCursor(postsQuery.data.nextCursor);
      setHasLoadedInitial(true);
    }
  }, [postsQuery.data, hasLoadedInitial]);

  // Carregar mais posts
  const loadMorePosts = useCallback(async () => {
    if (!cursor || isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const result = await postsQuery.refetch();
      // Note: Para paginação real, você precisaria usar useInfiniteQuery
      // Por simplicidade, estamos usando refetch aqui
    } catch (error) {
      console.error("Error loading more posts:", error);
      toast.error("Erro ao carregar mais posts");
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, isLoadingMore, hasMore, postsQuery]);

  // Handle create post
  const handleCreatePost = async () => {
    if (!newPostTitle.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Faça login para participar da comunidade.", {
        action: {
          label: "Login",
          onClick: () => window.location.href = "/",
        },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPostMutation.mutateAsync({
        title: newPostTitle.trim(),
        description: newPostContent.trim() || undefined,
        category: newPostCategory,
      });

      // Adicionar post novo no topo do feed local
      if (result.success && result.post) {
        const newPost: LocalPost = {
          id: result.post.id,
          title: result.post.title,
          description: result.post.description,
          category: result.post.category,
          votes: result.post.votes,
          authorName: result.post.authorName || "Você",
          createdAt: result.post.createdAt,
          hasVoted: false,
          isVoting: false,
        };
        setLocalPosts(prev => [newPost, ...prev]);
      }

      // Limpar form
      setNewPostTitle("");
      setNewPostContent("");
      
      toast.success("Post publicado! 🔥", {
        description: "Sua contribuição foi compartilhada com a comunidade.",
      });
    } catch (error: any) {
      console.error("Error creating post:", error);
      
      // Verificar se é erro de autenticação
      if (error?.data?.code === "UNAUTHORIZED" || error?.message?.includes("UNAUTHORIZED")) {
        toast.error("Faça login para participar da comunidade.", {
          action: {
            label: "Login",
            onClick: () => window.location.href = "/",
          },
        });
      } else {
        toast.error("Erro ao criar post. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle vote (toggle com update otimista)
  const handleVote = useCallback(async (postId: number) => {
    if (!isAuthenticated) {
      toast.error("Faça login para votar na comunidade.", {
        action: {
          label: "Login",
          onClick: () => window.location.href = "/",
        },
      });
      return;
    }

    // Encontrar post atual
    const postIndex = localPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const post = localPosts[postIndex];
    
    // Evitar cliques duplos
    if (post.isVoting) return;

    // Update otimista
    const wasVoted = post.hasVoted;
    const optimisticVotes = wasVoted ? post.votes - 1 : post.votes + 1;
    
    setLocalPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, hasVoted: !wasVoted, votes: optimisticVotes, isVoting: true }
        : p
    ));

    try {
      const result = await votePostMutation.mutateAsync({
        postId,
        voteType: "LIKE",
      });

      // Atualizar com valor real do servidor
      setLocalPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, hasVoted: result.hasVoted, votes: result.newVoteCount, isVoting: false }
          : p
      ));

      // Feedback sutil
      if (result.hasVoted) {
        toast.success("🔥", { duration: 1000 });
      }
    } catch (error: any) {
      console.error("Error voting:", error);
      
      // Reverter update otimista
      setLocalPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, hasVoted: wasVoted, votes: post.votes, isVoting: false }
          : p
      ));

      // Verificar se é erro de autenticação
      if (error?.data?.code === "UNAUTHORIZED" || error?.message?.includes("UNAUTHORIZED")) {
        toast.error("Faça login para votar na comunidade.", {
          action: {
            label: "Login",
            onClick: () => window.location.href = "/",
          },
        });
      } else {
        toast.error("Erro ao votar. Tente novamente.");
      }
    }
  }, [isAuthenticated, localPosts, votePostMutation]);

  // Se não autenticado, mostra mensagem
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900">
        <Card className="bg-gray-800/50 border-gray-700 p-8 text-center max-w-md">
          <Users className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Comunidade BROCRAFT</h2>
          <p className="text-gray-400 mb-6">
            Faça login para participar da comunidade, compartilhar suas criações e votar nos melhores posts!
          </p>
          <Button
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            onClick={() => window.location.href = "/"}
          >
            Fazer Login
          </Button>
        </Card>
      </div>
    );
  }

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
            <Users className="h-8 w-8 text-orange-500" />
            Comunidade
          </h1>
          <p className="text-gray-400 text-lg">
            Compartilhe suas criações e aprenda com outros Bros fermentadores.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Form */}
            <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-400" />
                Compartilhar com a Comunidade
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="post-title" className="block text-sm text-gray-400 mb-1">
                    Título *
                  </label>
                  <Input
                    id="post-title"
                    placeholder="Ex: Minha primeira IPA caseira!"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    maxLength={255}
                    className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="post-content" className="block text-sm text-gray-400 mb-1">
                    Conteúdo
                  </label>
                  <Textarea
                    id="post-content"
                    placeholder="Conte mais sobre sua experiência..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    maxLength={5000}
                    className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 min-h-[100px]"
                  />
                </div>
                
                <div>
                  <label htmlFor="post-category" className="block text-sm text-gray-400 mb-1">
                    Categoria
                  </label>
                  <select
                    id="post-category"
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value as CommunityCategory)}
                    className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-md px-3 py-2"
                  >
                    {COMMUNITY_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Button
                  onClick={handleCreatePost}
                  disabled={isSubmitting || !newPostTitle.trim()}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publicar
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-400" />
                Posts Recentes
              </h3>

              {postsQuery.isLoading && !hasLoadedInitial ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : postsQuery.error ? (
                <Card className="bg-red-900/20 border-red-500/30 p-6 text-center">
                  <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <p className="text-red-300">
                    Não foi possível carregar a comunidade. Tente novamente em alguns instantes.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 border-red-500/50 text-red-300"
                    onClick={() => {
                      setHasLoadedInitial(false);
                      postsQuery.refetch();
                    }}
                  >
                    Tentar Novamente
                  </Button>
                </Card>
              ) : localPosts.length === 0 ? (
                <Card className="bg-gray-800/30 border-gray-700/50 p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">
                    Ainda não tem nenhum post.
                  </p>
                  <p className="text-gray-500">
                    Seja o primeiro a compartilhar algo da sua brassagem! 🍺
                  </p>
                </Card>
              ) : (
                <>
                  {localPosts.map((post) => (
                    <Card
                      key={post.id}
                      className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm p-5 hover:border-orange-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Category Badge */}
                          <span className="inline-block text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full mb-2">
                            {COMMUNITY_CATEGORIES.find(c => c.value === post.category)?.label || post.category}
                          </span>
                          
                          {/* Title */}
                          <h4 className="text-lg font-bold text-white mb-1 line-clamp-2">
                            {post.title}
                          </h4>
                          
                          {/* Description */}
                          {post.description && (
                            <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                              {post.description}
                            </p>
                          )}
                          
                          {/* Author & Date */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="font-semibold text-gray-400">
                              {post.authorName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeDate(post.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Vote Button */}
                        <div className="flex flex-col items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(post.id)}
                            disabled={post.isVoting}
                            aria-label={post.hasVoted ? "Remover voto deste post" : "Votar neste post"}
                            title={post.hasVoted ? "Clique para remover voto" : "Clique para votar"}
                            className={`p-2 transition-all ${
                              post.hasVoted
                                ? "text-red-400 bg-red-500/20 hover:bg-red-500/30"
                                : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                            }`}
                          >
                            {post.isVoting ? (
                              <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                              <Heart
                                className={`h-6 w-6 transition-all ${post.hasVoted ? "fill-current scale-110" : ""}`}
                              />
                            )}
                          </Button>
                          <span className={`text-sm font-bold transition-colors ${
                            post.hasVoted ? "text-red-400" : "text-gray-300"
                          }`}>
                            {post.votes}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={loadMorePosts}
                        disabled={isLoadingMore}
                        className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Carregando...
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Carregar mais
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar - Leaderboard */}
          <div className="space-y-6">
            <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Top Bros da Comunidade
              </h3>

              {/* Timeframe Selector */}
              <div className="flex gap-2 mb-4">
                {(["ALL", "WEEK", "MONTH"] as LeaderboardTimeframe[]).map((tf) => (
                  <Button
                    key={tf}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`flex-1 text-xs ${
                      selectedTimeframe === tf
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {TIMEFRAME_LABELS[tf]}
                  </Button>
                ))}
              </div>

              {/* Leaderboard List */}
              {leaderboardQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                </div>
              ) : leaderboardQuery.error ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  Erro ao carregar leaderboard
                </p>
              ) : !leaderboardQuery.data?.length ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  Nenhum post neste período
                </p>
              ) : (
                <div className="space-y-3">
                  {leaderboardQuery.data.slice(0, 5).map((post, idx) => (
                    <div
                      key={post.id}
                      className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg"
                    >
                      {/* Position */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          idx === 0
                            ? "bg-yellow-500/20 text-yellow-400"
                            : idx === 1
                            ? "bg-gray-400/20 text-gray-300"
                            : idx === 2
                            ? "bg-orange-600/20 text-orange-400"
                            : "bg-gray-700/30 text-gray-500"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {post.authorName}
                        </p>
                      </div>
                      
                      {/* Votes */}
                      <div className="flex items-center gap-1 text-orange-400">
                        <Heart className="h-4 w-4" />
                        <span className="text-sm font-bold">{post.votes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border-orange-500/30 p-6">
              <h4 className="text-sm font-bold text-orange-300 uppercase tracking-wider mb-3">
                Estatísticas da Comunidade
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total de Posts</span>
                  <span className="font-bold text-white">
                    {localPosts.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Top desta semana</span>
                  <span className="font-bold text-white">
                    {leaderboardQuery.data?.[0]?.votes || 0} votos
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
