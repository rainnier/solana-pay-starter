import axios from 'axios';
import fileDownload from 'js-file-download';
import React from 'react';
import { useState } from 'react/cjs/react.production.min';
import useIPFS from '../hooks/useIPFS';

const IPFSDownload = ({ hash, filename }) => {
    const file = useIPFS(hash, filename);

    const handleDownload = async file => {
        //const url = await useIPFS(hash, filename);
        //setFile(url);
        console.log("file", file);
        axios.get(file, {
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
                    <a className='download-button' onClick={() => handleDownload(file)} download={filename}>Download</a>
                </div>
            ) : (
                <p>Downloading file...</p>
            )}
        </div>
    );
};

export default IPFSDownload;