import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dialysis Outlet API',
      version: '1.0.0',
      description: 'API documentation for the Dialysis Outlet backend',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
  },
  apis: ['./routes/*.ts', './controllers/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
