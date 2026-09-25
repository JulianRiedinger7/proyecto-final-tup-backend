import { App } from './app';
import { env } from './config/env';

const app = new App();

app.listen(env.PORT, () => {
  console.log(`API lista en http://localhost:${env.PORT} [${env.NODE_ENV}]`);
});
