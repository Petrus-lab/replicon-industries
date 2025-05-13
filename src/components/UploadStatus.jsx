// Path: src/components/UploadStatus.jsx

import React from 'react';

const UploadStatus = ({ status }) => {
  if (!status) return null;

  const style = {
    marginTop: '1rem',
    padding: '0.5rem',
    border: '1px solid',
    borderColor: status.type === 'success' ? 'green' : 'red',
    color: status.type === 'success' ? 'green' : 'red',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9'
  };

  return <div style={style}>{status.message}</div>;
};

export default UploadStatus;
