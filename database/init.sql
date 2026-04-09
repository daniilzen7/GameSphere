PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'player' CHECK(role IN ('player', 'manager')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
  game_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL UNIQUE,
  description TEXT,
  min_players INTEGER NOT NULL CHECK (min_players >= 1),
  max_players INTEGER NOT NULL CHECK (max_players >= min_players),
  complexity TEXT DEFAULT 'easy',
  genre TEXT DEFAULT 'other',
  duration_minutes INTEGER DEFAULT 60,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS halls (
  hall_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS club_tables (
  table_id INTEGER PRIMARY KEY AUTOINCREMENT,
  hall_id INTEGER NOT NULL,
  label TEXT NOT NULL,
  seats INTEGER NOT NULL CHECK (seats >= 1),
  is_active INTEGER NOT NULL DEFAULT 1,
  UNIQUE(hall_id, label),
  FOREIGN KEY (hall_id) REFERENCES halls(hall_id)
);

CREATE TABLE IF NOT EXISTS club_schedule (
  schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_date TEXT NOT NULL UNIQUE,
  open_time TEXT NOT NULL,
  close_time TEXT NOT NULL,
  note TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS bookings (
  booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  table_id INTEGER NOT NULL,
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  guests_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'cancelled', 'completed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (table_id) REFERENCES club_tables(table_id)
);

CREATE TABLE IF NOT EXISTS email_notifications (
  notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER,
  user_id INTEGER,
  template TEXT NOT NULL,
  status TEXT NOT NULL,
  provider_message_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at TEXT,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_bookings_table_time ON bookings(table_id, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_date ON club_schedule(work_date);
