// Script de prueba para verificar que las API routes funcionan
const baseUrl = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Probando API routes...\n');
  
  try {
    // Probar obtener espacios
    console.log('1. Probando GET /api/spaces...');
    const spacesResponse = await fetch(`${baseUrl}/api/spaces`);
    const spacesData = await spacesResponse.json();
    console.log(`✅ Espacios obtenidos: ${spacesData.data.length} espacios`);
    console.log(`   Primer espacio: ${spacesData.data[0]?.name || 'N/A'}\n`);
    
    // Probar obtener etiquetas
    console.log('2. Probando GET /api/space-tags...');
    const tagsResponse = await fetch(`${baseUrl}/api/space-tags`);
    const tagsData = await tagsResponse.json();
    console.log(`✅ Etiquetas obtenidas: ${tagsData.data.length} etiquetas`);
    console.log(`   Primera etiqueta: ${tagsData.data[0]?.name || 'N/A'}\n`);
    
    // Probar obtener reservas
    console.log('3. Probando GET /api/reservations...');
    const reservationsResponse = await fetch(`${baseUrl}/api/reservations`);
    const reservationsData = await reservationsResponse.json();
    console.log(`✅ Reservas obtenidas: ${reservationsData.data.length} reservas\n`);
    
    // Probar crear una nueva reserva
    console.log('4. Probando POST /api/reservations...');
    const newReservation = {
      spaceId: '1',
      userId: 'user123',
      userName: 'Usuario de Prueba',
      userEmail: 'test@example.com',
      title: 'Reunión de Prueba',
      description: 'Esta es una reserva de prueba',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // +2 horas
      attendees: 5,
      requirements: ['Proyector', 'WiFi']
    };
    
    const createResponse = await fetch(`${baseUrl}/api/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newReservation),
    });
    
    if (createResponse.ok) {
      const createdReservation = await createResponse.json();
      console.log(`✅ Reserva creada: ${createdReservation.data.title} (ID: ${createdReservation.data.id})\n`);
      
      // Probar obtener la reserva por ID
      console.log('5. Probando GET /api/reservations/[id]...');
      const getReservationResponse = await fetch(`${baseUrl}/api/reservations/${createdReservation.data.id}`);
      const getReservationData = await getReservationResponse.json();
      console.log(`✅ Reserva obtenida: ${getReservationData.data.title}\n`);
      
      // Probar actualizar la reserva
      console.log('6. Probando PUT /api/reservations/[id]...');
      const updateResponse = await fetch(`${baseUrl}/api/reservations/${createdReservation.data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'confirmed' }),
      });
      
      if (updateResponse.ok) {
        const updatedReservation = await updateResponse.json();
        console.log(`✅ Reserva actualizada: Estado = ${updatedReservation.data.status}\n`);
      }
      
      // Probar eliminar la reserva
      console.log('7. Probando DELETE /api/reservations/[id]...');
      const deleteResponse = await fetch(`${baseUrl}/api/reservations/${createdReservation.data.id}`, {
        method: 'DELETE',
      });
      
      if (deleteResponse.ok) {
        console.log('✅ Reserva eliminada correctamente\n');
      }
    } else {
      console.log('❌ Error creando reserva\n');
    }
    
    console.log('🎉 Todas las pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
  }
}

// Esperar un poco para que el servidor esté listo
setTimeout(testAPI, 3000);





