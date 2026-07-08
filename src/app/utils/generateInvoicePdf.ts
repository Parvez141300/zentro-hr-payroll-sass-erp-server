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
    paymentGateway: string;
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

        doc.on("error", reject);

        // ================= HEADER =================

        doc
            .fontSize(30)
            .fillColor("#2563EB")
            .text("ZENTRO", {
                align: "center",
            });

        doc
            .fontSize(14)
            .fillColor("#666")
            .text("HR & Payroll ERP Platform", {
                align: "center",
            });

        doc.moveDown(2);

        doc
            .fontSize(24)
            .fillColor("black")
            .text("PAYMENT INVOICE");

        doc.moveDown();

        doc
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .stroke("#dddddd");

        doc.moveDown();

        // ================= DETAILS =================

        doc.fontSize(12);

        doc.text(`Invoice ID          : ${payload.invoiceId}`);
        doc.text(`Transaction ID   : ${payload.transactionId}`);
        doc.text(`Payment Gateway : ${payload.paymentGateway}`);

        doc.moveDown();

        doc.text(`Customer Name : ${payload.customerName}`);
        doc.text(`Customer Email : ${payload.customerEmail}`);
        doc.text(`Company Name : ${payload.companyName}`);

        doc.moveDown();

        doc.text(`Subscription Plan : ${payload.planName}`);

        doc.moveDown();

        doc.font("Helvetica-Bold")
            .text(`Amount Paid : ${payload.amount} BDT`);

        doc.font("Helvetica");

        doc.text(
            `Payment Date : ${payload.paymentDate.toLocaleString()}`
        );

        doc.moveDown(2);

        doc
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .stroke("#dddddd");

        doc.moveDown();

        doc.fontSize(11)
            .fillColor("#555")
            .text(
                "Thank you for choosing Zentro HR & Payroll ERP Platform. This invoice confirms that your subscription payment has been received successfully.",
                {
                    align: "justify",
                }
            );

        doc.moveDown(3);

        doc.fontSize(10)
            .fillColor("#999")
            .text(
                "This invoice was generated automatically by Zentro.",
                {
                    align: "center",
                }
            );

        doc.end();
    });
};