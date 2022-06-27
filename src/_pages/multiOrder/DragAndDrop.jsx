import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { OrderContext } from './OrderProvider';

// import csv from 'csv';
const DragAndDrop = () => {

    const { processCsv } =  React.useContext(OrderContext);

    const onDrop = useCallback(files =>{ 
        processCsv(files[0])
    });
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      maxFiles: 1,
      onDrop,
      accept: {
        'text/csv': ['.csv'],
      }
    });

  const acceptedFileItems = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const fileRejectionItems = fileRejections.map(({ file, errors }) => {
    return (
      <li key={file.path}>
        {file.path} - {file.size} bytes
        <ul>
          {errors.map((e) => (
            <li key={e.code}>{e.message}</li>
          ))}
        </ul>
      </li>
    );
  });
  return (
    <section className="container">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop A File here, or click to select file</p>
        <em>(Only CSV files are supported)</em>
      </div>
      <aside>
        <h4>Accepted files</h4>
        <ul>{acceptedFileItems}</ul>
      </aside>
    </section>
  );
};

export default DragAndDrop;
