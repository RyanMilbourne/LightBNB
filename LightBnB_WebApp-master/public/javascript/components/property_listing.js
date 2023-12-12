$(() => {
  window.propertyListing = {};

  function createListing(property, isReservation) {
    return `
    <article class="property-listing">
        <section class="property-listing__preview-image" style="background-image: url('${property.thumbnail_photo_url}'); background-size: cover; background-position: center center;")>
        ${isReservation ?
        `<p class="reservation">${moment(property.start_date).format('ll')} - ${moment(property.end_date).format('ll')}</p>`
        : ``}
        </section>
        <section class="property-listing__details">
          <h3 class="property-listing__title">${property.title}</h3>
          
          <div class="property-listing__details">
            <p>bedrooms: <b>${property.number_of_bedrooms}</b></p>
            <p>bathrooms: <b>${property.number_of_bathrooms}</b></p>
            <p>parking spaces: <b>${property.parking_spaces}</b></p>
          </div>
          <footer class="property-listing__footer">
            <div class="property-listing__rating">${Math.round(property.average_rating * 100) / 100}/5 stars</div>
            <div class="property-listing__price">$${property.cost_per_night / 100.0}/night</div>
          </footer>
        </section>
      </article>
    `
  }

  window.propertyListing.createListing = createListing;

});