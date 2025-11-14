import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: {
      mustChangePassword: false, // hoặc false nếu bạn muốn ép toàn bộ
    },
    data: {
      mustChangePassword: true,
    },
  });

  console.log("Đã cập nhật mustChangePassword cho user cũ");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
