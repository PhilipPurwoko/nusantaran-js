const chalk = require('chalk');
const Product = require('../models/products');
const { validationResult } = require('express-validator');
const fs = require('fs');


exports.getProduct = (req,res)=>{
    const products = req.session.isAdmin ? Product.fetchAll() : Product.fetchByOwner(req.session.user.email);
    products.then((prods) => {
        const placeholder = req.flash('placeholder');
        const placeholderData = placeholder.length > 0 ? placeholder[0] : {}
        const error = req.flash('errorMessage');
        const errorMessage = error.length > 0 ? error[0] : null
        const hasProduct = prods.length > 0 ? true : false;
        res.render('admin/product',{
            'title':'Nusantaran JS | Admin Products',
            'path':'/product',
            'hasProduct': hasProduct,
            'products':prods,
            'errorMessage': errorMessage,
            'errors': req.flash('errors'),
            'placeholder': placeholderData,
            'isAdmin': req.session.isAdmin
        });
    }).catch((error)=>{
        console.log(error);
        res.redirect('/500');
    });
};

exports.postAddProduct = (req, res)=>{
    const validationError = validationResult(req);
    if (validationError.isEmpty()){
        const product = new Product(
            req.body.name,
            req.body.category,
            req.body.description,
            req.body.price,
            req.file.path,
            req.session.user.email
        );
        product.save().then((product) => {
            console.log(chalk.blue(`Product added : ${product[0].name}`));
            res.redirect('/admin/product');
        }).catch(()=>{
            console.log(chalk.red('Insert Product Failed!'))
            console.log('Caught at controllers/admin.js:21')
            res.redirect('/500');
        });
    } else {
        try {
            fs.unlinkSync(req.file.path);
        } catch (error){
            console.log(error);
        };
        req.flash('errorMessage', validationError.array()[0].msg);
        req.flash('errors', validationError.array());
        req.flash('placeholder', {
            'name': req.body.name,
            'category': req.body.category,
            'description': req.body.description,
            'price': req.body.price
        });
        res.redirect('/admin/product');
    }
};

exports.postUpdateProduct = (req, res)=>{
    Product.updateProduct(req.body).then(()=> {
        res.redirect('/admin/product');
    }).catch((error)=>{
        console.log(error);
        res.redirect('/500');
    });
};

exports.postDeleteProduct = (req,res)=>{
    Product.deleteProduct(req.body.id).then(()=>{
        res.redirect('/admin/product');
    }).catch((error)=>{
        console.log(error);
        res.redirect('/500');
    });
};