// Run this script after page load
document.addEventListener('DOMContentLoaded', () => {
    fetchVideos(); // Load initial videos
});

// Age verification logic
function verifyAge() {
    document.getElementById('age-verification').style.display = 'none';
}

// Fetch videos from Vercel API
async function fetchVideos(query = '') {
    const videoGallery = document.getElementById('video-gallery');
    videoGallery.innerHTML = ''; // Clear previous videos

    try {
        // Fetch data from Vercel backend API route
        const response = await fetch(`/api/fetch?query=${query}`);
        const videos = await response.json();

        // Iterate through each video and display it on the page
        videos.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.classList.add('video');
            videoElement.innerHTML = `
                <img src="${video.thumbnail}" alt="${video.title}">
                <a href="${video.embedUrl}" target="_blank">
                    <h3>${video.title}</h3>
                </a>
            `;
            videoGallery.appendChild(videoElement);
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
    }
}

// Search functionality
function searchVideos() {
    const query = document.getElementById('search-bar').value;
    fetchVideos(query); // Fetch videos based on search query
}
