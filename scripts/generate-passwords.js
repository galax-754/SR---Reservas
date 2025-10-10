const bcrypt = require('bcrypt');

async function generatePasswords() {
  const users = [
    {
      name: 'Usuario Normal',
      email: 'usuario@sistema.com',
      password: 'usuario123'
    },
    {
      name: 'Tablet',
      email: 'tablet.sala1@sistema.com', 
      password: 'tablet123'
    }
  ];

  console.log('Generando contraseñas hash...\n');

  for (const user of users) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      
      console.log(`Usuario: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Contraseña: ${user.password}`);
      console.log(`Hash: ${hashedPassword}`);
      console.log('---');
    } catch (error) {
      console.error(`Error generando hash para ${user.name}:`, error);
    }
  }
}

generatePasswords();


