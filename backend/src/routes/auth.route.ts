import { Hono } from "hono";

const authApp = new Hono({ strict: false });

authApp.post('/register', async (c) => {
    try {
        const { email, password } = await c.req.json();

        if (!email || !password) {
            return c.json({ error: "Email and password are required" }, 400);
        }

        const sb = c.get("supabase");
        const { data, error } = await sb.auth.signUp({ email, password });

        if (error) {
            console.error("Registration error:", error.code, error.message);

            if (error.code === "validation_failed") {
                return c.json({ error: "Invalid email format or password requirements not met" }, 400);
            } else if (error.code === "user_already_exists") {
                return c.json({ error: "An account with this email already exists" }, 409);
            } else if (error.code === "signup_disabled") {
                return c.json({ error: "Registration is currently disabled" }, 403);
            } else {
                return c.json({ error: "Registration failed. Please try again." }, 500);
            }
        }

        return c.json({
            message: "User created successfully",
            user: data.user ? { id: data.user.id, email: data.user.email } : null
        }, 201);

    } catch (error) {
        console.error("Unexpected error in registration:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

authApp.post('/login', async (c) => {
    try {

        const { email, password } = await c.req.json();

        if (!email || !password) {
            return c.json({ error: "Email and password are required" }, 400);
        }

        const sb = c.get("supabase");

        const { data, error } = await sb.auth.signInWithPassword({ email, password });

        if (error) {
            console.error("Error signing in:", error.code, error.message);
            return c.json({ error: "Your login details don’t match any account." }, 400)
        }

        return c.json({ message: "Login succesful", user: data.user ? { id: data.user.id, email: data.user.email } : null })
    } catch (error) {
        console.error("Unexpected error in login:", error);
        return c.json({ error: "Internal server error" }, 500)
    }

})

export default authApp;

