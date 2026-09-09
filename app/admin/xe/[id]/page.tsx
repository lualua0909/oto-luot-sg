"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CarForm } from "@/components/admin/car-form";
import { getCarById } from "@/lib/firebase/cars";
import { Car } from "@/lib/types";

export default function EditCarPage() {
  const params = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const c = await getCarById(params.id);
        if (!c) setNotFound(true);
        else setCar(c);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !car) {
    return <p className="text-center text-muted-foreground">Không tìm thấy xe này.</p>;
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold">Sửa thông tin xe</h1>
        <p className="text-sm text-muted-foreground">{car.title}</p>
      </div>
      <CarForm car={car} />
    </div>
  );
}
