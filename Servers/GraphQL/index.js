const express = require('express');
const { ApolloServer } = require('apollo-server-express');

// Importa tu esquema y resolvers
const typeDefs = require('./schema'); 
const resolvers = require('./resolvers');

const startServer = async () => {
  const app = express();

  // Crea el servidor Apollo
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // Inicia el servidor Apollo
  await server.start();

  // Aplica Apollo Middleware a Express
  server.applyMiddleware({ app });

  // Configura un puerto para tu servidor
  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}${server.graphqlPath}`);
  });
};

// Ejecuta la función de inicio
startServer().catch((error) => {
  console.error('Error al iniciar el servidor:', error);
});
