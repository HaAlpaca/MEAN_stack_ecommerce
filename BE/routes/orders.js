const {Order} = require('../models/order')
const {OrderItem} = require('../models/order-item');
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
// get total sale

router.get("/get/totalsales",async (req,res) => {
    const totalSales = await Order.aggregate([
        {
            $group: {_id: null,totalsales: {$sum: '$totalPrice'}}
        }
    ])
    if(!totalSales) {
        return res.status(400).send("The order sales cannot be generated")
    }
    res.send({totalsales: totalSales.pop().totalsales})
})

// counting
router.get('/get/count', async (req,res) => {
    // mongoose countDocuments not accept callback
    const orderCount = await Order.countDocuments({})
    if (!orderCount) return res.status(500).send({success: false});
    res.send({
        orderCount: orderCount
    })    
})

// get all list order
router.get(`/`, async(req,res) => {
    const orderList = await Order.find()
    .populate('user','name')
    .populate({path: 'orderItems',populate: {path:'product',populate: 'category'}})
    .sort({dateOrdered: -1})
    if(!orderList)
        return res.status(500).json({success: false})
    res.status(200).send(orderList)
})
// get order by id
router.get(`/:id`, async(req,res) => {
    const order = await Order.findById(req.params.id)
    .populate('user','name')
    .populate({path: 'orderItems',populate: {path:'product',populate: 'category'}})
    if(!order) return res.status(500).json({success: false})
    res.status(200).send(order)
})

// post order
router.post("/", async (req, res) => {
    const orderItemIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    })) 

    const orderItemIdsResolved = await orderItemIds
    // calc total price
    const totalPrices = await Promise.all(orderItemIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')
        const totalPrice = orderItem.product.price * orderItem.quantity
        return totalPrice
    }))
    const totalPrice = totalPrices.reduce((a,b)=> a+ b,0)

    console.log(totalPrices);

    let order = new Order({
        orderItems: orderItemIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    });
    order = await order.save();
    if (!order)
        return res.status(400).send("the order can't not be created!");
    res.send(order);
});

// UPDATE 
router.put('/:id',async (req,res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send("Wrong User Id Format")
    } else {
        const order = await Order.findById(req.params.id)
        if (!order) return res.status(400).send('Invalid Order')
    }

    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true }
    );
    if (!order)
        return res.status(404).send("the order can't not be updated!");
    res.send(order);
})

// delete
// delete category
router.delete("/:id", (req, res) => {
    Order.findByIdAndDelete(req.params.id)
        .then((order) => {
            if (order) {
                return res.status(200).json({
                    success: true,
                    message: "the order is deleted!",
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "order not found",
                });
            }
        })
        .catch((err) => {
            return res.status(400).json({
                success: false,
                error: err,
            });
        });
});

module.exports = router