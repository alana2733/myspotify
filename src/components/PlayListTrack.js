import React, { useEffect, useState, useRef, memo } from "react";
import PropTypes from 'prop-types';
import { getPlaylist } from "../actions/Spotify";
import "./PlayListTrack.css";

const TrackItem = memo(({ track, onPlay }) => {
    return (
        <div className="track-item" onClick={onPlay}>
            {track.album.images[0] && (
                <img
                    src={track.album.images[0].url}
                    alt={track.name}
                    className="track-album-image"
                />
            )}
            <p className="track-title">{track.name}</p>
        </div>
    );
});

const PlayListTrack = ({ token, playlistId }) => {
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const audioRefs = useRef({});
    const [isPlaying, setIsPlaying] = useState(false);
    const [showNoPreviewModal, setShowNoPreviewModal] = useState(false);

    useEffect(() => {
        const fetchPlaylist = async () => {
            if (!token) {
                console.error("No token available");
                return;
            }
            try {
                const data = await getPlaylist(token, playlistId);
                console.log("Fetched playlist data:", data); // Log dữ liệu nhận được
                setPlaylist(data);
            } catch (error) {
                console.error("Failed to fetch playlist", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchPlaylist();
    }, [token, playlistId]);    

    const handlePlay = (trackId) => {
        const track = playlist.tracks.items.find(item => item.track.id === trackId);
        if (!track.track.preview_url) {
            setErrorMessage("No preview available for this track.");
            setShowNoPreviewModal(true);
            return;
        }

        // Dừng bài đang phát nếu có
        if (currentTrack && audioRefs.current[currentTrack]) {
            audioRefs.current[currentTrack].pause();
            audioRefs.current[currentTrack].currentTime = 0; // Đưa bài hát về đầu
        }

        // Thiết lập trackId cho bài hát mới và phát
        setCurrentTrack(trackId);
        setIsPlaying(true);
        setErrorMessage("");
    };

    const handlePlayPause = () => {
        if (audioRefs.current[currentTrack]) {
            if (isPlaying) {
                audioRefs.current[currentTrack].pause();
            } else {
                audioRefs.current[currentTrack].play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleNextTrack = () => {
        const currentIndex = playlist.tracks.items.findIndex(item => item.track.id === currentTrack);
        const nextTrackIndex = (currentIndex + 1) % playlist.tracks.items.length;
        const nextTrack = playlist.tracks.items[nextTrackIndex];
        handlePlay(nextTrack.track.id);
    };

    const handlePreviousTrack = () => {
        const currentIndex = playlist.tracks.items.findIndex(item => item.track.id === currentTrack);
        const prevTrackIndex = (currentIndex - 1 + playlist.tracks.items.length) % playlist.tracks.items.length;
        const prevTrack = playlist.tracks.items[prevTrackIndex];
        handlePlay(prevTrack.track.id);
    };

    const closeModal = () => {
        setCurrentTrack(null);
        setIsPlaying(false);
        setShowNoPreviewModal(false);
    };

    // Tự động phát bài mới
    useEffect(() => {
        if (currentTrack && audioRefs.current[currentTrack]) {
            audioRefs.current[currentTrack].play();
        }
    }, [currentTrack]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!playlist || !playlist.tracks || !playlist.tracks.items.length) {
        return <div>No playlist found or no tracks available</div>;
    }

    const currentTrackDetails = playlist.tracks.items.find(item => item.track.id === currentTrack);

    return (
        <div className="playlist-container">
            <h3 className="playlist-title">Playlist Track</h3>
            <div className="tracks-grid">
                {playlist.tracks.items.map(item => (
                    <TrackItem
                        key={item.track.id}
                        track={item.track}
                        onPlay={() => handlePlay(item.track.id)}
                    />
                ))}
            </div>
            {currentTrack && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        {currentTrackDetails ? (
                            <>
                                <div className="track-player">
                                    <img
                                        src={currentTrackDetails.track.album.images[0].url}
                                        alt={currentTrackDetails.track.name}
                                        className="track-player-image"
                                    />
                                    <div className="track-info">
                                        <h4 className="track-title">{currentTrackDetails.track.name}</h4>
                                        <p className="track-artists">
                                            {currentTrackDetails.track.artists.map(artist => artist.name).join(", ")}
                                        </p>
                                    </div>
                                </div>
                                <div className="track-controls">
                                    <button onClick={handlePreviousTrack} className="arrow-button">←</button>
                                    <audio
                                        controls
                                        className="track-audio"
                                        ref={el => {
                                            if (el) {
                                                audioRefs.current[currentTrack] = el; // Ghi nhận tham chiếu audio
                                            }
                                        }}
                                        src={currentTrackDetails.track.preview_url} // Thêm src vào audio
                                        autoPlay // Tự động phát bài mới
                                    >
                                        Your browser does not support the audio element.
                                    </audio>
                                    <button onClick={handleNextTrack} className="arrow-button">→</button>
                                </div>
                            </>
                        ) : (
                            <p>No preview available for this track.</p>
                        )}
                    </div>
                </div>
            )}

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <p>Note: The previews are limited to 30 seconds for each track.</p>
            
            {/* Modal thông báo không có preview */}
            {showNoPreviewModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <p>No preview available for this track.</p>
                        <button onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

PlayListTrack.propTypes = {
    token: PropTypes.string.isRequired,
    playlistId: PropTypes.string.isRequired,
};

export default PlayListTrack;