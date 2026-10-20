// netlify/functions/fetch-facebook.js
const axios = require('axios');

// Sistema simple de caché en memoria para no saturar la API de Meta
let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos en milisegundos

exports.handler = async (event, context) => {
  const now = Date.now();

  // Si tenemos datos en caché de hace menos de 15 minutos, los devolvemos directamente
  if (cachedData && (now - lastFetchTime < CACHE_DURATION)) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'cache', posts: cachedData })
    };
  }

  const PAGE_ID = process.env.FB_PAGE_ID;
  const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

  // Endpoint de Meta para traer posts con mensaje, imágenes y fecha
  const url = `https://graph.facebook.com/v19.0/${PAGE_ID}/posts?fields=id,message,created_time,full_picture,permalink_url,shares,reactions.summary(true),comments.summary(true)&limit=6&access_token=${ACCESS_TOKEN}`;

  try {
    const response = await axios.get(url);
    cachedData = response.data.data;
    lastFetchTime = now;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ source: 'api', posts: cachedData })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al consultar la API de Facebook', details: error.message })
    };
  }
};