import { useState, useEffect } from 'react';
import playersService, { Player, CreatePlayerData, UpdatePlayerData, PlayerSearchFilters } from '../services/playersService';

interface UsePlayersReturn {
  players: Player[];
  loading: boolean;
  error: string | null;
  searchResults: Player[];
  searching: boolean;
  createPlayer: (data: CreatePlayerData) => Promise<void>;
  updatePlayer: (id: string, data: UpdatePlayerData) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  searchPlayerByEmail: (email: string) => Promise<void>;
  refreshPlayers: () => Promise<void>;
  clearSearch: () => void;
}

export const usePlayers = (): UsePlayersReturn => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [searching, setSearching] = useState(false);

  const loadPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const playersData = await playersService.getPlayers();
      setPlayers(playersData);
    } catch (err: any) {
      console.error('Error cargando jugadores:', err);
      setError(err.response?.data?.msg || 'Error cargando jugadores. Verifique que esté autenticado.');
    } finally {
      setLoading(false);
    }
  };

  const createPlayer = async (data: CreatePlayerData): Promise<void> => {
    try {
      const newPlayer = await playersService.createPlayer(data);
      setPlayers(prev => [...prev, newPlayer]);
    } catch (err: any) {
      console.error('Error creando jugador:', err);
      throw new Error(err.response?.data?.msg || 'Error creando jugador');
    }
  };

  const updatePlayer = async (id: string, data: UpdatePlayerData): Promise<void> => {
    try {
      const updatedPlayer = await playersService.updatePlayer(id, data);
      setPlayers(prev => 
        prev.map(player => 
          player._id === id ? updatedPlayer : player
        )
      );
      
      // Actualizar también los resultados de búsqueda si existen
      setSearchResults(prev => 
        prev.map(player => 
          player._id === id ? updatedPlayer : player
        )
      );
    } catch (err: any) {
      console.error('Error actualizando jugador:', err);
      throw new Error(err.response?.data?.msg || 'Error actualizando jugador');
    }
  };

  const deletePlayer = async (id: string): Promise<void> => {
    try {
      await playersService.deletePlayer(id);
      setPlayers(prev => prev.filter(player => player._id !== id));
      setSearchResults(prev => prev.filter(player => player._id !== id));
    } catch (err: any) {
      console.error('Error eliminando jugador:', err);
      throw new Error(err.response?.data?.msg || 'Error eliminando jugador');
    }
  };

  const searchPlayerByEmail = async (email: string): Promise<void> => {
    if (!email.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await playersService.searchPlayerByEmail(email);
      setSearchResults(results);
    } catch (err: any) {
      console.error('Error buscando jugador:', err);
      setSearchResults([]);
      throw new Error(err.response?.data?.msg || 'Error buscando jugador');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
  };

  const refreshPlayers = async (): Promise<void> => {
    await loadPlayers();
    setSearchResults([]); // Limpiar búsqueda al refrescar
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  return {
    players,
    loading,
    error,
    searchResults,
    searching,
    createPlayer,
    updatePlayer,
    deletePlayer,
    searchPlayerByEmail,
    refreshPlayers,
    clearSearch,
  };
}; 