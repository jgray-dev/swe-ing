"use client";

import {FaImages} from "react-icons/fa";
import React, {useCallback, useState} from "react";
import { useDropzone } from "@uploadthing/react";
import { generateClientDropzoneAccept } from "uploadthing/client";
import {useUploadThing} from "~/utils/uploadthing";
import {FileRouter} from "uploadthing/next";


export default function UploadImages() {
  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  
  const { startUpload, permittedFileInfo } = useUploadThing(
    "postImageUploader",
    {
      onClientUploadComplete: () => {
        alert("uploaded successfully!");
      },
      onUploadError: () => {
        alert("error occurred while uploading");
      },
    },
  );

  const fileTypes = permittedFileInfo?.config
    ? Object.keys(permittedFileInfo?.config)
    : [];

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
  });
  
  return (
    <div {...getRootProps()}>
      <input {...getInputProps()}/>
    </div>
  )
}

