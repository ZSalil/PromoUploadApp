import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { OrderContext } from './OrderProvider';

const DragAndDrop = () => {
  const { processCsv, orderType } = React.useContext(OrderContext); // Access orderType from context

  const onDrop = useCallback((files) => { 
    // Process the CSV file only if orderType is selected
    if (orderType) {
      processCsv(files[0]);
    }
  }, [processCsv, orderType]);

  // Set dropzone to be disabled if no company is selected
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    disabled: !orderType, // Disable dropzone if no company selected
  });

  const acceptedFileItems = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
      <ul>
        {errors.map((e) => (
          <li key={e.code}>{e.message}</li>
        ))}
      </ul>
    </li>
  ));

  return (
    <section className="container">
      <div {...getRootProps({ className: `dropzone ${!orderType ? 'disabled-dropzone' : ''}` })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop a file here, or click to select a file</p>
        <em>(Only CSV files are supported)</em>
        {!orderType && <p style={{ color: 'red' }}>Please select a company to enable file upload.</p>}
      </div>
      <aside>
        <h4>Accepted files</h4>
        <ul>{acceptedFileItems}</ul>
        <h4>Rejected files</h4>
        <ul>{fileRejectionItems}</ul>
      </aside>
    </section>
  );
};

export default DragAndDrop;
