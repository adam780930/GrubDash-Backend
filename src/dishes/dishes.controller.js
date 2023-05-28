const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newId = new nextId();
  const newDish = {
    id: newId,
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

// Middleware validation functions
function hasName(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name) {
    if (name === "") {
      next({ 
        status: 400, 
        message: `Dish must include a name` });
    }
    return next();
  }
  next({
    status: 400,
    message: `Dish must include a name`,
  });
}

function hasDescription(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description) {
    if (description === "") {
      next({ 
        status: 400, 
        message: `Dish must include a description` });
    }
    return next();
  }
  next({
    status: 400,
    message: `Dish must include a description`,
  });
}

function hasValidPrice(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price) {
    res.locals.price = price;
    if (price <= 0 || !Number.isInteger(price)) {
      next({ 
        status: 400,
        message: `Dish must include a price` });
    }
    return next();
  }
  next({
    status: 400,
    message: `Dish must include a price`,
  });
}

function hasImage(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url) {
    if (image_url === "") {
      next({ 
        status: 400, 
        message: "Dish must include a image_url" });
    }
    return next();
  }
  next({
    status: 400,
    message: `Dish must include a image_url`,
  });
}

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: dishes });
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish id not found: ${dishId}`,
  });
}

function matchingId(req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;

  if (dishId === id || !id) {
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}

function update(req, res) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  const { data: { name, description, price, image_url } = {} } = req.body;

  // Update the dish
  foundDish.name = name;
  foundDish.description = description;
  foundDish.price = price;
  foundDish.image_url = image_url;

  res.json({ data: foundDish });
}

module.exports = {
  list,
  read: [dishExists, read],
  create: [hasName, hasDescription, hasValidPrice, hasImage, create], 
  update: [
    dishExists,
    matchingId,
    hasName,
    hasDescription,
    hasValidPrice,
    hasImage,
    update,
  ],
};
