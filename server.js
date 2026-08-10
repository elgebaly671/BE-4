const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
dotenv.config()


const app = express()
const port = process.env.PORT

const { createClient } = require('@supabase/supabase-js')

app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Verify Supabase connection
supabase.auth.getSession().then(({ error }) => {
    if (error) {
        console.error('Supabase connection failed:', error.message)
    } else {
        console.log('Supabase connected successfully!')
    }
})


app.post("/auth/signup", async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password)
            return res.status(400).json({
                error: "Missing email or password"
            })
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        })
        if(data){
            res.sendStatus(201);
        }else if(error){
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

app.post("/auth/login", async (req, res)=>{
    try {
        const { email, password } = req.body;
        if(!email || !password)
            return res.status(400).json({
                error: "Missing email or password"
            })
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if(data){
            res.status(200).json({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token
            });
        }else if(error){
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
app.listen(port, () => {
    console.log('Server is up')
})
