import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {Invoice, User} from '../types';
import {format} from 'date-fns';

// Set fonts for pdfMake
pdfMake.vfs = pdfFonts.vfs;

export const generateInvoicePDF = (invoice: Invoice, userProfile: User): Promise<Blob> => {
    return new Promise((resolve) => {
        const docDefinition = {
            content: [
                // Header
                {
                    columns: [
                        {
                            text: userProfile.businessName || userProfile.displayName || 'Your Business',
                            style: 'header'
                        },
                        {
                            text: `Invoice #${invoice.invoiceNumber}`,
                            alignment: 'right',
                            style: 'invoiceNumber'
                        }
                    ],
                    margin: [0, 0, 0, 20]
                },

                // Business info
                {
                    columns: [
                        {
                            width: '50%',
                            stack: [
                                {text: 'From:', style: 'label'},
                                userProfile.businessName || userProfile.displayName || '',
                                userProfile.address || '',
                                userProfile.phone ? `Phone: ${userProfile.phone}` : '',
                                userProfile.email ? `Email: ${userProfile.email}` : '',
                                userProfile.website ? `Website: ${userProfile.website}` : '',
                                userProfile.businessName && userProfile.address ? `GSTIN: ${(userProfile as any).gstin || 'N/A'}` : ''
                            ].filter(Boolean)
                        },
                        {
                            width: '50%',
                            stack: [
                                {text: 'To:', style: 'label'},
                                invoice.client.name,
                                invoice.client.address,
                                invoice.client.email,
                                invoice.client.phone ? `Phone: ${invoice.client.phone}` : '',
                                invoice.client.gstin ? `GSTIN: ${invoice.client.gstin}` : ''
                            ].filter(Boolean)
                        }
                    ],
                    margin: [0, 0, 0, 30]
                },

                // Invoice details
                {
                    columns: [
                        {
                            text: `Issue Date: ${format(invoice.issueDate, 'MMM dd, yyyy')}`,
                        },
                        {
                            text: `Due Date: ${format(invoice.dueDate, 'MMM dd, yyyy')}`,
                            alignment: 'right'
                        }
                    ],
                    margin: [0, 0, 0, 20]
                },

                // Items table
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                {text: 'Description', style: 'tableHeader'},
                                {text: 'Qty', style: 'tableHeader', alignment: 'center'},
                                {text: 'Rate', style: 'tableHeader', alignment: 'right'},
                                {text: 'Amount', style: 'tableHeader', alignment: 'right'}
                            ],
                            ...invoice.items.map(item => [
                                item.description,
                                {text: item.quantity.toString(), alignment: 'center'},
                                {text: `₹${item.rate.toFixed(2)}`, alignment: 'right'},
                                {text: `₹${item.amount.toFixed(2)}`, alignment: 'right'}
                            ])
                        ]
                    },
                    margin: [0, 0, 0, 20]
                },

                // Totals
                {
                    columns: [
                        {width: '60%', text: ''},
                        {
                            width: '40%',
                            table: {
                                widths: ['*', 'auto'],
                                body: [
                                    ['Subtotal:', `₹${invoice.subtotal.toFixed(2)}`],
                                    [`Tax (${invoice.taxRate}%):`, `₹${invoice.taxAmount.toFixed(2)}`],
                                    [
                                        {text: 'Total:', style: 'totalLabel'},
                                        {text: `₹${invoice.total.toFixed(2)}`, style: 'totalAmount'}
                                    ]
                                ]
                            },
                            layout: 'noBorders'
                        }
                    ]
                },

                // Notes
                invoice.notes ? {
                    text: [
                        {text: 'Notes:\n', style: 'label'},
                        invoice.notes
                    ],
                    margin: [0, 30, 0, 0]
                } : {}
            ],

            styles: {
                header: {
                    fontSize: 20,
                    bold: true,
                    color: '#2563eb'
                },
                invoiceNumber: {
                    fontSize: 16,
                    bold: true
                },
                label: {
                    fontSize: 12,
                    bold: true,
                    margin: [0, 0, 0, 5]
                },
                tableHeader: {
                    bold: true,
                    fillColor: '#f3f4f6',
                    margin: [0, 5, 0, 5]
                },
                totalLabel: {
                    bold: true,
                    fontSize: 12
                },
                totalAmount: {
                    bold: true,
                    fontSize: 12,
                    alignment: 'right'
                }
            },

            defaultStyle: {
                fontSize: 10
            }
        };

        pdfMake.createPdf(docDefinition).getBlob((blob) => {
            resolve(blob);
        });
    });
};