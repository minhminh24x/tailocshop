import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMustChangePassword() {
    console.log('Setting mustChangePassword...');

    // CHỈ Admin được bỏ qua đổi mật khẩu
    const adminResult = await prisma.user.updateMany({
        where: {
            role: 'ADMIN'
        },
        data: {
            mustChangePassword: false
        }
    });
    console.log(`Admin: Updated ${adminResult.count} users to mustChangePassword=false`);

    // Staff và Supplier PHẢI đổi mật khẩu lần đầu
    const staffResult = await prisma.user.updateMany({
        where: {
            role: {
                in: ['STAFF', 'SUPPLIER']
            }
        },
        data: {
            mustChangePassword: true
        }
    });
    console.log(`Staff/Supplier: Updated ${staffResult.count} users to mustChangePassword=true`);

    // Customer cũng không cần đổi (họ tự đăng ký với mật khẩu của họ)
    const customerResult = await prisma.user.updateMany({
        where: {
            role: 'CUSTOMER'
        },
        data: {
            mustChangePassword: false
        }
    });
    console.log(`Customer: Updated ${customerResult.count} users to mustChangePassword=false`);

    await prisma.$disconnect();
}

fixMustChangePassword()
    .catch(e => {
        console.error('Error:', e);
        prisma.$disconnect();
        process.exit(1);
    });
