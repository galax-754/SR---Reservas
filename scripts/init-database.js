const fs = require('fs').promises;
const path = require('path');

const dbPath = path.join(__dirname, '..', 'bd');

async function initializeDatabase() {
  try {
    console.log('🚀 Inicializando base de datos...');
    
    // Verificar si la carpeta bd existe
    try {
      await fs.access(dbPath);
      console.log('✅ Carpeta bd ya existe');
    } catch {
      await fs.mkdir(dbPath);
      console.log('✅ Carpeta bd creada');
    }
    
    // Verificar y crear archivos JSON si no existen
    const files = [
      {
        name: 'spaces.json',
        data: [
          {
            "id": "1",
            "name": "Sala de Conferencias A",
            "type": "conference-room",
            "capacity": 10,
            "location": "Piso 1",
            "amenities": ["Proyector", "Pizarra", "WiFi"],
            "setupTypes": ["U-Shape", "Teatro"],
            "isActive": true,
            "requiresCatering": false,
            "tags": ["tag1"],
            "backgroundImage": "/green-velvet-modular-chair.png",
            "description": "Sala moderna equipada con tecnología de última generación",
            "createdAt": "2024-01-01T10:00:00.000Z",
            "updatedAt": "2024-01-01T10:00:00.000Z"
          },
          {
            "id": "2",
            "name": "Sala de Capacitación",
            "type": "training-room",
            "capacity": 15,
            "location": "Piso 2",
            "amenities": ["Proyector", "Pizarra", "WiFi", "Audio"],
            "setupTypes": ["Clase", "Cabaret"],
            "isActive": true,
            "requiresCatering": true,
            "tags": ["tag2"],
            "backgroundImage": "/minimalist-furniture-showroom.png",
            "description": "Espacio amplio ideal para capacitaciones y talleres",
            "createdAt": "2024-01-01T10:00:00.000Z",
            "updatedAt": "2024-01-01T10:00:00.000Z"
          }
        ]
      },
      {
        name: 'spaceTags.json',
        data: [
          {
            "id": "tag1",
            "name": "Horario Matutino",
            "color": "#3CC47C",
            "allowedDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
            "allowedHours": {
              "start": "08:00",
              "end": "12:00"
            },
            "description": "Disponible solo en horario matutino de lunes a viernes",
            "createdAt": "2024-01-01T10:00:00.000Z",
            "updatedAt": "2024-01-01T10:00:00.000Z"
          },
          {
            "id": "tag2",
            "name": "Horario Vespertino",
            "color": "#FF6B6B",
            "allowedDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
            "allowedHours": {
              "start": "14:00",
              "end": "18:00"
            },
            "description": "Disponible solo en horario vespertino de lunes a viernes",
            "createdAt": "2024-01-01T10:00:00.000Z",
            "updatedAt": "2024-01-01T10:00:00.000Z"
          }
        ]
      },
      {
        name: 'reservations.json',
        data: []
      }
    ];
    
    for (const file of files) {
      const filePath = path.join(dbPath, file.name);
      
      try {
        await fs.access(filePath);
        console.log(`✅ ${file.name} ya existe`);
      } catch {
        await fs.writeFile(filePath, JSON.stringify(file.data, null, 2));
        console.log(`✅ ${file.name} creado con datos iniciales`);
      }
    }
    
    console.log('🎉 Base de datos inicializada correctamente');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  }
}

initializeDatabase();





