import React, { useEffect, useState } from "react";
import { AUTH_ENDPOINT, CLIENT_ID, REDIRECT_URI } from "../actions/Spotify"; // Import các hằng số
import Button from '@mui/material/Button'; // Import Button từ MUI
import PlayListTrack from "./PlayListTrack"; // Nhập PlayListTrack

function SpotifyLogin() {
    const [token, setToken] = useState("");

    useEffect(() => {
        const hash = window.location.hash;
        let token = window.localStorage.getItem("token");
    
        if (!token && hash) {
            token = hash
                .substring(1)
                .split("&")
                .find(elem => elem.startsWith("access_token"))
                .split("=")[1];
        
            window.location.hash = ""; // Xóa token khỏi URL
            window.localStorage.setItem("token", token); // Lưu token vào localStorage
            setToken(token);
        } else {
            setToken(token);
        }
    }, []);            

    const handleLogin = () => {
        const scope = "playlist-read-private playlist-modify-public";
        const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${scope}`;
        console.log("Login URL:", loginUrl);  // Thêm dòng này để kiểm tra
        window.location.href = loginUrl;
    };                  

    const handleLogout = () => {
        setToken("");
        window.localStorage.removeItem("token");
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h2>Login to Spotify</h2>
            {!token ? ( // Kiểm tra xem có token không
                <Button variant="contained" onClick={handleLogin}>
                    Login with Spotify
                </Button>
            ) : (
                <div>
                    <Button variant="contained" onClick={handleLogout}>
                        Log out
                    </Button>
                    <h3>Have a good day</h3>
                    <PlayListTrack token={token} playlistId="54ZA9LXFvvFujmOVWXpHga" />
                </div>
            )}
        </div>
    );
}

export default SpotifyLogin;