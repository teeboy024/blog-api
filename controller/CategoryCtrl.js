const Category = require("../model/Category/Category");
const appErr = require("../utils/appError");


const createCategoryCtrl = async (req, res, next) => {
  const { title } = req.body;
  try {
    const category = await Category.create({ title, user: req.userAuth });
    res.json({
      status: "success",
      data: category,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//FETCH CATEGORY
const fetchCategoryCtrl = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.json({
      status: "success",
      data: categories,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// SINGLE CATEGORY
const getSingleCategory = async (req, res, next) => {
  try {
    const getCategory = await Category.findById(req.params.id);
    res.json({
      status: "success",
      data: getCategory,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({
      status: "success",
      data: "Category deleted successfully",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// UPDATE CATEGORY
const updateCategory = async (req, res, next) => {
  const { title } = req.body;
  try {
    const category = await Category.findByIdAndUpdate(
      req.userAuth,
      { title },
      { new: true, runValidators: true }
    );
    res.json({
      status: "Success",
      data: category
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

module.exports = {
  createCategoryCtrl,
  fetchCategoryCtrl,
  getSingleCategory,
  deleteCategory,
  updateCategory
};