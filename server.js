const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./openapi.json')
dotenv.config()


const app = express()
const port = process.env.PORT || 3000

const { createClient } = require('@supabase/supabase-js')

app.use(cors());
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_kEY
const supabase = createClient(process.env.SUPABASE_URL, supabaseKey)

// Verify Supabase connection
supabase.auth.getSession().then(({ error }) => {
    if (error) {
        console.error('Supabase connection failed:', error.message)
    } else {
        console.log('Supabase connected successfully!')
    }
})

async function authenticateUser(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: "Access token required" })
        const { data, error } = await supabase.auth.getUser(token);
        if (!data || error) return res.status(401).json({ error: "Invalid or expired token" })
        res.locals.user = data.user
        return next();
    } catch (error) {

    }
}
app.post("/auth/signup", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({
                error: "Missing email or password"
            })
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        })
        if (data) {
            res.sendStatus(201);
        } else if (error) {
            res.status(400).json({
                error
            })
        }
    } catch (error) {
        return res.json({
            error: error.message
        })
    }
})
app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({
                error: "Missing email or password"
            })
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (data) {
            res.status(200).json({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token
            });
        } else if (error) {
            res.status(400).json({
                error
            })
        }
    } catch (error) {
        return res.json({
            error: error.message
        })
    }
})
app.post('/auth/logout', authenticateUser, async (req,res)=>{
    try {
        const {error} = await supabase.auth.signOut()
        if(error){
            return res.json({error: error.message})
        }
        res.sendStatus(204
            
        )
    } catch (error) {
        
    }
})
app.get('/public/info', (req, res) => {
    return res.json({
        message: "Welcome stranger! This info is public."
    })
})
app.get("/protected/profile", authenticateUser,async (req, res, next) => {
    try {
        const { user } = res.locals
        return res.status(200).json({
            email: user.email,
            id: user.id,
            created_At: user.created_at
        })
    } catch (error) {
        res.json({ error: error.message })
    }
})
app.listen(port, () => {
    console.log('Server is up')
})
