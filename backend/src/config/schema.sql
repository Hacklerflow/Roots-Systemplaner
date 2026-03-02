-- Roots Configurator Database Schema
-- PostgreSQL

-- Drop existing tables (be careful in production!)
DROP TABLE IF EXISTS catalog_dimensions CASCADE;
DROP TABLE IF EXISTS catalog_pipes CASCADE;
DROP TABLE IF EXISTS catalog_connections CASCADE;
DROP TABLE IF EXISTS catalog_modules CASCADE;
DROP TABLE IF EXISTS catalog_module_types CASCADE;
DROP TABLE IF EXISTS configurations CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Metadata
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  -- Building info (denormalized for quick access)
  building_name VARCHAR(255),
  building_year INTEGER,
  building_address TEXT
);

-- Configurations table (stores the actual node/edge data)
CREATE TABLE configurations (
  id SERIAL PRIMARY KEY,
  project_id INTEGER UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  -- JSON data
  nodes JSONB DEFAULT '[]',
  edges JSONB DEFAULT '[]',
  building JSONB DEFAULT '{}',
  viewport JSONB DEFAULT '{"x": 0, "y": 0, "zoom": 1}',
  -- Metadata
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shared Catalogs (all users see the same data)

-- Module Types Catalog
CREATE TABLE catalog_module_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  kategorie VARCHAR(255),
  berechnungsart VARCHAR(50) DEFAULT 'stueck',
  einheit VARCHAR(20) DEFAULT 'Stk',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modules Database Catalog
CREATE TABLE catalog_modules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  modultyp VARCHAR(255) REFERENCES catalog_module_types(name),
  hersteller VARCHAR(255),
  abmessungen VARCHAR(255),
  gewicht_kg DECIMAL(10,2),
  leistung_kw DECIMAL(10,2),
  volumen_l DECIMAL(10,2),
  preis DECIMAL(10,2),
  -- Inputs/Outputs stored as JSON arrays
  eingaenge JSONB DEFAULT '[]',
  ausgaenge JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Connection Types Catalog
CREATE TABLE catalog_connections (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  kuerzel VARCHAR(10) NOT NULL,
  typ VARCHAR(50) NOT NULL, -- hydraulisch, elektrisch, steuerung
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pipes Catalog (Leitungskatalog)
CREATE TABLE catalog_pipes (
  id SERIAL PRIMARY KEY,
  verbindungsart VARCHAR(255) REFERENCES catalog_connections(name),
  leitungstyp VARCHAR(255) NOT NULL,
  dimension VARCHAR(100) NOT NULL,
  preis_pro_meter DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(verbindungsart, leitungstyp, dimension)
);

-- Dimensions Catalog (Dimensionskatalog)
CREATE TABLE catalog_dimensions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  value VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_configurations_project_id ON configurations(project_id);
CREATE INDEX idx_catalog_modules_modultyp ON catalog_modules(modultyp);
CREATE INDEX idx_catalog_pipes_verbindungsart ON catalog_pipes(verbindungsart);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configurations_updated_at BEFORE UPDATE ON configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catalog_module_types_updated_at BEFORE UPDATE ON catalog_module_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catalog_modules_updated_at BEFORE UPDATE ON catalog_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catalog_connections_updated_at BEFORE UPDATE ON catalog_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catalog_pipes_updated_at BEFORE UPDATE ON catalog_pipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catalog_dimensions_updated_at BEFORE UPDATE ON catalog_dimensions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts for authentication';
COMMENT ON TABLE projects IS 'Project metadata and overview information';
COMMENT ON TABLE configurations IS 'Detailed project configurations (nodes, edges, building data)';
COMMENT ON TABLE catalog_module_types IS 'Shared catalog of module types';
COMMENT ON TABLE catalog_modules IS 'Shared catalog of available modules';
COMMENT ON TABLE catalog_connections IS 'Shared catalog of connection types';
COMMENT ON TABLE catalog_pipes IS 'Shared catalog of pipes/cables';
COMMENT ON TABLE catalog_dimensions IS 'Shared catalog of standard dimensions';
