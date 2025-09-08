/**
 * Invoice Management System - Type Definitions
 *
 * This file contains TypeScript interfaces for a complete invoice management system.
 * It includes user management, client management, and invoice generation functionality.
 */

/**
 * Represents a user/business owner in the system
 *
 * @interface User
 * @description Core user entity that represents a business owner or freelancer using the invoice system
 */
export interface User {
    /** Unique identifier for the user */
    uid: string;

    /** User's email address (required for authentication and communication) */
    email: string;

    /** Display name for the user (optional, can be different from business name) */
    displayName?: string;

    /** Legal business name (optional, for sole proprietors might be same as displayName) */
    businessName?: string;

    /** Business address for invoice headers and legal purposes */
    address?: string;

    /** Contact phone number */
    phone?: string;

    /** Business website URL */
    website?: string;

    /** Business logo URL or file path for branding on invoices */
    logo?: string;
}

/**
 * Represents a client/customer in the system
 *
 * @interface Client
 * @description Entity representing customers who will receive invoices
 */
export interface Client {
    /** Unique identifier for the client */
    id: string;

    /** Reference to the user who owns this client record */
    userId: string;

    /** Client's business or individual name */
    name: string;

    /** Client's primary email address for sending invoices */
    email: string;

    /** Client's contact phone number (optional) */
    phone?: string;

    /** Client's billing address (required for invoice generation) */
    address: string;

    /** GST Identification Number for Indian businesses (optional) */
    gstin?: string;

    /** Timestamp when the client record was created */
    createdAt: Date;

    /** Timestamp when the client record was last updated */
    updatedAt: Date;
}

/**
 * Represents a line item in an invoice
 *
 * @interface InvoiceItem
 * @description Individual product or service item within an invoice
 */
export interface InvoiceItem {
    /** Unique identifier for the invoice item */
    id: string;

    /** Description of the product or service */
    description: string;

    /** Quantity of items/hours (must be positive number) */
    quantity: number;

    /** Rate per unit/hour (price per single quantity) */
    rate: number;

    /** Total amount for this line item (quantity * rate) */
    amount: number;
}

/**
 * Invoice status enumeration
 *
 * @description Represents the current state of an invoice in the workflow
 */
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

/**
 * Main invoice entity
 *
 * @interface Invoice
 * @description Complete invoice record with all associated data
 */
export interface Invoice {
    /** Unique identifier for the invoice */
    id: string;

    /** Reference to the user who created this invoice */
    userId: string;

    /** Human-readable invoice number (e.g., "INV-001", "2024-001") */
    invoiceNumber: string;

    /** Reference to the client receiving this invoice */
    clientId: string;

    /** Complete client information (populated from clientId) */
    client: Client;

    /** Array of line items in the invoice */
    items: InvoiceItem[];

    /** Sum of all line item amounts (before tax) */
    subtotal: number;

    /** Tax rate as decimal (e.g., 0.18 for 18% GST) */
    taxRate: number;

    /** Calculated tax amount (subtotal * taxRate) */
    taxAmount: number;

    /** Final total amount (subtotal + taxAmount) */
    total: number;

    /** Current status of the invoice */
    status: InvoiceStatus;

    /** Date when the invoice was issued */
    issueDate: Date;

    /** Date when payment is due */
    dueDate: Date;

    /** Optional additional notes or terms */
    notes?: string;

    /** Timestamp when the invoice was created */
    createdAt: Date;

    /** Timestamp when the invoice was last updated */
    updatedAt: Date;

    /** URL to generated PDF version of the invoice (if available) */
    pdfUrl?: string;
}

/**
 * Interface for creating a new invoice (excludes auto-generated fields)
 *
 * @interface CreateInvoiceRequest
 * @description Data structure for invoice creation API requests
 */
export interface CreateInvoiceRequest {
    /** Reference to the client receiving this invoice */
    clientId: string;

    /** Array of line items in the invoice */
    items: Omit<InvoiceItem, 'id'>[];

    /** Tax rate as decimal */
    taxRate: number;

    /** Date when the invoice was issued */
    issueDate: Date;

    /** Date when payment is due */
    dueDate: Date;

    /** Optional additional notes or terms */
    notes?: string;
}

/**
 * Interface for updating an existing invoice
 *
 * @interface UpdateInvoiceRequest
 * @description Data structure for invoice update API requests
 */
export interface UpdateInvoiceRequest {
    /** Reference to the client receiving this invoice */
    clientId?: string;

    /** Array of line items in the invoice */
    items?: Omit<InvoiceItem, 'id'>[];

    /** Tax rate as decimal */
    taxRate?: number;

    /** Current status of the invoice */
    status?: InvoiceStatus;

    /** Date when the invoice was issued */
    issueDate?: Date;

    /** Date when payment is due */
    dueDate?: Date;

    /** Optional additional notes or terms */
    notes?: string;
}

/**
 * Interface for invoice summary/listing views
 *
 * @interface InvoiceSummary
 * @description Lightweight invoice data for lists and summaries
 */
export interface InvoiceSummary {
    /** Unique identifier for the invoice */
    id: string;

    /** Human-readable invoice number */
    invoiceNumber: string;

    /** Client name (denormalized for performance) */
    clientName: string;

    /** Final total amount */
    total: number;

    /** Current status of the invoice */
    status: InvoiceStatus;

    /** Date when the invoice was issued */
    issueDate: Date;

    /** Date when payment is due */
    dueDate: Date;
}

/**
 * Interface for dashboard statistics
 *
 * @interface InvoiceStats
 * @description Summary statistics for dashboard display
 */
export interface InvoiceStats {
    /** Total number of invoices */
    totalInvoices: number;

    /** Number of paid invoices */
    paidInvoices: number;

    /** Number of pending invoices */
    pendingInvoices: number;

    /** Number of overdue invoices */
    overdueInvoices: number;

    /** Total amount of all invoices */
    totalAmount: number;

    /** Total amount of paid invoices */
    paidAmount: number;

    /** Total amount of pending invoices */
    pendingAmount: number;

    /** Total amount of overdue invoices */
    overdueAmount: number;
}

/**
 * Type guard to check if an invoice is overdue
 *
 * @param invoice - The invoice to check
 * @returns True if the invoice is overdue
 */
export function isInvoiceOverdue(invoice: Invoice): boolean {
    return invoice.status !== 'paid' && new Date() > invoice.dueDate;
}

/**
 * Utility function to calculate invoice totals
 *
 * @param items - Array of invoice items
 * @param taxRate - Tax rate as decimal
 * @returns Object with subtotal, taxAmount, and total
 */
export function calculateInvoiceTotals(items: InvoiceItem[], taxRate: number): {
    subtotal: number;
    taxAmount: number;
    total: number;
} {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
}