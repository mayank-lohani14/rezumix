export async function exportToPDF(elementId, filename = "resume") {
  if (typeof window === "undefined") return;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[exportPDF] Element #${elementId} not found`);
    return;
  }

  try {
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const clone = element.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.width = "794px";
    clone.style.backgroundColor = "#ffffff";
    document.body.appendChild(clone);

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: 794,
      windowWidth: 794,
      onclone: (doc) => {
        // Fix lab() colors by replacing with safe equivalents
        const allElements = doc.querySelectorAll("*");
        allElements.forEach((el) => {
          try {
            const computed = window.getComputedStyle(el);
            const bg = computed.backgroundColor;
            const color = computed.color;
            const border = computed.borderColor;

            if (bg && (bg.includes("lab") || bg.includes("oklch") || bg.includes("color("))) {
              el.style.backgroundColor = "#ffffff";
            }
            if (color && (color.includes("lab") || color.includes("oklch") || color.includes("color("))) {
              el.style.color = "#111827";
            }
            if (border && (border.includes("lab") || border.includes("oklch") || border.includes("color("))) {
              el.style.borderColor = "#e5e7eb";
            }
          } catch (e) {
            // ignore
          }
        });
      },
    });

    document.body.removeChild(clone);

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename.replace(/\s+/g, "_")}.pdf`);
  } catch (err) {
    console.error("[exportPDF] Export failed:", err);
  }
}