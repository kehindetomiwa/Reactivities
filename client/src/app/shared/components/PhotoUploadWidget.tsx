import { CloudUpload } from "@mui/icons-material";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Cropper, { type ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

type Props = {
  uploadPhoto: (file: Blob) => void;
  loading: boolean;
};

export default function PhotoUploadWidget({ uploadPhoto, loading }: Props) {
  const [files, setFiles] = useState<(File & { preview: string })[]>([]);
  const cropperRef = useRef<ReactCropperElement>(null);

  // Each preview holds an object URL alive until it is revoked; drop a second
  // image (or unmount) and the previous one would leak without this.
  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      // Do something with the files, e.g. upload to a server
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file as Blob),
          }),
        ),
      );
    },
  });

  const OnCrop = useCallback(() => {
    const cropper = cropperRef.current?.cropper;
    cropper?.getCroppedCanvas().toBlob((blob) => {
      uploadPhoto(blob as Blob);
    });
  }, [uploadPhoto]);

  return (
    <Grid container spacing={3}>
      <Grid size={4}>
        <Typography variant="overline" color="secondary">
          Step 1
        </Typography>
        <Box
          {...getRootProps()}
          sx={{
            border: "dashed 3px #eee",
            borderColor: isDragActive ? "green" : "#eee",
            borderRadius: "5px",
            paddingTop: "30px",
            textAlign: "center",
            height: "280px",
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload
            sx={{
              fontSize: 80,
            }}
          />
          <Typography variant="h5">Drop image here</Typography>
        </Box>
      </Grid>
      <Grid size={4}>
        <Typography variant="overline" color="secondary">
          Step 2
        </Typography>
        {files[0]?.preview && (
          <Cropper
            ref={cropperRef}
            src={files[0]?.preview}
            style={{ height: 300, width: "90%" }}
            initialAspectRatio={1}
            aspectRatio={1}
            preview=".img-preview"
            guides={false}
            viewMode={1}
            background={false}
          />
        )}
      </Grid>
      <Grid size={4}>
        {files[0]?.preview && (
          <>
            <Typography variant="overline" color="secondary">
              Step 3
            </Typography>
            <div
              className="img-preview"
              style={{ width: 300, height: 300, overflow: "hidden" }}
            />
            <Button 
            sx={{my: 2, width: 300}}
            onClick={OnCrop}
            variant="contained"
            color='secondary'
            disabled={loading}

            >
                Upload
            </Button>
          </>
        )}
      </Grid>
    </Grid>
  );
}
