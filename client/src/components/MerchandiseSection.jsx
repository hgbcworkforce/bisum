import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Placeholder images - You'll need to add actual images to src/assets/merchandise
import { merchandiseItems } from '../data/merchandiseData';

const MerchandiseCard = ({ item }) => {
  const [currentImage, setCurrentImage] = useState(item.colors[0].image);
  const [colorIndex, setColorIndex] = useState(0);

  const handleMouseEnter = () => {
    // Cycle through colors on hover
    setColorIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % item.colors.length;
      setCurrentImage(item.colors[newIndex].image);
      return newIndex;
    });
  };

  const handleMouseLeave = () => {
    setCurrentImage(item.colors[0].image);
    setColorIndex(0); // Reset to default color on mouse leave
  };

  return (
    <div
      className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={currentImage}
        alt={item.name}
        className="w-full h-90 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{item.description}</p>
        <div className="flex lg:flex-row  flex-col justify-between items-start lg:items-center mb-4">
          <span className="text-2xl font-bold text-blue-600">{item.price}</span>
          <span className="bg-red-500 rounded-full px-6 py-2 text-sm text-white font-bold">{item.timeFrame}</span>
        </div>
        <Link
          to={`/merchandisedetails/${item.id}`} // Link to the detailed merchandise page
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 block text-center"
        >
          Order Now
        </Link>
      </div>
    </div>
  );
};

const MerchandiseSection = () => {
  return (
    <section id="merchandise" className="py-20 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Conference Merchandise
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Grab your exclusive BISUM Conference merchandise and show your support!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {merchandiseItems.map((item, index) => (
            <MerchandiseCard key={index} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MerchandiseSection;
