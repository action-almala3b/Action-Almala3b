export default async function handler(req, res) {
  const VAST_URL = 'https://faithfuloccasion.com/damWF/zXd.GSNjvGZ/GLUb/le/mz9QurZCUklgkSPjT/Ya5YOhDYc_zZNTTMMJtGN-jZkh4lNvzRMN1ENXwj';
  try {
    const response = await fetch(VAST_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const data = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/xml');
    res.send(data);
  } catch(e) {
    res.status(500).send('Error: ' + e.message);
  }
}
