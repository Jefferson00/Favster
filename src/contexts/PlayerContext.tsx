import { createContext, ReactNode, useContext, useState } from 'react';


type Track = {
    title: string;
    artistName: string;
    albumName: string;
    image: string;
    duration: number;
    url: string;
};

type PlayerContextData = {
    trackList: Track[];
    currentTrackIndex: number;
    isPlaying: boolean;
    hasPrevious: boolean;
    hasNext: boolean;
    isLooping: boolean;
    isShuffling: boolean;
    play: (episode: Track) => void;
    playList: (list: Track[], index: number) => void;
    setPlayingState: (state: boolean) => void;
    togglePlay: () => void;
    playNext: () => void;
    playPrevious: () => void;
    toggleLoop: () => void;
    toggleShuffle: () => void;
    clearPlayerState: () => void;
};

type PlayerContextProviderProps = {
    children: ReactNode;
}

export const PlayerContext = createContext({} as PlayerContextData);

export function PlayerContextProvider({ children }: PlayerContextProviderProps) {
    const [trackList, setTrackList] = useState([])
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLooping, setIsLooping] = useState(false)
    const [isShuffling, setIsShuffling] = useState(false)

    function play(episode: Track) {
        setTrackList([episode])
        setCurrentTrackIndex(0)
        setIsPlaying(true)
    }

    function playList(list: Track[], index: number) {
        setTrackList(list);
        setCurrentTrackIndex(index);
        setIsPlaying(true);
    }

    function togglePlay() {
        setIsPlaying(!isPlaying)
    }

    function toggleLoop() {
        setIsLooping(!isLooping)
    }

    function toggleShuffle() {
        setIsShuffling(!isShuffling)
    }

    function setPlayingState(state: boolean) {
        setIsPlaying(state)
    }

    const hasPrevious = currentTrackIndex > 0;
    const hasNext = isShuffling || (currentTrackIndex + 1) < trackList.length;

    function playNext() {
        if (isShuffling) {
            const nextRandomTrackIndex = Math.floor(Math.random() * trackList.length);

            setCurrentTrackIndex(nextRandomTrackIndex)
        } else if (hasNext) {
            setCurrentTrackIndex(currentTrackIndex + 1)
        }
    }

    function playPrevious() {
        if (hasPrevious) {
            setCurrentTrackIndex(currentTrackIndex - 1);
        }
    }

    function clearPlayerState() {
        setTrackList([])
        setCurrentTrackIndex(0)
        setIsPlaying(false)
    }

    return (
        <PlayerContext.Provider
            value={{
                trackList,
                isPlaying,
                currentTrackIndex,
                hasPrevious,
                hasNext,
                isLooping,
                isShuffling,
                play,
                togglePlay,
                setPlayingState,
                playList,
                playPrevious,
                playNext,
                toggleLoop,
                toggleShuffle,
                clearPlayerState,
            }}
        >
            {children}
        </PlayerContext.Provider>
    )
}

export const usePlayer = () => {
    return useContext(PlayerContext)
}