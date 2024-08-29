const express = require('express');
const { createCategoryCtrl, fetchCategoryCtrl, updateCategory, deleteCategory, getSingleCategory } = require('../controller/CategoryCtrl');
const CategoryRouter = express.Router()
const isLogin = require('../middleware/isLogin');


//create Category
CategoryRouter.post("/", isLogin ,createCategoryCtrl);

//fetch Category
CategoryRouter.get("/", fetchCategoryCtrl );

//single category
CategoryRouter.get("/:id", getSingleCategory );

//update Category
CategoryRouter.put("/:id", isLogin ,updateCategory);

//delete Category
CategoryRouter.delete("/:id", isLogin ,deleteCategory);


    module.exports = CategoryRouter