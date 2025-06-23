import React from 'react'

type Props = {
  pdf_url: string
}

const PDFViewer = ({ pdf_url }: Props) => {
  const encodedUrl = encodeURIComponent(pdf_url); // safer in case URL has special chars

  return (
    <iframe
      src={`https://docs.google.com/gview?embedded=true&url=${encodedUrl}`}
      width="100%"
      height="100%"
      title="PDF Viewer"
      className="w-full h-full"
    />
  )
}

export default PDFViewer
