if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

const express = require('express')
const app = express()
const fs = require('fs')
const stripe = require('stripe')(stripeSecretKey)

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static('public'))
app.listen(3000)

app.get('/store.html', function(req, res){
    fs.readFile('items.json', function(error, data){
        if(error){
            res.status(500).end()
        }
        else{
            res.render('store.ejs', {
                stripePublicKey: stripePublicKey,
                items: JSON.parse(data)
            })
        }
    })
})

app.get('/store', function(req, res){
    fs.readFile('items.json', function(error, data){
        if(error){
            res.status(500).end()
        }
        else{
            res.render('store.ejs', {
                stripePublicKey: stripePublicKey,
                items: JSON.parse(data)
            })
        }
    })
})

app.post('/purchase', function(req, res){
    fs.readFile('items.json', function(error, data){
        if(error){
            res.status(500).end()
        }
        else{
            const itemJson = JSON.parse(data)
            const itemsArray = itemJson.music.concat(itemJson.merch)
            let total = 0
            req.body.items.forEach(function(items){
                const itemJson = itemsArray.find(function(i){
                    return i.id == items.id
                })
                total = total + (itemJson.price*items.quantity)
            })

            stripe.charges.create({
                amount: total,
                source: req.body.stripeTokenId,
                currency: 'usd'
            }).then(function(){
                console.log('Charge successful!')
                res.json({message: 'Successfully purchased items'})
            }).catch(function(){
                console.log('Charge Fail!')
                res.status(500).end()
            })
        }
    })
})