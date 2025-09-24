import { Router } from 'express';
import klient from './klient.routes.js';
import komitent from './komitent.routes.js';
import vetura from './vetura.routes.js';
import pranimi from './pranimi.routes.js';
import oferta from './oferta.routes.js';
import fletedergese from './fletedergese.routes.js';
import fature from './fature.routes.js';

const api = Router();

// these paths line up with your Angular ApiService
api.use('/klientet', klient);
api.use('/komitentet', komitent);
// vetura endpoints mounted here to keep exact URLs used in ApiService:
api.use('/', vetura); // exposes /klientet/:klientId/vetturat and /vetturat/:id/info
api.use('/', pranimi);
api.use('/', oferta);
api.use('/', fletedergese);
api.use('/', fature);

export default api;
