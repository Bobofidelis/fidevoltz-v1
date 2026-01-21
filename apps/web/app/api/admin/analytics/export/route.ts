import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

// Helper to escape CSV fields
const escapeCsv = (field: any) => {
  if (field === null || field === undefined) return '';
  const stringField = String(field);
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'orders'; // orders, users, products
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : new Date();

    let csvContent = '';
    let filename = `export-${type}-${format(new Date(), 'yyyy-MM-dd')}.csv`;

    if (type === 'orders') {
      const orders = await prisma.order.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });

      const headers = ['Order ID', 'Date', 'Customer Name', 'Customer Email', 'Status', 'Total', 'Payment Status'];
      const rows = orders.map(order => [
        order.id,
        format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        order.user?.name || 'Guest',
        order.user?.email || 'N/A',
        order.status,
        order.totalAmount,
        order.paymentStatus,
      ]);

      csvContent = [headers.join(','), ...rows.map(row => row.map(escapeCsv).join(','))].join('\n');

    } else if (type === 'users') {
      const users = await prisma.user.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        orderBy: { createdAt: 'desc' },
      });

      const headers = ['User ID', 'Name', 'Email', 'Role', 'Joined Date', 'Status'];
      const rows = users.map(user => [
        user.id,
        user.name,
        user.email,
        user.role,
        format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        user.status,
      ]);

      csvContent = [headers.join(','), ...rows.map(row => row.map(escapeCsv).join(','))].join('\n');

    } else if (type === 'products') {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const headers = ['Product ID', 'Name', 'Price', 'Stock', 'Status', 'Created Date'];
      const rows = products.map(product => [
        product.id,
        product.name,
        product.price,
        product.stock,
        product.status,
        format(new Date(product.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      ]);

      csvContent = [headers.join(','), ...rows.map(row => row.map(escapeCsv).join(','))].join('\n');
    } else {
      return new NextResponse('Invalid export type', { status: 400 });
    }

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error: any) {
    console.error('[EXPORT API] Error:', error);
    return new NextResponse('Export failed', { status: 500 });
  }
}
