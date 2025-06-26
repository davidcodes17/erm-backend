import axios from 'axios';

export async function getSpotifyAccessToken(): Promise<string> {
  const res = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
          ).toString('base64'),
      },
    }
  );

  return res.data.access_token;
}

export async function searchSpotifyTracks(token: string, query: string) {
  const res = await axios.get('https://api.spotify.com/v1/search', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      q: query,
      type: 'track',
      limit: 10,
    },
  });

  return res.data.tracks.items.map((track: any) => ({
    name: track.name,
    artist: track.artists[0].name,
    url: track.external_urls.spotify,
    preview: track.preview_url,
  }));
}
