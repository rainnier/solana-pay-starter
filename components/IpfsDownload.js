import axios from 'axios';
import fileDownload from 'js-file-download';
import React from 'react';
import useIPFS from '../hooks/useIPFS';

const IPFSDownload = ({ hash, filename }) => {
    const file = useIPFS(hash, filename);

    const handleDownload = (url, filename) => {
        axios.get(url, {
            responseType: 'blob',
        })
        .then((res) => {
            fileDownload(res.data, filename)
        })
    }

    return (
        <div>
            {file ? (
                <div className='download-component'>
                    <a className='download-button' onClick={() => handleDownload(file, filename)} download={filename}>Download</a>
                </div>
            ) : (
                <p>Downloading file...</p>
            )}
        </div>
    );
};

export default IPFSDownload;