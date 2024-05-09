const { Category } = require('../models/category')
const { Product } = require('../models/product')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

// get products
router.get(`/`, async (req, res) => {
    let filter = {}
    if(req.query.categories) {
        filter = {category: req.query.categories.split(',')}
    }
    const ProductList = await Product.find(filter).populate('category') 
    //.select('name image rating')
    if (!ProductList) {
        res.status(500).json({
            success: false
        })
    }
    res.send(ProductList)
})

// get product by id
router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category')
    if (!product) {
        res.status(500).json({
            success: false
        })
    }
    res.send(product)
})

// post products
router.post(`/`, async (req, res) => {
    // check category
    if (!mongoose.isValidObjectId(req.body.category)) {
        return res.status(400).send("Wrong Category Format")
    } else {
        const category = await Category.findById(req.body.category)
        if (!category) return res.status(400).send('Invalid Category')
    }

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })

    product = await product.save()
    if (!product) return res.status(500).send('The product cannot be created!')
    return res.status(200).send(product)

})

// update product
router.put("/:id", async (req, res) => {
    // check product id
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send("Wrong Product Id Format")
    } else {
        const product = await Product.findById(req.params.id)
        if (!product) return res.status(400).send('Invalid Product')
    }

    // check category
    if (!mongoose.isValidObjectId(req.body.category)) {
        return res.status(400).send("Wrong Category Format")
    } else {
        const category = await Category.findById(req.body.category)
        if (!category) return res.status(400).send('Invalid Category')
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true }
    );
    if (!product)
        return res.status(500).send("the product can't not be updated!");
    res.send(product);
});
// delete

router.delete("/:id", (req, res) => {
    Product.findByIdAndDelete(req.params.id)
        .then((product) => {
            if (product) {
                return res.status(200).json({
                    success: true,
                    message: "the product is deleted!",
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "product not found",
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

// counting
router.get('/get/count', async (req,res) => {
    // mongoose countDocuments not accept callback
    const productCount = await Product.countDocuments({})
    if (!productCount) return res.status(500).send("the product can't not be updated!");
    res.send({
        productCount: productCount
    })    
})

// feature
router.get(`/get/featured/:count?`, async (req,res) => {
    const count = req.params.count ? req.params.count : 0 
    const products = await Product.find({isFeatured:true}).limit(+count)
    if (!products) return res.status(500).send("the product can't not be updated!");
    res.send({
        count: products.length,
        product: products
    })    
})



module.exports = router