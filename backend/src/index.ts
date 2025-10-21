import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import authApp from './routes/auth.route.js'
import propertyApp from './routes/property.route.js'
import bookingApp from './routes/booking.route.js'
import hostPropertyApp from './routes/host.property.route.js'
import hostBookingApp from './routes/host.booking.route.js'
import { withSupabase, requireAuth } from './middleware/auth.js'

const app = new Hono()

app.use("*", withSupabase);

app.route('/auth', authApp);
app.route('/property', propertyApp);
app.route('/booking', bookingApp);
app.route('/host/property', hostPropertyApp);
app.route('/host/booking', hostBookingApp);

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
