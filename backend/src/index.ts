import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import authApp from './routes/auth.route.js'
import propertyApp from './routes/property.route.js'
import { withSupabase, requireAuth } from './middleware/auth.js'

const app = new Hono()

app.use("*", withSupabase);

app.route('/auth', authApp);
app.route('/property', propertyApp);

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
