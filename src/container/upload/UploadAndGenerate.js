import React, { useState } from 'react'
import axios from 'axios';
import Message from './Message';
import Progress from './Progress';

const FileUpload = () => {

  const [file, setFile] = useState('');
  const [filename, setFilename] = useState('Choose file');
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState('');
  const [uploadedPercentage, setUploadedPercentage] = useState(0);

  const onChange = e => {
    setFile(e.target.files[0]);
    setFilename(e.target.files[0].name);
  }

  const onSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    setUploadedPercentage(0);
    try {
      const res = await axios.post('http://localhost:8888/upload', formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Access-Control-Allow-Origin":"*"
        },
        onUploadProgress: progressEvent => {
          setUploadedPercentage(parseInt(Math.round(progressEvent.loaded * 100 / progressEvent.total)));
          //clear
          setTimeout( ()=>{ setUploadedPercentage(0); }, 10000 )
        }
        
      });
      const { fileName, filePath } = res.data;
      setUploadedFile({fileName, filePath});
      setMessage('File Uploaded!');
    } catch (error) {
      if(error.response.status === 500){
        setMessage('problem with server');
        setUploadedPercentage(0);
      } else {
        setMessage(error.response.data.msg);
        setUploadedPercentage(0);
      }
    }
  }

  return (
    <div>
      {message ? <Message msg={message} /> : null}
      <form onSubmit={onSubmit}>
        <div className="custom-file mb-4">
          <input type="file" className="custom-file-input" id="customFile" onChange={onChange} />
          <label className="custom-file-label" htmlFor="customFile">{filename}</label>
        </div>
        <Progress percentage={uploadedPercentage} />
        <input className="btn btn-primary btn-block mt-4" type="submit" value="Upload" />
      </form>
      {
        uploadedFile ? 
          <div className="row mt-5">
            <div className="col-md-6 m-auto">
              <h3 className="text-center">{uploadedFile.name}</h3>
              <img style={{width:'100%'}} src={uploadedFile.filePath} alt=""/>
            </div>
          </div> :
          <p>nothing uploaded yet...</p>
      }
    </div>
  )
}


export default FileUpload
