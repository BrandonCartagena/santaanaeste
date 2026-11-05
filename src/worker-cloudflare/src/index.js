const DEFAULT_LIMIT = 6;

function buildCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function parseLimit(value) {
  const nextLimit = Number(value ?? DEFAULT_LIMIT);

  if (!Number.isFinite(nextLimit) || nextLimit <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(nextLimit, 6);
}

function sortByCreatedAtDesc(items = []) {
  return [...items].sort((a, b) => new Date(b.created_time) - new Date(a.created_time));
}

function buildBalancedFeed(facebookPosts = [], instagramPosts = [], limit = DEFAULT_LIMIT) {
  const safeLimit = parseLimit(limit);
  const sortedFacebook = sortByCreatedAtDesc(facebookPosts);
  const sortedInstagram = sortByCreatedAtDesc(instagramPosts);

  if (safeLimit <= 1 || !sortedFacebook.length || !sortedInstagram.length) {
    return sortByCreatedAtDesc([...sortedFacebook, ...sortedInstagram]).slice(0, safeLimit);
  }

  const maxPerPlatform = Math.max(1, Math.floor(safeLimit / 2));
  const selected = [
    ...sortedFacebook.slice(0, maxPerPlatform),
    ...sortedInstagram.slice(0, maxPerPlatform),
  ];

  const selectedIds = new Set(selected.map((item) => item.id).filter(Boolean));
  const remainingPool = sortByCreatedAtDesc([...sortedFacebook, ...sortedInstagram]).filter(
    (item) => !item.id || !selectedIds.has(item.id)
  );

  while (selected.length < safeLimit && remainingPool.length) {
    selected.push(remainingPool.shift());
  }

  return sortByCreatedAtDesc(selected).slice(0, safeLimit);
}

function normalizeFacebookItem(item) {
  const createdAt = item.created_time || item.timestamp || new Date().toISOString();
  const reactionsCount = item.reactions?.summary?.total_count ?? null;
  const commentsCount = item.comments?.summary?.total_count ?? null;
  const sharesCount = item.shares?.count ?? null;

  return {
    id: item.id,
    source: 'facebook',
    platform: 'facebook',
    message: item.message || 'Publicación de Facebook',
    created_time: createdAt,
    createdAt,
    permalink_url: item.permalink_url || '#',
    full_picture: item.full_picture || '',
    image: item.full_picture || '',
    media_url: item.full_picture || '',
    likes_count: reactionsCount,
    comments_count: commentsCount,
    shares_count: sharesCount,
  };
}

function normalizeInstagramItem(item) {
  const createdAt = item.timestamp || item.created_time || new Date().toISOString();
  const caption = item.caption || 'Publicación de Instagram';

  return {
    id: item.id,
    source: 'instagram',
    platform: 'instagram',
    message: caption,
    created_time: createdAt,
    createdAt,
    permalink_url: item.permalink || '#',
    full_picture: item.media_url || item.thumbnail_url || '',
    image: item.media_url || item.thumbnail_url || '',
    media_url: item.media_url || item.thumbnail_url || '',
  };
}

export default {
  async fetch(request, env) {
    const corsHeaders = buildCorsHeaders();
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (!env.FB_PAGE_ID || !env.IG_ACCOUNT_ID || !env.META_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({
          error: 'Faltan variables de entorno en Cloudflare',
          source: 'cloudflare-worker',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const limit = parseLimit(url.searchParams.get('limit'));
    const fbUrl = `https://graph.facebook.com/v19.0/${env.FB_PAGE_ID}/posts?fields=id,message,created_time,full_picture,permalink_url,reactions.limit(0).summary(true),comments.limit(0).summary(true),shares&limit=${limit}&access_token=${env.META_ACCESS_TOKEN}`;
    const igUrl = `https://graph.facebook.com/v19.0/${env.IG_ACCOUNT_ID}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=${limit}&access_token=${env.META_ACCESS_TOKEN}`;

    try {
      const [fbResponse, igResponse] = await Promise.all([fetch(fbUrl), fetch(igUrl)]);
      const fbData = await fbResponse.json();
      const igData = await igResponse.json();

      const facebookPosts = (fbData.data || []).map(normalizeFacebookItem);
      const instagramPosts = (igData.data || []).map(normalizeInstagramItem);
      const allPosts = buildBalancedFeed(facebookPosts, instagramPosts, limit);

      return new Response(
        JSON.stringify({
          posts: allPosts,
          source: 'cloudflare-worker',
          total: allPosts.length,
          facebook: facebookPosts.length,
          instagram: instagramPosts.length,
          errors: {
            facebook: fbData.error || null,
            instagram: igData.error || null,
          },
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error fatal en el Worker:', error.message);
      return new Response(
        JSON.stringify({
          error: 'Error interno del Worker',
          detalle: error.message,
          source: 'cloudflare-worker',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};