export default {
  async fetch(request, env) {
    try {
      // Validate environment variables
      if (!env.GITHUB_TOKEN || !env.GIST_ID) {
        throw new Error('Required environment variables GITHUB_TOKEN and/or GIST_ID are missing');
      }
      
      // CORS headers for GitHub Pages and local development
      const corsHeaders = {
        'Access-Control-Allow-Origin': request.headers.get('Origin') || 'https://mahi664.github.io',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true'
      };

      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      const url = new URL(request.url);

      if (url.pathname === '/state') {
        const headers = {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Cloudflare-Worker'  // Added User-Agent header
        };

        if (request.method === 'GET') {
          try {
            const response = await fetch(`https://api.github.com/gists/${env.GIST_ID}`, { 
              headers 
            });
            
            if (!response.ok) {
              const error = await response.text();
              console.error('GitHub API Error:', error);
              return new Response(error, {
                status: response.status,
                headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
              });
            }

            const data = await response.json();
            
            if (!data.files || !data.files['guestState.json']) {
              return new Response('Gist file "guestState.json" not found', {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
              });
            }

            return new Response(data.files['guestState.json'].content, {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          } catch (error) {
            console.error('Error handling GET request:', error);
            return new Response(error.message, {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
            });
          }
        }

        if (request.method === 'POST') {
          try {
            const state = await request.json();
            const response = await fetch(`https://api.github.com/gists/${env.GIST_ID}`, {
              method: 'PATCH',
              headers,
              body: JSON.stringify({
                files: {
                  'guestState.json': {
                    content: JSON.stringify(state)
                  }
                }
              })
            });

            if (!response.ok) {
              const error = await response.text();
              console.error('GitHub API Error:', error);
              return new Response(error, {
                status: response.status,
                headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
              });
            }

            return new Response(null, {
              status: 200,
              headers: corsHeaders
            });
          } catch (error) {
            console.error('Error handling POST request:', error);
            return new Response(error.message, {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
            });
          }
        }
      }

      return new Response('Not Found', { 
        status: 404, 
        headers: corsHeaders 
      });
    } catch (error) {
      console.error('Worker Error:', error);
      return new Response(error.message, {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': request.headers.get('Origin') || 'https://mahi664.github.io',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
    }
  }
};