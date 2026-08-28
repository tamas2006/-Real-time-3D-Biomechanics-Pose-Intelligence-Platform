'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music2, LogIn, ExternalLink, RefreshCw } from 'lucide-react';
import { sounds } from '@/lib/soundEffects';

interface LiveSpotifyTrack {
  title: string;
  artist: string;
  albumArt: string;
  progressMs: number;
  durationMs: number;
  isPlaying: boolean;
  bpm: number;
}

// -------------------------------------------------------------------
// PKCE Cryptographic Helpers for response_type=code
// -------------------------------------------------------------------
function generateCodeVerifier(length = 64) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export const SpotifyStation: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clientId, setClientId] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<string>('Ready');
  const [isLoading, setIsLoading] = useState(false);

  // Live Track State
  const [liveTrack, setLiveTrack] = useState<LiveSpotifyTrack>({
    title: 'GigaChad Theme (Phonk Remix)',
    artist: 'Gym League & SXID',
    albumArt: '/coach_pfp.jpg',
    progressMs: 42000,
    durationMs: 165000,
    isPlaying: false,
    bpm: 142
  });

  // -------------------------------------------------------------------
  // 1. Handle OAuth Return with ?code=... (response_type=code Exchange)
  // -------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedClientId = localStorage.getItem('spotify_client_id') || 'f8888062820d4e9d8920fa58eb0fa3b4';
    setClientId(savedClientId);

    const savedToken = localStorage.getItem('spotify_token');
    if (savedToken) {
      setToken(savedToken);
      setIsConnected(true);
      fetchSpotifyLiveSong(savedToken);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      const verifier = localStorage.getItem('spotify_code_verifier');
      const activeClientId = localStorage.getItem('spotify_client_id') || savedClientId;

      if (verifier) {
        setIsLoading(true);
        // Exchange code for access_token
        fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            client_id: activeClientId,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: window.location.origin,
            code_verifier: verifier
          })
        })
          .then((res) => res.json())
          .then((data) => {
            setIsLoading(false);
            if (data.access_token) {
              localStorage.setItem('spotify_token', data.access_token);
              if (data.refresh_token) {
                localStorage.setItem('spotify_refresh_token', data.refresh_token);
              }
              setToken(data.access_token);
              setIsConnected(true);
              setSyncStatus('Connected & Synced');
              // Clear ?code= from URL without reloading
              window.history.replaceState(null, '', window.location.pathname);
              fetchSpotifyLiveSong(data.access_token);
            }
          })
          .catch((err) => {
            setIsLoading(false);
            console.error('Spotify token exchange failed:', err);
          });
      }
    }
  }, []);

  // -------------------------------------------------------------------
  // 2. Real-Time Spotify Live Song Polling
  // -------------------------------------------------------------------
  const fetchSpotifyLiveSong = async (authToken: string) => {
    try {
      const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (res.status === 200) {
        const data = await res.json();
        if (data && data.item) {
          setLiveTrack({
            title: data.item.name,
            artist: data.item.artists.map((a: any) => a.name).join(', '),
            albumArt: data.item.album.images[0]?.url || '/coach_pfp.jpg',
            progressMs: data.progress_ms || 0,
            durationMs: data.item.duration_ms || 180000,
            isPlaying: data.is_playing,
            bpm: 140
          });
          setSyncStatus('Live Syncing');
        }
      } else if (res.status === 204) {
        setSyncStatus('Spotify open (Paused or idle)');
      } else if (res.status === 401) {
        setIsConnected(false);
        localStorage.removeItem('spotify_token');
        setSyncStatus('Session Expired');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Poll Spotify every 2 seconds when connected
  useEffect(() => {
    let interval: any;
    if (isConnected && token) {
      interval = setInterval(() => {
        fetchSpotifyLiveSong(token);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isConnected, token]);

  // Local Scrubber Advance Animation
  useEffect(() => {
    let anim: any;
    if (liveTrack.isPlaying) {
      anim = setInterval(() => {
        setLiveTrack((prev) => ({
          ...prev,
          progressMs: Math.min(prev.durationMs, prev.progressMs + 500)
        }));
      }, 500);
    }
    return () => clearInterval(anim);
  }, [liveTrack.isPlaying]);

  // -------------------------------------------------------------------
  // 3. Initiate PKCE OAuth Flow (response_type=code)
  // -------------------------------------------------------------------
  const handlePkceLogin = async () => {
    sounds.playButtonClick();
    const activeClientId = clientId.trim() || 'f8888062820d4e9d8920fa58eb0fa3b4';
    localStorage.setItem('spotify_client_id', activeClientId);

    const verifier = generateCodeVerifier();
    localStorage.setItem('spotify_code_verifier', verifier);
    const challenge = await generateCodeChallenge(verifier);

    const redirectUri = window.location.origin;
    const scopes = [
      'user-read-currently-playing',
      'user-read-playback-state',
      'user-modify-playback-state'
    ].join('%20');

    // response_type=code with PKCE code_challenge
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${encodeURIComponent(
      activeClientId
    )}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&code_challenge_method=S256&code_challenge=${encodeURIComponent(
      challenge
    )}&scope=${scopes}&show_dialog=true`;

    window.location.href = authUrl;
  };

  const handleRemotePlayPause = async () => {
    sounds.playButtonClick();
    if (!isConnected) {
      setLiveTrack((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
      return;
    }
    try {
      const endpoint = liveTrack.isPlaying
        ? 'https://api.spotify.com/v1/me/player/pause'
        : 'https://api.spotify.com/v1/me/player/play';
      await fetch(endpoint, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiveTrack((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
    } catch (e) {
      setLiveTrack((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  };

  const handleRemoteNext = async () => {
    sounds.playButtonClick();
    if (!isConnected) return;
    try {
      await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimeout(() => fetchSpotifyLiveSong(token), 300);
    } catch (e) {}
  };

  const handleRemotePrev = async () => {
    sounds.playButtonClick();
    if (!isConnected) return;
    try {
      await fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimeout(() => fetchSpotifyLiveSong(token), 300);
    } catch (e) {}
  };

  const formatMs = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = Math.floor(totalSecs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (liveTrack.progressMs / (liveTrack.durationMs || 1)) * 100));

  return (
    <div className="relative p-5 sm:p-6 rounded-[36px] bg-[#0B1120] text-white shadow-[0_25px_60px_rgba(0,0,0,0.45)] border-2 border-white/20 max-w-xl w-full mx-auto flex flex-col gap-4 select-none backdrop-blur-xl">
      {/* Top Header / Spotify Live Status */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected ? 'bg-[#1DB954] animate-pulse shadow-[0_0_8px_#1DB954]' : 'bg-emerald-400'
            }`}
          />
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-300">
            {isConnected ? `● Live Spotify Synced (${syncStatus})` : 'Spotify Workout Radio'}
          </span>
        </div>

        {/* 1-Click Connect Button */}
        <button
          onClick={() => {
            sounds.playButtonClick();
            setShowModal(true);
          }}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 ${
            isConnected
              ? 'bg-[#1DB954] text-white hover:bg-[#1aa34a]'
              : 'bg-white/10 text-[#1DB954] border border-[#1DB954]/50 hover:bg-white/20'
          }`}
        >
          <Music2 className="w-3.5 h-3.5" />
          <span>{isConnected ? 'Synced ✓' : 'Connect Spotify'}</span>
        </button>
      </div>

      {/* Main Player Row */}
      <div className="flex items-center justify-between gap-4 sm:gap-6">
        {/* Left Spinning Vinyl Album Art */}
        <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full vinyl-grooves border-4 border-black/80 shadow-xl flex items-center justify-center bg-black/60">
          <div
            className={`w-full h-full rounded-full flex items-center justify-center p-2.5 ${
              liveTrack.isPlaying ? 'animate-spin-slow' : ''
            }`}
          >
            <img
              src={liveTrack.albumArt}
              alt={liveTrack.title}
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shadow-md"
            />
          </div>
        </div>

        {/* Center Track Details & Live Scrubber */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <h4 className="text-sm font-bold text-white truncate leading-snug">
                {liveTrack.title}
              </h4>
              <p className="text-[11px] font-mono text-slate-400 truncate">
                {liveTrack.artist}
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex-shrink-0">
              {liveTrack.bpm} BPM
            </span>
          </div>

          {/* Live Dynamic Scrubber Bar */}
          <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden p-0.5 border border-white/10 cursor-pointer">
            <div
              className="h-full bg-[#1DB954] rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(29,185,84,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Time & Remote Controls */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {formatMs(liveTrack.progressMs)}
            </span>

            {/* Transport Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRemotePrev}
                className="text-slate-400 hover:text-white transition-colors active:scale-90"
                title="Previous Track"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={handleRemotePlayPause}
                className="w-10 h-10 rounded-full bg-white text-black hover:bg-slate-200 flex items-center justify-center shadow-md active:scale-90 transition-transform"
                title={liveTrack.isPlaying ? 'Pause' : 'Play'}
              >
                {liveTrack.isPlaying ? (
                  <Pause className="w-4 h-4 fill-black text-black" />
                ) : (
                  <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                )}
              </button>

              <button
                onClick={handleRemoteNext}
                className="text-slate-400 hover:text-white transition-colors active:scale-90"
                title="Next Track"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>

            <span className="text-[10px] font-mono font-bold text-slate-400">
              {formatMs(liveTrack.durationMs)}
            </span>
          </div>
        </div>

        {/* Right Vinyl Ring */}
        <div className="hidden sm:flex relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full vinyl-grooves border-4 border-black/80 shadow-xl items-center justify-center bg-black/60">
          <div
            className={`w-full h-full rounded-full flex items-center justify-center ${
              liveTrack.isPlaying ? 'animate-spin-slow' : ''
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-[#1DB954] border-2 border-black flex items-center justify-center font-mono text-[9px] font-bold text-black shadow-inner">
              LIVE
            </div>
          </div>
        </div>
      </div>

      {/* Direct 1-Click Workout Stream Player */}
      <div className="pt-2 border-t border-slate-200/80">
        <iframe
          src="https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP?utm_source=generator&theme=0"
          width="100%"
          height="80"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-2xl shadow-sm"
        />
      </div>

      {/* 1-Click PKCE Connection Modal (response_type=code) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121212] text-white p-6 sm:p-8 rounded-[36px] border border-white/20 max-w-md w-full flex flex-col gap-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#1DB954]">
                <div className="w-8 h-8 rounded-full bg-[#1DB954] text-black flex items-center justify-center">
                  <Music2 className="w-5 h-5 fill-black" />
                </div>
                <h3 className="text-lg font-bold text-white">Connect Your Spotify</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Connect via Spotify OAuth PKCE (<code>response_type=code</code>) to securely sync your live song and progress bar with the workout radio.
            </p>

            {/* Optional Spotify Client ID input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                Your Spotify Client ID (from developer.spotify.com/dashboard)
              </label>
              <input
                type="text"
                placeholder="Enter Spotify Client ID..."
                defaultValue={clientId}
                id="spotifyClientIdInput"
                onChange={(e) => setClientId(e.target.value)}
                className="px-4 py-2 rounded-xl bg-black/60 border border-white/20 text-xs font-mono text-white outline-none focus:border-[#1DB954]"
              />
            </div>

            {/* Big 1-Click Official Spotify Login Button with response_type=code */}
            <button
              onClick={handlePkceLogin}
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Authorizing...' : 'Log In with Spotify (response_type=code)'}</span>
            </button>

            {/* Direct Token Paste Option */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
              <span className="text-[11px] font-mono font-bold text-slate-300">
                Or Paste Access Token Directly:
              </span>
              <input
                type="password"
                placeholder="Paste Spotify Token (BQ...)"
                defaultValue={token}
                id="directToken"
                className="px-4 py-2 rounded-xl bg-black/60 border border-white/20 text-xs font-mono text-white outline-none focus:border-[#1DB954]"
              />
              <button
                onClick={() => {
                  const el = document.getElementById('directToken') as HTMLInputElement;
                  if (el && el.value.trim()) {
                    sounds.playButtonClick();
                    setToken(el.value.trim());
                    localStorage.setItem('spotify_token', el.value.trim());
                    setIsConnected(true);
                    setShowModal(false);
                    fetchSpotifyLiveSong(el.value.trim());
                  }
                }}
                className="mt-1 py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold transition-colors"
              >
                Save Token & Connect
              </button>
            </div>

            {isConnected && (
              <button
                onClick={() => {
                  localStorage.removeItem('spotify_token');
                  localStorage.removeItem('spotify_code_verifier');
                  setToken('');
                  setIsConnected(false);
                  setShowModal(false);
                }}
                className="text-xs font-mono text-red-400 hover:underline self-center"
              >
                Disconnect Spotify
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
