import { AuthProvider } from "./AuthContext";
import { PlayerContextProvider } from "./PlayerContext";
import { SearchContextProvider } from "./SearchContext";


export function AppProvider({ children }) {
  return (
    <AuthProvider>
      <SearchContextProvider>
        <PlayerContextProvider>
          {children}
        </PlayerContextProvider>
      </SearchContextProvider>
    </AuthProvider>
  )
}