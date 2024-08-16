import express from 'express';
import dotenv from 'dotenv';
import stripe from 'stripe';

//load variables
dotenv.config();

//start server
const app = express();

app.use(express.static('../client'));
app.use(express.json());


//Home Route
app.get('/', (req, res) => {
    res.sendFile('index.html', {root: '../client'})
});

//success Route
app.get('/success', (req, res) => {
    res.sendFile('success.html', {root: '../client'})
});

//cancel Route
app.get('/cancel', (req, res) => {
    res.sendFile('cancel.html', {root: '../client'})
});

let domin = 'http://localhost:3000';

//Start Stripe
let stripeGateway = stripe(process.env.stripe_api);
app.post('/stripe-checkout', async (req, res) => {
    const lineItems = req.body.items.map((item) => {
        const unitAmount = parseInt(item.price.replace(/[^0-9.-]+/g, "") * 100);
        console.log('item-price:', item.price);
        console.log('unitAmount:', unitAmount);
        return {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.title,
                    images: [item.imageSrc]
                },
                unit_amount: unitAmount
            },
            quantity: item.quantity,
        };

    });
    console.log('lineItems:', lineItems);

    //Create Chechout Session process.env
    const session = await stripeGateway.checkout.sessions.create({
        success_url: `${domin || process.env.PORT}/success`,
        cancel_url: `${domin || process.env.PORT}/cancel`,
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        mode: 'payment',
    });
    res.json(session.url);
});

app.listen(3000 || process.env.PORT, () => {
    console.log('listening on port 3000')
});