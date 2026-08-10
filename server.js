const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
dotenv.config()


const app = express()
const port = process.env.PORT

const {createClient} = require('@supabase/supabase-js')

app.use(cors());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Verify Supabase connection
supabase.auth.getSession().then(({ error }) => {
    if (error) {
        console.error('Supabase connection failed:', error.message)
    } else {
        console.log('Supabase connected successfully!')
    }
})

app.listen(port, ()=>{
    console.log('Server is up')
})
