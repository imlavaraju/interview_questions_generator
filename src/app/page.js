"use client";

import React, { useState } from "react";
import axios from "axios";
import pdfToText from "react-pdftotext"; // Ensure this library is correctly installed
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import styles from "./page.module.css"; // Import the CSS file

const App = () => {
  const [data, setData] = useState("");
  const [pdfBlob, setPdfBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function extractText(event) {
    setLoading(true);
    setSuccess(false);
    setData(null);
    try {
      const file = event.target.files[0];
      const text = await pdfToText(file);
      const resultapi = await axios.post("/api/content", { prompt: text });
      setData(resultapi.data.content);
      await generatePdf(resultapi.data.content);
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function generatePdf(htmlContent) {
    const pdfContainer = document.createElement("div");
    pdfContainer.innerHTML = htmlContent;
    pdfContainer.style.width = "210mm"; // Set the width of the container to A4 size in mm

    document.body.appendChild(pdfContainer);

    const canvas = await html2canvas(pdfContainer, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    document.body.removeChild(pdfContainer);

    const pdfOutput = pdf.output("blob");
    setPdfBlob(pdfOutput);
  }

  function viewPdf() {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");
    }
  }

  function downloadPdf() {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "output.pdf";
      document.body.appendChild(link);
      link.click();
    }
  }

  return (
    <div className={styles.container}>
      <input
        type="file"
        accept="application/pdf"
        onChange={extractText}
        className={styles.fileInput}
      />
      {loading && (
        <div className={styles.loading}>
          <div className={styles.loadingCircle}></div>
        </div>
      )}
      {success && !loading && (
        <div className={styles.success}>&#10003; PDF Generated!</div>
      )}
      <div>
        {pdfBlob && (
          <div className={styles.buttons}>
            <button onClick={viewPdf} className={styles.button}>
              View PDF
            </button>
            <button onClick={downloadPdf} className={styles.button}>
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;