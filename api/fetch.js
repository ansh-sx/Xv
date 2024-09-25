import axios from 'axios';
import cheerio from 'cheerio';

export default async function handler(req, res) {
    const query = req.query.query || '';
    const url = `https://spankbang.com/s/${query}`; // SpankBang search URL

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const videoList = [];

        // SpankBang video selector (structure may differ based on site changes)
        $('.video-item').each((index, element) => {
            const title = $(element).find('.title').text().trim();
            const embedUrl = 'https://spankbang.com' + $(element).find('a').attr('href');
            const thumbnail = $(element).find('.thumb').attr('src');

            videoList.push({
                title,
                embedUrl,
                thumbnail
            });
        });

        res.status(200).json(videoList);
    } catch (error) {
        console.error('Error fetching videos from SpankBang:', error);
        res.status(500).json({ error: 'Failed to fetch data from SpankBang' });
    }
}
