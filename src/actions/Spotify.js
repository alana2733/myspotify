import axios from 'axios';

export const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID; // Client ID từ Spotify
export const REDIRECT_URI = "http://localhost:3000/callback";
export const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
export const RESPONSE_TYPE = "token";

// Hàm để lấy thông tin playlist
export const getPlaylist = async (token, playlistId) => {
    const allTracks = []; // Mảng để lưu trữ tất cả bài hát
    let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`; // Đường dẫn để lấy bài hát
    console.log("Current token:", token);
    console.log("Fetching playlist for ID:", playlistId);


    try {
        do {
            const response = await axios.get(nextUrl, {
                headers: {
                    Authorization: `Bearer ${token}`, // Dùng token để xác thực
                },
            });

            // Thêm các bài hát vào mảng
            allTracks.push(...response.data.items);
            nextUrl = response.data.next; // Cập nhật URL để lấy trang tiếp theo
        } while (nextUrl); // Tiếp tục nếu còn URL tiếp theo

        return { tracks: { items: allTracks } }; // Trả về đối tượng chứa tất cả bài hát
    } catch (error) {
        console.error("Error fetching playlist", error);
        throw error; // Ném lỗi nếu có vấn đề xảy ra
    }
};
