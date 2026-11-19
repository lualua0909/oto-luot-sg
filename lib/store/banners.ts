import { adminSaveBanners, getBannersAction } from "@/lib/actions";
import { unwrap } from "@/lib/action-result";
import type { BannerSlide } from "@/lib/banners";
import { idToken } from "./session";

export const getBanners = () => getBannersAction();

export async function saveBanners(slides: BannerSlide[]): Promise<void> {
  await unwrap(adminSaveBanners(await idToken(), slides));
}
