import { AxiosResponse } from "axios";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import api from "../services/api";

type Data = {
  id: string;
  name: string;
  image: string | null;
  link: string;
  type: string;
  subtitle?: string;
  previewURL?: string;
  duration?: number;
  albumName?: string;
  artistName?: string;
};

type SearchContextData = {
  searchAll: (searchContent: string) => Promise<void>;
  handleChangeSearchContent: (value: string) => void;
  artists: Data[];
  albums: Data[];
  tracks: Data[];
  searchLoading: boolean;
  searchContent: string;
}

type SearchContextProviderProps = {
  children: ReactNode;
}

export const SearchContext = createContext({} as SearchContextData);

export function SearchContextProvider({ children }: SearchContextProviderProps) {
  const API_KEY = process.env.NEXT_PUBLIC_NAPSTER_API_KEY;

  const [artists, setArtists] = useState<Data[]>([]);
  const [albums, setAlbums] = useState<Data[]>([]);
  const [tracks, setTracks] = useState<Data[]>([]);

  const [searchContent, setSearchContent] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  function handleChangeSearchContent(value: string) {
    setSearchContent(value);
  }

  async function searchAll(searchContent: string) {
    if (API_KEY && searchContent && searchContent.trim().length > 0) {
      try {
        const result = await api.get(`search?apikey=${API_KEY}&query=${searchContent}&per_type_limit=10`);

        const artistsReturned = await searchArtists(result);
        setArtists(artistsReturned);
        const albumsReturned = await searchAlbum(result);
        setAlbums(albumsReturned);
        const tracksReturned = await searchTracks(result);
        setTracks(tracksReturned);
      } catch (error) {
        alert('Não foi possível retornar o resultado da pesquisa, tente novamente.')
      }
    } else {
      setArtists([]);
    }
  }

  async function searchAlbum(res: AxiosResponse<any>) {
    const albumsArray: [] = res.data.search.data.albums;

    let albumsReturned: Data[] = [];

    try {
      const albumsMapPromises = albumsArray.map(async (album: any) => {
        let { data } = await api.get(`${album.links.images.href}?apikey=${API_KEY}`);
        let imageUrl = null;
        if (data.images.length > 0) {
          imageUrl = data.images[0].url
        }

        albumsReturned.push({
          id: album.id,
          image: imageUrl,
          link: album.href,
          name: album.name,
          type: album.type,
          subtitle: album.artistName,
        });
      });

      await Promise.all(albumsMapPromises);
    } catch (error) {
      console.log(error);
    }
    return albumsReturned;
  }

  async function searchArtists(res: AxiosResponse<any>) {
    const artistsArray: [] = res.data.search.data.artists;
    let artistsReturned: Data[] = [];

    try {
      const artistMapPromises = artistsArray.map(async (artist: any) => {
        let { data } = await api.get(`${artist.links.images.href}?apikey=${API_KEY}`);
        let imageURL = null;
        if (data.images.length > 0) {
          imageURL = data.images[0].url
        }

        artistsReturned.push({
          id: artist.id,
          image: imageURL,
          link: artist.href,
          name: artist.name,
          type: artist.type,
        });

      });
      await Promise.all(artistMapPromises);
    } catch (error) {
      console.log(error);
    }
    return artistsReturned;
  }

  async function searchTracks(res: AxiosResponse<any>) {
    const tracksArray: [] = res.data.search.data.tracks;
    let tracksReturned: Data[] = [];

    try {
      const tracksMapPromises = tracksArray.map(async (track: any) => {
        let albumsResponse = await api.get(`${track.links.albums.href}?apikey=${API_KEY}`);
        let albumImagesLink = albumsResponse.data.albums[0].links.images.href;
        let { data } = await api.get(`${albumImagesLink}?apikey=${API_KEY}`);
        let imageURL = null;
        if (data.images.length > 0) {
          imageURL = data.images[0].url
        }

        tracksReturned.push({
          id: track.id,
          image: imageURL,
          link: track.href,
          name: track.name,
          type: track.type,
          previewURL: track.previewURL,
          albumName: track.albumName,
          artistName: track.artistName,
          duration: track.playbackSeconds,
        });

      });
      await Promise.all(tracksMapPromises);
    } catch (error) {
      console.log(error);
    }
    return tracksReturned;
  }

  useEffect(() => {
    setSearchLoading(true);

    const timer = setTimeout(() => {
      searchAll(searchContent).finally(() => {
        setSearchLoading(false)
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchContent]);

  return (
    <SearchContext.Provider value={{
      searchAll,
      handleChangeSearchContent,
      artists,
      albums,
      tracks,
      searchLoading,
      searchContent,
    }}>
      {children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => {
  return useContext(SearchContext);
}