import { CarForm } from "@/components/admin/car-form";

export default function NewCarPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold">Thêm xe mới</h1>
        <p className="text-sm text-muted-foreground">Điền thông tin và tải ảnh xe để đăng bán.</p>
      </div>
      <CarForm />
    </div>
  );
}
