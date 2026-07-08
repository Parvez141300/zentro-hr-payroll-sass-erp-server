import PDFDocument from "pdfkit";

interface GenerateInvoicePdfPayload {
    invoiceId: string;
    customerName: string;
    customerEmail: string;
    companyName: string;
    planName: string;
    transactionId: string;
    amount: number;
    paymentDate: Date;
}

export const generateInvoicePdf = (
    payload: GenerateInvoicePdfPayload
): Promise<Buffer> => {

    return new Promise((resolve, reject) => {

        const doc = new PDFDocument({
            size: "A4",
            margin: 50,
        });

        const buffers: Buffer[] = [];

        doc.on("data", (chunk) => {
            buffers.push(chunk);
        });

        doc.on("end", () => {
            resolve(Buffer.concat(buffers));
        });

        doc.on("error", (error) => {
            reject(error);
        });

        // ==========================
        // Start Designing PDF Here
        // ==========================

        doc
            .fontSize(28)
            .fillColor("#2563EB")
            .text("ZENTRO");

        doc.moveDown();

        doc.fontSize(20).fillColor("black").text("INVOICE");

        doc.moveDown();

        doc.fontSize(12);

        doc.text(`Invoice ID : ${payload.invoiceId}`);
        doc.text(`Customer : ${payload.customerName}`);
        doc.text(`Email : ${payload.customerEmail}`);
        doc.text(`Company : ${payload.companyName}`);
        doc.text(`Plan : ${payload.planName}`);
        doc.text(`Transaction ID : ${payload.transactionId}`);
        doc.text(`Amount : ${payload.amount} BDT`);
        doc.text(`Payment Date : ${payload.paymentDate.toLocaleDateString()}`);

        // ==========================
        // Finish PDF
        // ==========================

        doc.end();
    });
};