import apiClient from '../lib/axios';
import { API_ENDPOINTS } from '../config/api';

export interface Player {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  birthDate: string;
  phone?: string;
  category: {
    _id: string;
    name: string;
    gender: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlayerData {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  phone?: string;
  categoryId: string;
}

export interface UpdatePlayerData {
  firstName?: string;
  lastName?: string;
  email?: string;
  birthDate?: string;
  phone?: string | null;
  categoryId?: string;
}

export interface PlayerSearchFilters {
  email?: string;
  categoryId?: string;
  name?: string;
}

class PlayersService {
  // Obtener todos los jugadores
  async getPlayers(filters?: PlayerSearchFilters): Promise<Player[]> {
    const params = new URLSearchParams();
    
    if (filters?.email) params.append('email', filters.email);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.name) params.append('name', filters.name);
    
    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.PLAYERS}?${queryString}` : API_ENDPOINTS.PLAYERS;
    
    const response = await apiClient.get(url);
    return response.data;
  }

  // Buscar jugador por email específico
  async searchPlayerByEmail(email: string): Promise<Player[]> {
    const response = await apiClient.get(API_ENDPOINTS.PLAYERS);
    const players = response.data;
    
    // Filtrar en el frontend para búsqueda exacta o parcial
    return players.filter((player: Player) => 
      player.email.toLowerCase().includes(email.toLowerCase())
    );
  }

  // Crear un nuevo jugador
  async createPlayer(playerData: CreatePlayerData): Promise<Player> {
    const response = await apiClient.post(API_ENDPOINTS.PLAYERS, playerData);
    return response.data;
  }

  // Actualizar un jugador existente
  async updatePlayer(id: string, playerData: UpdatePlayerData): Promise<Player> {
    const response = await apiClient.put(`${API_ENDPOINTS.PLAYERS}/${id}`, playerData);
    return response.data;
  }

  // Eliminar un jugador
  async deletePlayer(id: string): Promise<{ msg: string }> {
    const response = await apiClient.delete(`${API_ENDPOINTS.PLAYERS}/${id}`);
    return response.data;
  }

  // Obtener un jugador por ID
  async getPlayerById(id: string): Promise<Player> {
    const response = await apiClient.get(`${API_ENDPOINTS.PLAYERS}/${id}`);
    return response.data;
  }

  // Verificar si un email ya existe
  async checkEmailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      const players = await this.getPlayers();
      return players.some(player => 
        player.email.toLowerCase() === email.toLowerCase() && 
        (!excludeId || player._id !== excludeId)
      );
    } catch (error) {
      console.error('Error verificando email:', error);
      return false;
    }
  }

  // Obtener jugadores por categoría
  async getPlayersByCategory(categoryId: string): Promise<Player[]> {
    const players = await this.getPlayers();
    return players.filter(player => player.category._id === categoryId);
  }
}

export default new PlayersService(); 