import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

function ShippingForm({ user }) {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');

  const handleSaveAddress = async () => {
    if (!address || !city || !zip || !country) {
      alert('Please fill in all fields.');
      return;
    }

    await setDoc(doc(db, 'shipping', user.uid), {
      uid: user.uid,
      email: user.email,
      address,
      city,
      zip,
      country
    });

    alert('Shipping address saved!');
  };

  return (
    <div>
      <h3>Shipping Information</h3>
      <input
        type="text"
        placeholder="Street Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <input
        type="text"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <input
        type="text"
        placeholder="Postal Code"
        value={zip}
        onChange={(e) => setZip(e.target.value)}
      />
      <input
        type="text"
        placeholder="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      />
      <button onClick={handleSaveAddress}>Save Address</button>
    </div>
  );
}

export default ShippingForm;
