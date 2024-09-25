import axios from 'axios';
import cheerio from 'cheerio';

export default async function handler(req, res) {
    const query = req.query.query || ''; // Default to empty search if no query
    const url = `https://www.xvideos.com/?k=${query}`; // Xvideos search URL

    try {
        // Fetch the HTML of the page
        const { data } = await axios.get(url);
        const $ = cheerio.load(data); // Load HTML into cheerio parser

        // Array to hold video details
        let videoList = [];

        // Select video blocks from the Xvideos page
        $('.thumb-block').each((index, element) => {
            const title = $(element).find('.thumb-under h3 a').text().trim();
            const embedUrl = 'https://www.xvideos.com' + $(element).find('a').attr('href');
            const thumbnail = $(element).find('.thumb img').attr('data-src');

            // Push each video’s data into videoList array
            videoList.push({
                title,
                embedUrl,
                thumbnail
            });
        });

        // Send JSON response containing scraped video data
        res.status(200).json(videoList);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Failed to fetch data from Xvideos' });
    }
}
