const properties = require("./json/properties.json");
const users = require("./json/users.json");

const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 */
const getUserWithEmail = function(email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1;`, [email])
    .then((result) => {
      if (result.rows.length > 0) {
        // return the user object (id, name, email, password)
        return result.rows[0];
      } else {
        return null;
      }
    })
    .catch((err) => {
      console.log(err.message);
      throw err;
    });
};

/**
 * Get a single user from the database given their id.
 */
const getUserWithId = function(id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1;`, [id])
    .then((result) => {
      if (result.rows.length > 0) {
        // return the user object (id, name, email, password)
        return result.rows[0];
      } else {
        return null;
      }
    })
    .catch((err) => {
      console.log(err.message);
      throw err;
    });
};

/**
 * Add a new user to the database.
 */
const addUser = function(user) {
  return pool
    .query(`INSERT INTO users (name, email, password) VALUES ($1 , $2, $3) RETURNING *;`, [user.name, user.email, user.password])
    .then((result) => {
      if (result.rows.length > 0) {
        // return the new user object (id, name, email, password)
        return result.rows[0];
      } else {
        return null;
      }
    })
    .catch((err) => {
      console.log(err.message);
      throw err;
    });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool
    .query(`SELECT reservations.*, properties.*
  FROM
    reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE
    reservations.guest_id = $1
  GROUP BY
    reservations.id,
    properties.id
  ORDER BY
    reservations.start_date
  LIMIT $2;`, [guest_id, limit])
    .then((result) => {
      if (result.rows.length > 0) {
        return result.rows;
      } else {
        return null;
      }
    })
    .catch((err) => {
      console.log(err.message);
      throw err;
    });
};

/// Properties

/**
 * Get all properties.
 */
const getAllProperties = function(options, limit = 10) {

  const queryParams = [];

  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  WHERE 1 = 1
  `;

  // define options
  const city = `%${options.city}%`;
  const minPrice = options.minimum_price_per_night * 100;
  const maxPrice = options.maximum_price_per_night * 100;
  const rating = options.minimum_rating;
  const ownerID = options.owner_id;

  // filter by city
  if (city) {
    queryParams.push(city);
    queryString += ` AND city LIKE $${queryParams.length}`;
  }

  // filter by min & max
  if (minPrice && maxPrice) {
    queryParams.push(minPrice, maxPrice);
    queryString += ` AND cost_per_night >= $${queryParams.length - 1} AND cost_per_night <= $${queryParams.length}`;
  }

  // filter by rating
  if (rating) {
    queryParams.push(rating);
    queryString += ` AND property_reviews.rating >= $${queryParams.length}`;
  }

  // filter by ownerID
  if (ownerID) {
    queryParams.push(ownerID);
    queryString += ` AND owner_id = $${queryParams.length}`;
  }

  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  console.log(queryString, queryParams);

  return pool
    .query(queryString, queryParams)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
      throw err;
    });
};

/**
 * Add a property to the database
 */
const addProperty = function(property) {

  // define property "properties"
  const ownerID = property.owner_id;
  const title = property.title;
  const description = property.description;
  const thumbnail = property.thumbnail_photo_url;
  const cover = property.cover_photo_url;
  const cost_per_night = property.cost_per_night;
  const street = property.street;
  const city = property.city;
  const province = property.province;
  const post_code = property.post_code;
  const country = property.country;
  const parking = property.parking_spaces;
  const bathrooms = property.number_of_bathrooms;
  const bedrooms = property.number_of_bedrooms;

  return pool
    .query(`INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *;`, [ownerID, title, description, thumbnail, cover, cost_per_night, street, city, province, post_code, country, parking, bathrooms, bedrooms])
    .then((result) => {
      if (result.rows.length > 0) {
        // return the new property object
        console.log(result.rows[0])
        return result.rows[0];
      } else {
        return null;
      }
    })
    .catch((err) => {
      console.log(err.message);
      throw err;
    });
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
