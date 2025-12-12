/* eslint-disable no-undef */
// components/DestinationCard.tsx


export const DestinationCard = () => {


  
  return (
    <div className="destination-card" onClick={handleClick}>
      <img src={destination.imageUrl} alt={destination.name} />
      <h3>{destination.name}</h3>
      <p>Rating: {destination.rating}</p>
    </div>
  );
};