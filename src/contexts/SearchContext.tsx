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

  /**
   * search in all types
   * @param searchContent string
   */
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
        setSearchLoading(false);
      } catch (error) {
        setSearchLoading(false);
        alert('Não foi possível retornar o resultado da pesquisa, tente novamente.')
      }
    } else {
      setSearchLoading(false);
      setArtists([]);
      setAlbums([]);
      setTracks([]);
    }
  }

  /**
   * return albums based in response search
   * @param res: AxiosResponse
   * @returns albums: Array
   */
  async function searchAlbum(res: AxiosResponse<any>) {
    const albumsArray: [] = res.data.search.data.albums;

    let albumsReturned: Data[] = [];

    try {
      const albumsMapPromises = albumsArray.map(async (album: any) => {
        let { data } = await api.get(`${album.links.images.href}?apikey=${API_KEY}`);
        let imageUrl = null;
        if (data.images.length > 0) {
          imageUrl = data.images[3].url
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

  /**
   * return artists based in response search
   * @param res: AxiosResponse 
   * @returns artists: Array
   */
  async function searchArtists(res: AxiosResponse<any>) {
    const artistsArray: [] = res.data.search.data.artists;
    let artistsReturned: Data[] = [];

    try {
      const artistMapPromises = artistsArray.map(async (artist: any) => {
        let { data } = await api.get(`${artist.links.images.href}?apikey=${API_KEY}`);
        let imageURL = null;

        if (data.images.length > 0) {
          if (data.images[3]) {
            imageURL = data.images[3].url
          } else {
            imageURL = data.images[0].url
          }
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

  /**
   * return tracks based in response search
   * @param res: AxiosResponse
   * @returns tracks: Array
   */
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
          imageURL = data.images[3].url
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
          duration: 30, //All preview tracks have 30s
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
      searchAll(searchContent)
    }, 600);
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