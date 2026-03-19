// Netlify Function — Proxy Twitch API
// Fichier à placer dans : netlify/functions/twitch.js

exports.handler = async function(event, context) {

    const CLIENT_ID     = process.env.TWITCH_CLIENT_ID;
    const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
    const USERNAME      = 'pligamstag';

    // Headers CORS pour autoriser ton site à appeler cette fonction
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    try {
        // 1. Obtenir un token d'accès Twitch
        const tokenRes = await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
            { method: 'POST' }
        );
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        if (!accessToken) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Token Twitch invalide' })
            };
        }

        const twitchHeaders = {
            'Client-Id': CLIENT_ID,
            'Authorization': `Bearer ${accessToken}`
        };

        // 2. Récupérer les infos de l'utilisateur (pour avoir son ID)
        const userRes = await fetch(
            `https://api.twitch.tv/helix/users?login=${USERNAME}`,
            { headers: twitchHeaders }
        );
        const userData = await userRes.json();
        const user = userData.data?.[0];

        if (!user) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Utilisateur Twitch introuvable' })
            };
        }

        // 3. Vérifier si le stream est en direct
        const streamRes = await fetch(
            `https://api.twitch.tv/helix/streams?user_login=${USERNAME}`,
            { headers: twitchHeaders }
        );
        const streamData = await streamRes.json();
        const stream = streamData.data?.[0];
        const isLive = !!stream;

        // 4. Récupérer le nombre de followers
        const followersRes = await fetch(
            `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${user.id}`,
            { headers: twitchHeaders }
        );
        const followersData = await followersRes.json();
        const followers = followersData.total ?? 0;

        // 5. Retourner toutes les infos
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                isLive,
                viewers: stream?.viewer_count ?? 0,
                title: stream?.title ?? '',
                followers
            })
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message })
        };
    }
};
