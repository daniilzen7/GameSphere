// --- API wrapper ---
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

export interface PaginatedData<T> {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

// --- Auth ---
export interface User {
  userId: string;
  email: string;
  fullName: string | null;
  role: 'PLAYER' | 'MANAGER';
  createdAt: string;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  passwordConfirmation: string;
  fullName?: string;
}

// --- Games ---
export interface Game {
  gameId: string;
  title: string;
  description: string | null;
  minPlayers: number | null;
  maxPlayers: number | null;
  complexity: 'EASY' | 'MEDIUM' | 'HARD' | null;
  genre: string | null;
  totalCopies: number;
  isActive: boolean;
}

export interface GamesFilter {
  page?: number;
  perPage?: number;
  search?: string;
  genre?: string;
  complexity?: string;
  minPlayers?: number;
  maxPlayers?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateGameRequest {
  title: string;
  description?: string;
  minPlayers?: number;
  maxPlayers?: number;
  complexity?: string;
  genre?: string;
  totalCopies?: number;
}

export interface UpdateGameRequest extends Partial<CreateGameRequest> {
  isActive?: boolean;
}

// --- Halls & Tables ---
export interface Hall {
  hallId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  tablesCount: number;
}

export interface GameTable {
  tableId: string;
  hallId: string;
  label: string;
  seats: number | null;
  isActive: boolean;
}

// --- Schedule ---
export interface Schedule {
  scheduleId: string;
  date: string;
  openTime: string;
  closeTime: string;
  note: string | null;
}

// --- Bookings ---
export interface Booking {
  bookingId: string;
  userId: string;
  tableId: string;
  tableLabel: string;
  hallName: string;
  gameId: string | null;
  gameTitle: string | null;
  startAt: string;
  endAt: string;
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  cancelledAt: string | null;
}

export interface AvailableSlot {
  slotId: string;
  tableId: string;
  tableLabel: string;
  hallName: string;
  seats: number;
  startTime: string;
  endTime: string;
}

export interface AvailableSlotsResponse {
  date: string;
  clubHours: { openTime: string; closeTime: string };
  slots: AvailableSlot[];
}

export interface CreateBookingRequest {
  tableId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  gameId?: string;
}

export interface AdminBooking {
  bookingId: string;
  user: { userId: string; fullName: string | null; email: string } | null;
  table: { tableId: string; label: string; hallName: string };
  game: { gameId: string; title: string } | null;
  startAt: string;
  endAt: string;
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  cancelledAt: string | null;
}

export interface AdminCreateBookingRequest {
  tableId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  userId: string;
  gameId?: string;
}

export interface AdminUpdateBookingRequest {
  tableId?: string;
  startTime?: string;
  durationMinutes?: number;
  status?: string;
}

// --- Notifications ---
export interface Notification {
  notificationId: string;
  bookingId: string | null;
  userId: string | null;
  template: string;
  status: 'QUEUED' | 'SENT' | 'FAILED';
  providerMessageId: string | null;
  createdAt: string;
  sentAt: string | null;
}
