import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, deleteField } from 'firebase/firestore';

const ShippingForm = () => {
  const [inputAddress, setInputAddress] = useState({
    fullName: '',
    phoneNumber: '',
    line1: '',
    line2: '',
    suburb: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const [defaultShipping, setDefaultShipping] = useState(null);
  const [oneOffShipping, setOneOffShipping] = useState(null);
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setInputAddress({ ...inputAddress, [e.target.name]: e.target.value });
  };

  const getFullAddress = (address) => {
    return [address.line1, address.line2, address.suburb, address.city, address.postalCode, address.country]
      .filter(Boolean)
      .join(', ');
  };

  const fetchShippingData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, 'shipping', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setDefaultShipping(data.defaultShipping || null);
      setOneOffShipping(data.oneOffShipping || null);
    }
  };

  const handleSave = async (target) => {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, 'shipping', user.uid);
    const isEmpty = Object.values(inputAddress).every(v => v.trim() === '');

    try {
      setStatus('Saving...');
      if (isEmpty) {
        await updateDoc(docRef, { [target]: deleteField() });
        if (target === 'defaultShipping') setDefaultShipping(null);
        if (target === 'oneOffShipping') setOneOffShipping(null);
      } else {
        const shippingBlock = {
          fullName: inputAddress.fullName,
          phoneNumber: inputAddress.phoneNumber,
          line1: inputAddress.line1,
          line2: inputAddress.line2,
          suburb: inputAddress.suburb,
          city: inputAddress.city,
          postalCode: inputAddress.postalCode,
          country: inputAddress.country,
          fullAddress: getFullAddress(inputAddress)
        };
        await setDoc(docRef, { [target]: shippingBlock }, { merge: true });
        if (target === 'defaultShipping') setDefaultShipping(shippingBlock);
        if (target === 'oneOffShipping') setOneOffShipping(shippingBlock);
      }
      setStatus('Saved successfully.');
    } catch (err) {
      console.error(err);
      setStatus('Failed to save.');
    }
  };

  useEffect(() => {
    fetchShippingData();
  }, []);

  const renderAddressBlock = (title, data) => (
    <div className="section-subblock">
      <h3 className="section-heading">{title}</h3>
      <div className="address-frame">
        {data ? (
          <>
            <label className="form-label">Full Name:</label>
            <div>{data.fullName}</div>

            <label className="form-label">Phone Number:</label>
            <div>{data.phoneNumber}</div>

            <label className="form-label">Line 1:</label>
            <div>{data.line1}</div>

            <label className="form-label">Line 2:</label>
            <div>{data.line2}</div>

            <label className="form-label">Suburb:</label>
            <div>{data.suburb}</div>

            <label className="form-label">City:</label>
            <div>{data.city}</div>

            <label className="form-label">Postal Code:</label>
            <div>{data.postalCode}</div>

            <label className="form-label">Country:</label>
            <div>{data.country}</div>
          </>
        ) : (
          <div className="text-faint">No address saved</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="section-container">
      <h2 className="section-heading">Shipping Address Manager</h2>
      <div className="grid-3-cols">
        <div className="column-block">
          <h3 className="section-heading">Input Shipping Address</h3>

          <label className="form-label">Full Name:</label>
          <input name="fullName" value={inputAddress.fullName} onChange={handleChange} className="form-control form-control-narrow" />

          <label className="form-label">Phone Number:</label>
          <input name="phoneNumber" value={inputAddress.phoneNumber} onChange={handleChange} className="form-control form-control-narrow" />

          <label className="form-label">Line 1:</label>
          <input name="line1" value={inputAddress.line1} onChange={handleChange} className="form-control form-control-narrow" />

          <label className="form-label">Line 2:</label>
          <input name="line2" value={inputAddress.line2} onChange={handleChange} className="form-control form-control-narrow" />

          <label className="form-label">Suburb:</label>
          <input name="suburb" value={inputAddress.suburb} onChange={handleChange} className="form-control form-control-narrow" />

          <label className="form-label">City:</label>
          <input name="city" value={inputAddress.city} onChange={handleChange} className="form-control form-control-narrow" />

          <label className="form-label">Postal Code:</label>
          <input name="postalCode" value={inputAddress.postalCode} onChange={handleChange} className="form-control form-control-narrow" />

          <label className="form-label">Country:</label>
          <input name="country" value={inputAddress.country} onChange={handleChange} className="form-control form-control-narrow" />

          <div className="button-row">
            <button type="button" className="button-secondary" onClick={() => handleSave('defaultShipping')}>
              Save as Default Address
            </button>
            <button type="button" className="button-secondary" onClick={() => handleSave('oneOffShipping')}>
              Save as One-Off Address
            </button>
          </div>

          {status && <p>{status}</p>}
        </div>

        <div className="column-block">
          {renderAddressBlock('Default Shipping Address', defaultShipping)}
        </div>

        <div className="column-block">
          {renderAddressBlock('One-Off Shipping Address', oneOffShipping)}
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;
